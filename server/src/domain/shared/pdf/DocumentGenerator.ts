export interface GeneratedDocument {
  filename: string;
  mimeType: string;
  content: string; // HTML string or Base64 binary content representation
}

export interface DocumentGenerator {
  generate(data: any): Promise<GeneratedDocument>;
}
