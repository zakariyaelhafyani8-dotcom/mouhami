import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
} from "docx";

export class DocxBuilder {
  async buildFromTemplate(filledTemplate: string, title: string): Promise<Buffer> {
    const paragraphs: Paragraph[] = [];
    const lines = filledTemplate.split("\n");

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      const trimmed = line.trim();

      if (!trimmed) {
        paragraphs.push(this.emptyLine(60));
        continue;
      }

      if (trimmed.startsWith("---")) {
        paragraphs.push(this.sectionDivider());
        continue;
      }

      if (trimmed.startsWith("# ")) {
        paragraphs.push(this.title(trimmed.replace("# ", "")));
        continue;
      }

      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        paragraphs.push(this.sectionHeader(trimmed.replace(/\*\*/g, "")));
        continue;
      }

      if (trimmed.includes(":**") || (trimmed.includes(":") && !trimmed.includes("{{"))) {
        const colonIdx = trimmed.indexOf(":");
        const label = trimmed.substring(0, colonIdx).trim();
        const value = trimmed.substring(colonIdx + 1).trim();
        if (label && value) {
          paragraphs.push(this.fieldLine(label, value));
          continue;
        }
      }

      paragraphs.push(this.bodyText(trimmed));
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
              size: {
                width: 12240,
                height: 15840,
              },
            },
          },
          children: paragraphs,
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }

  private emptyLine(spacing: number = 60): Paragraph {
    return new Paragraph({ spacing: { after: spacing } });
  }

  private sectionDivider(): Paragraph {
    return new Paragraph({
      spacing: { before: 200, after: 200 },
    });
  }

  private title(text: string): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text,
          bold: true,
          size: 36,
          font: "Tajawal",
        }),
      ],
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      spacing: { before: 400, after: 300 },
    });
  }

  private sectionHeader(text: string): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text,
          bold: true,
          size: 28,
          font: "Tajawal",
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { before: 300, after: 150 },
    });
  }

  private fieldLine(label: string, value: string): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: label,
          bold: true,
          size: 24,
          font: "Tajawal",
        }),
        new TextRun({
          text: "  " + value,
          size: 24,
          font: "Tajawal",
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 80 },
    });
  }

  private bodyText(text: string): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text,
          size: 24,
          font: "Tajawal",
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 120 },
      indent: { right: 200 },
    });
  }
}

export const docxBuilder = new DocxBuilder();
