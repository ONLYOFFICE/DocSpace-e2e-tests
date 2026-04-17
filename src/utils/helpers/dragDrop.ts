import { Page } from "@playwright/test";
import path from "path";
import fs from "fs";

const DROP_ZONE = ".drag-and-drop";

async function waitForDropZone(page: Page): Promise<void> {
  await page.locator(DROP_ZONE).waitFor({ state: "attached", timeout: 10000 });
}

async function waitForThirdPartyCapabilities(page: Page): Promise<void> {
  await page.waitForResponse(
    (r) =>
      r.url().includes("/files/thirdparty/capabilities") && r.status() === 200,
    { timeout: 15000 },
  );
}

async function restoreWebkitEntryMock(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = globalThis as unknown as Record<string, unknown>;
    const desc = w.__origWebkitGetAsEntryDescriptor as
      | PropertyDescriptor
      | undefined;
    if (desc) {
      Object.defineProperty(
        DataTransferItem.prototype,
        "webkitGetAsEntry",
        desc,
      );
    }
    delete w.__origWebkitGetAsEntryDescriptor;
  });
}

/**
 * Simulates dropping a single file onto the DocSpace drop zone.
 *
 * NOTE: page.dispatchEvent with a DataTransfer JSHandle does NOT work here
 * because browsers ignore the `dataTransfer` field in the DragEvent
 * constructor — it can only be set via Object.defineProperty after creation.
 * We therefore dispatch all drag events inside page.evaluate so we can use
 * that workaround.
 *
 * waitForThirdPartyCapabilities is registered before any events fire to
 * avoid a race where the response arrives before the listener is set up.
 */
export async function dropFile(page: Page, filePath: string): Promise<void> {
  const resolvedPath = path.resolve(process.cwd(), filePath);
  const buffer = fs.readFileSync(resolvedPath);
  const fileName = path.basename(resolvedPath);

  await waitForDropZone(page);

  const dispatchDragEvent = (type: string) =>
    page.evaluate(
      ({ buffer, fileName, type }) => {
        const dz = document.querySelector(".drag-and-drop");
        if (!dz) throw new Error("Drop zone (.drag-and-drop) not found");
        const dt = new DataTransfer();
        dt.items.add(
          new File([new Uint8Array(buffer)], fileName, {
            type: "application/octet-stream",
          }),
        );
        const event = new DragEvent(type, { bubbles: true, cancelable: true });
        Object.defineProperty(event, "dataTransfer", { value: dt });
        dz.dispatchEvent(event);
      },
      { buffer: [...buffer], fileName, type },
    );

  const capabilitiesReady = waitForThirdPartyCapabilities(page);
  await dispatchDragEvent("dragenter");
  await dispatchDragEvent("dragover");
  await capabilitiesReady;
  await dispatchDragEvent("drop");
}

/**
 * Simulates dropping an empty folder onto the DocSpace drop zone.
 *
 * WARNING: requires monkey-patching DataTransferItem.prototype.webkitGetAsEntry
 * to return a directory entry, because browsers do not expose a public API for
 * this. Uses Object.defineProperty so the patch works even when the property is
 * non-writable (as in WebKit). The patch is wrapped in try/finally so the
 * prototype is always restored even if an error occurs mid-sequence.
 *
 * NOTE: the resulting test is skipped in the spec because DocSpace has a known
 * issue where the upload loader hangs indefinitely for empty folders (no
 * finalize callback is ever fired). Keep this function for future use if the
 * product bug is fixed.
 */
