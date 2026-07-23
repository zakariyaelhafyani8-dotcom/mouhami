declare module "pdf-parse" {
  interface PDFInfo {
    [key: string]: any;
  }
  interface PDFData {
    text: string;
    numpages: number;
    info: PDFInfo;
  }
  type PDFParseFn = (dataBuffer: Buffer) => Promise<PDFData>;
  const pdfParse: PDFParseFn;
  export default pdfParse;
}

declare module "docx" {
  interface IParagraphOptions {
    text?: string;
    heading?: string;
    alignment?: string;
    bidirectional?: boolean;
    spacing?: { before?: number; after?: number };
    indent?: { right?: number };
    children?: ITextRunOptions[];
  }
  interface ITextRunOptions {
    text?: string;
    bold?: boolean;
    size?: number;
    font?: string;
  }
  interface IDocumentSection {
    properties?: any;
    children: any[];
  }
  interface IDocumentOptions {
    sections: IDocumentSection[];
  }

  export class Document {
    constructor(options: IDocumentOptions);
  }

  export class Packer {
    static toBuffer(doc: Document): Promise<Buffer>;
  }

  export class Paragraph {
    constructor(options: IParagraphOptions);
  }

  export class TextRun {
    constructor(options: ITextRunOptions);
  }

  export const AlignmentType: {
    CENTER: string;
    RIGHT: string;
    LEFT: string;
    JUSTIFIED: string;
  };

  export const HeadingLevel: {
    HEADING_1: string;
    HEADING_2: string;
    HEADING_3: string;
    TITLE: string;
  };
}

declare module "ollama" {
  interface Message {
    role: string;
    content: string;
  }
  interface ChatOptions {
    model: string;
    messages: Message[];
    options?: { temperature?: number };
    stream?: boolean;
  }
  interface ChatResponse {
    message: Message;
  }
  interface EmbeddingOptions {
    model: string;
    prompt: string;
  }
  interface EmbeddingResponse {
    embedding: number[];
  }
  interface ModelInfo {
    name: string;
  }
  interface ListResponse {
    models: ModelInfo[];
  }

  const ollama: {
    chat(options: ChatOptions): Promise<ChatResponse> | AsyncIterable<ChatResponse>;
    embeddings(options: EmbeddingOptions): Promise<EmbeddingResponse>;
    list(): Promise<ListResponse>;
  };

  export default ollama;
}
