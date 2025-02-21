import PDFDocument from "pdfkit";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { Document, Packer, Paragraph } from "docx";
import Excel from "xlsx";
import PptxGenJS from "pptxgenjs";

class FileGenerator {
  static async createTempDir() {
    return fs.mkdtemp(path.join(os.tmpdir(), "test-files-"));
  }

  static async generatePDF(options = {}) {
    const tempDir = await this.createTempDir();
    const filePath = path.join(tempDir, options.filename || "test.pdf");

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream(filePath));

      // Add content
      doc.fontSize(25).text(options.title || "Test PDF Document", 100, 100);
      doc
        .fontSize(12)
        .text(
          options.content ||
            "This is an automatically generated PDF file for testing purposes.",
          100,
          150,
        );
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 100, 200);

      doc.end();
      doc.on("end", () => resolve(filePath));
      doc.on("error", reject);
    });
  }

  static async generateDOCX(options = {}) {
    const tempDir = await this.createTempDir();
    const filePath = path.join(tempDir, options.filename || "test.docx");

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: options.title || "Test DOCX Document",
            }),
            new Paragraph({
              text:
                options.content ||
                "This is an automatically generated DOCX file for testing purposes.",
            }),
            new Paragraph({
              text: `Generated on: ${new Date().toLocaleString()}`,
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    await fs.writeFile(filePath, buffer);
    return filePath;
  }

  static async generateXLSX(options = {}) {
    const tempDir = await this.createTempDir();
    const filePath = path.join(tempDir, options.filename || "test.xlsx");

    const workbook = Excel.utils.book_new();
    const data = [
      ["Title", options.title || "Test XLSX Document"],
      [
        "Content",
        options.content ||
          "This is an automatically generated XLSX file for testing purposes.",
      ],
      ["Generated on", new Date().toLocaleString()],
    ];

    const worksheet = Excel.utils.aoa_to_sheet(data);
    Excel.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    await Excel.writeFile(workbook, filePath);
    return filePath;
  }

  static async generatePPTX(options = {}) {
    const tempDir = await this.createTempDir();
    const filePath = path.join(tempDir, options.filename || "test.pptx");

    const pres = new PptxGenJS();
    const slide = pres.addSlide();

    slide.addText(options.title || "Test PPTX Document", {
      x: 1,
      y: 1,
      fontSize: 24,
    });

    slide.addText(
      options.content ||
        "This is an automatically generated PPTX file for testing purposes.",
      {
        x: 1,
        y: 2,
        fontSize: 14,
      },
    );

    slide.addText(`Generated on: ${new Date().toLocaleString()}`, {
      x: 1,
      y: 3,
      fontSize: 12,
    });

    await pres.writeFile({ fileName: filePath });
    return filePath;
  }

  static async generateFile(type, options = {}) {
    let filePath;
    switch (type.toLowerCase()) {
      case "pdf":
        filePath = await this.generatePDF(options);
        break;
      case "docx":
        filePath = await this.generateDOCX(options);
        break;
      case "xlsx":
        filePath = await this.generateXLSX(options);
        break;
      case "pptx":
        filePath = await this.generatePPTX(options);
        break;
      default:
        throw new Error(`Unsupported file type: ${type}`);
    }
    return filePath;
  }

  static async cleanup(filePath) {
    try {
      await fs.remove(path.dirname(filePath));
    } catch (error) {
      console.error("Error cleaning up temporary file:", error);
    }
  }
}

export default FileGenerator;