export async function dropFolder(
  page: Page,
  folderName: string,
): Promise<void> {
  await waitForDropZone(page);

  await page.evaluate((name) => {
    const g = globalThis as unknown as Record<string, unknown>;
    g.__origWebkitGetAsEntryDescriptor = Object.getOwnPropertyDescriptor(
      DataTransferItem.prototype,
      "webkitGetAsEntry",
    );
    const orig = DataTransferItem.prototype.webkitGetAsEntry;
    Object.defineProperty(DataTransferItem.prototype, "webkitGetAsEntry", {
      value: function (this: DataTransferItem) {
        if (!this.getAsFile()) return orig.call(this);
        return {
          isFile: false,
          isDirectory: true,
          name,
          fullPath: "/" + name,
          filesystem: null,
          createReader: () => ({
            readEntries: (cb: (entries: FileSystemEntry[]) => void) => cb([]),
          }),
        } as unknown as FileSystemDirectoryEntry;
      },
      writable: true,
      configurable: true,
    });
  }, folderName);

  const dispatchDragEvent = (type: string) =>
    page.evaluate(
      ({ folderName, type }) => {
        const dz = document.querySelector(".drag-and-drop");
        if (!dz) throw new Error("Drop zone (.drag-and-drop) not found");
        const dt = new DataTransfer();
        dt.items.add(new File([], folderName));
        const event = new DragEvent(type, { bubbles: true, cancelable: true });
        Object.defineProperty(event, "dataTransfer", { value: dt });
        dz.dispatchEvent(event);
      },
      { folderName, type },
    );

  try {
    const capabilitiesReady = waitForThirdPartyCapabilities(page);
    await dispatchDragEvent("dragenter");
    await dispatchDragEvent("dragover");
    await capabilitiesReady;
    await dispatchDragEvent("drop");
  } finally {
    await restoreWebkitEntryMock(page);
  }
}

/**
 * Simulates dropping a folder that contains files onto the DocSpace drop zone.
 * Reads file contents from disk and reconstructs the directory tree via the
 * webkitGetAsEntry mock so DocSpace processes them as a folder upload.
 *
 * The same WebKit prototype caveat as dropFolder applies here.
 * After drop, waits for the /finalize API response that signals upload
 * completion before returning.
 */
export async function dropFolderWithFiles(
  page: Page,
  folderPath: string,
): Promise<void> {
  const resolvedPath = path.resolve(process.cwd(), folderPath);
  const folderName = path.basename(resolvedPath);
  const fileEntries = fs.readdirSync(resolvedPath).map((name) => ({
    name,
    buffer: [...fs.readFileSync(path.join(resolvedPath, name))],
  }));

  await waitForDropZone(page);

  await page.evaluate(
    ({ folderName, fileEntries }) => {
      const g = globalThis as unknown as Record<string, unknown>;
      g.__origWebkitGetAsEntryDescriptor = Object.getOwnPropertyDescriptor(
        DataTransferItem.prototype,
        "webkitGetAsEntry",
      );
      const orig = DataTransferItem.prototype.webkitGetAsEntry;
      Object.defineProperty(DataTransferItem.prototype, "webkitGetAsEntry", {
        value: function (this: DataTransferItem) {
          if (!this.getAsFile()) return orig.call(this);
          const children = fileEntries.map(
            ({ name, buffer }: { name: string; buffer: number[] }) => ({
              isFile: true,
              isDirectory: false,
              name,
              fullPath: `/${folderName}/${name}`,
              filesystem: null,
              file: (cb: (f: File) => void) =>
                cb(new File([new Uint8Array(buffer)], name)),
            }),
          );
          return {
            isFile: false,
            isDirectory: true,
            name: folderName,
            fullPath: "/" + folderName,
            filesystem: null,
            createReader: () => {
              let served = false;
              return {
                readEntries: (cb: (entries: FileSystemEntry[]) => void) => {
                  if (!served) {
                    served = true;
                    cb(children as unknown as FileSystemEntry[]);
                  } else {
                    cb([]);
                  }
                },
              };
            },
          } as unknown as FileSystemDirectoryEntry;
        },
        writable: true,
        configurable: true,
      });
    },
    { folderName, fileEntries },
  );

  const dispatchDragEvent = (type: string) =>
    page.evaluate(
      ({ folderName, type }) => {
        const dz = document.querySelector(".drag-and-drop");
        if (!dz) throw new Error("Drop zone (.drag-and-drop) not found");
        const dt = new DataTransfer();
        dt.items.add(new File([], folderName));
        const event = new DragEvent(type, { bubbles: true, cancelable: true });
        Object.defineProperty(event, "dataTransfer", { value: dt });
        dz.dispatchEvent(event);
      },
      { folderName, type },
    );

  try {
    const capabilitiesReady = waitForThirdPartyCapabilities(page);
    await dispatchDragEvent("dragenter");
    await dispatchDragEvent("dragover");
    await capabilitiesReady;

    const finalizeResponse = page.waitForResponse(
      (r) => r.url().includes("finalize") && r.status() === 201,
      { timeout: 30000 },
    );
    await dispatchDragEvent("drop");
    await finalizeResponse;
  } finally {
    await restoreWebkitEntryMock(page);
  }
}
