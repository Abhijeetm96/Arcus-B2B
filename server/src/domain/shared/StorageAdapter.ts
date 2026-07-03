export interface StorageAdapter {
  uploadFile(entityType: string, entityId: string, filename: string, buffer: Buffer, mimeType: string): Promise<{
    storageKey: string;
    publicUrl: string;
    thumbnailUrl?: string;
    checksum: string;
  }>;
  deleteFile(storageKey: string): Promise<void>;
}

export class LocalStorageAdapter implements StorageAdapter {
  public async uploadFile(
    entityType: string,
    entityId: string,
    filename: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<{
    storageKey: string;
    publicUrl: string;
    thumbnailUrl?: string;
    checksum: string;
  }> {
    const checksum = Math.random().toString(36).substring(7);
    const storageKey = `uploads/${entityType.toLowerCase()}/${entityId}/${filename}`;
    const publicUrl = `/api/attachments/download/${filename}`;
    
    return {
      storageKey,
      publicUrl,
      checksum
    };
  }

  public async deleteFile(storageKey: string): Promise<void> {
    console.log(`[LocalStorageAdapter] Deleting file at: ${storageKey}`);
  }
}
