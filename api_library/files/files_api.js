import log from '../../utils/logger.js';

export class FilesApi {
  constructor(apiContext, portalDomain, getAuthHeaders) {
    this.apiContext = apiContext;
    this.baseURL = `https://${portalDomain}/api/2.0`;
    this.getAuthHeaders = getAuthHeaders;
  }

  // Get all content of "My Documents" with pagination
  async getAllContentOfMyDocs() {
    log.debug('Fetching all content of My Documents');

    let allFiles = [];
    let allFolders = [];
    let startIndex = 0;
    const pageSize = 100;

    while (true) {
      const response = await this.apiContext.get(`${this.baseURL}/files/@my`, {
        headers: this.getAuthHeaders(),
        params: { startIndex, count: pageSize },
      });

      if (!response.ok()) {
        throw new Error(
          `Failed to fetch content of My Documents (${response.status()}): ${await response.text()}`
        );
      }

      const { response: content } = await response.json();
      allFiles = allFiles.concat(content.files);
      allFolders = allFolders.concat(content.folders);

      if (content.files.length < pageSize) {
        break;
      }

      startIndex += pageSize;
    }

    log.debug('Total files fetched:', allFiles.length);
    log.debug('Total folders fetched:', allFolders.length);

    return { files: allFiles, folders: allFolders };
  }

  // Delete a file by its ID with retries
  async deleteFileById(fileId, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await this.apiContext.delete(`${this.baseURL}/files/file/${fileId}`, {
          headers: this.getAuthHeaders(),
          data: { Immediately: true },
        });

        if (!response.ok()) {
          throw new Error(`Failed to delete file (${response.status()}): ${await response.text()}`);
        }

        log.debug(`File with ID: ${fileId} deleted successfully`);
        return { statusCode: response.status() };
      } catch (error) {
        log.error(`Attempt ${i + 1}: Failed to delete file with ID: ${fileId}`, error.message);
        if (i === retries - 1) throw error; // Rethrow error after last attempt
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait before retrying
      }
    }
  }

  // Delete all files in "My Documents"
  async deleteAllFilesInMyDocs() {
    const content = await this.getAllContentOfMyDocs();

    // Extract file IDs from the content
    const fileIds = content.files.map((file) => file.id);
    log.debug(`Deleting ${fileIds.length} files...`);

    // Delete each file by its ID
    for (const fileId of fileIds) {
      try {
        await this.deleteFileById(fileId);
        log.debug(`File with ID: ${fileId} deleted successfully`);
        await new Promise((resolve) => setTimeout(resolve, 500)); // Add a delay
      } catch (error) {
        log.error(`Failed to delete file with ID: ${fileId}`, error.message);
      }
    }

    log.debug('All files in My Documents deleted successfully');
  }

  // Delete all folders in "My Documents"
  async deleteAllFoldersInMyDocs() {
    const content = await this.getAllContentOfMyDocs();

    // Extract folder IDs from the content
    const folderIds = content.folders.map((folder) => folder.id);
    log.debug(`Deleting ${folderIds.length} folders...`);

    // Delete each folder by its ID
    for (const folderId of folderIds) {
      try {
        await this.deleteFolderById(folderId);
        log.debug(`Folder with ID: ${folderId} deleted successfully`);
      } catch (error) {
        log.error(`Failed to delete folder with ID: ${folderId}`, error.message);
      }
    }

    log.info('All folders in My Documents deleted successfully');
  }

  // Create a file in "My Documents"
  async createFileInMyDocs(fileName, fileType = 'docx') {
    log.debug(`Creating file: ${fileName}.${fileType} in My Documents`);

    const response = await this.apiContext.post(`${this.baseURL}/files/@my/file`, {
      headers: this.getAuthHeaders(),
      data: {
        title: `${fileName}.${fileType}`,
      },
    });

    if (!response.ok()) {
      throw new Error(`Failed to create file (${response.status()}): ${await response.text()}`);
    }

    const responseBody = await response.json();
    log.info(`File created successfully: ${responseBody.response.id}`);

    return responseBody.response;
  }
}
