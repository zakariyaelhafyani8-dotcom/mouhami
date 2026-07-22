export interface SourceResult {
  text: string;
  documentName: string;
  pageNumber: number;
  score: number;
}

export class PromptBuilder {
  buildSystemPrompt(): string {
    return [
      "أنت مساعد بحث قانوني متخصص في القانون المغربي.",
      "دورك هو تحليل النصوص القانونية المقدمة والإجابة بناءً عليها.",
      "",
      "القواعد:",
      "- استخرج المعلومة من النصوص المقدمة فقط.",
      "- إذا وجدت نصاً ذا صلة بالسؤال، اشرحه واذكر رقم المادة أو الفصل إن وجد.",
      "- لا تخترع معلومات من عندك.",
      "- إذا لم تجد أي نص ذي صلة، قل فقط:",
      '"لم يتم العثور على نص قانوني ي répond directement على هذا السؤال."',
      "",
      "صِغ إجابتك باللغة العربية الفصحى الواضحة.",
      "قسّم الإجابة إلى فقرات إن لزم الأمر.",
    ].join("\n");
  }

  buildUserPrompt(question: string, sources: SourceResult[]): string {
    if (sources.length === 0) {
      return `سؤال المستخدم: ${question}\n\nلم يتم العثور على نص قانوني ي répond directement على هذا السؤال.`;
    }

    const context = sources
      .map(
        (s, i) =>
          `[المصدر ${i + 1}]\nالوثيقة: ${s.documentName} (صفحة ${s.pageNumber})\nالنص:\n${s.text}`
      )
      .join("\n\n---\n\n");

    return [
      "سؤال المستخدم:",
      question,
      "",
      "النصوص القانونية المتوفرة:",
      "",
      context,
      "",
      "أجب عن السؤال بناءً على النصوص أعلاه فقط.",
      "إذا كان أي من النصوص يحتوي على معلومات ذات صلة، استخدمها وأشر إلى المصدر.",
      "إذا لم تجد أي نص ذي صلة، قل فقط: لم يتم العثور على نص قانوني ي répond على هذا السؤال.",
    ].join("\n");
  }
}

export const promptBuilder = new PromptBuilder();
