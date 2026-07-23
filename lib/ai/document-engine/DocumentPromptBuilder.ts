export class DocumentPromptBuilder {
  buildPrompt(
    templateType: string,
    fields: Record<string, string>
  ): string {
    const subject = fields.subject || "";
    const plaintiffName = fields.plaintiffName || fields.clientName || "";
    const defendantName = fields.defendantName || "";
    const rawFacts = fields.facts || "";
    const rawRequests = fields.requests || "";
    const rawLegalArguments = fields.legalArguments || "";

    const lines: string[] = [
      "أنت كاتب قانوني متخصص في صياغة الوثائق القضائية المغربية.",
      "",
      "مهمتك: كتابة أربعة أجزاء قانونية فقط بصيغة JSON.",
      "لا تكتب أي كلمة أو حرف خارج JSON.",
      "لا تكتب عناوين ولا توقيعات ولا تواريخ.",
      "",
      "يجب أن يكون ردك حصراً JSON بهذا التنسيق:",
      "{",
      '  "facts": "نص الوقائع القانونية هنا",',
      '  "requests": "نص الطلبات القانونية هنا",',
      '  "conclusion": "نص الخاتمة القانونية هنا",',
      '  "legalArguments": "نص المناقشة القانونية والأساس القانوني هنا"',
      "}",
      "",
      "=== معلومات المستند ===",
    ];

    const infoFields: { key: string; label: string }[] = [
      { key: "subject", label: "الموضوع" },
      { key: "plaintiffName", label: "المشتكي" },
      { key: "defendantName", label: "المشتكى به" },
      { key: "defendantCapacity", label: "صفة المشتكى به" },
      { key: "tribunal", label: "المحكمة" },
    ];

    for (const { key, label } of infoFields) {
      const val = fields[key];
      if (val) {
        lines.push(label + ": " + val);
      }
    }

    lines.push("");
    lines.push("=== الوقائع المقدمة من العميل ===");
    lines.push(rawFacts || "لم تقدم وقائع محددة.");

    if (rawLegalArguments) {
      lines.push("");
      lines.push("=== المناقشة القانونية المقدمة من العميل ===");
      lines.push(rawLegalArguments);
    }

    if (rawRequests) {
      lines.push("");
      lines.push("=== الطلبات المقدمة من العميل ===");
      lines.push(rawRequests);
    }

    lines.push("");
    lines.push("=== تعليمات ===");
    lines.push("أعد صياغة الوقائع والطلبات بأسلوب قانوني مهني.");
    lines.push("اكتب المناقشة القانونية (legalArguments) بصيغة قانونية متينة تشير إلى النصوص القانونية المغربية إن أمكن.");
    lines.push("أكتب الخاتمة بصيغة قانونية مناسبة.");
    lines.push("أرجع JSON فقط، بدون أي نص آخر.");

    return lines.join("\n");
  }

  extractJsonFromResponse(response: string): {
    facts: string;
    requests: string;
    conclusion: string;
    legalArguments: string;
  } {
    const defaultResult = {
      facts: "",
      requests: "",
      conclusion: "",
      legalArguments: "",
    };

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return defaultResult;

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        facts: parsed.facts || parsed.FACTS || defaultResult.facts,
        requests: parsed.requests || parsed.REQUESTS || defaultResult.requests,
        conclusion: parsed.conclusion || parsed.CONCLUSION || defaultResult.conclusion,
        legalArguments: parsed.legalArguments || parsed.LEGAL_ARGUMENTS || defaultResult.legalArguments,
      };
    } catch {
      return defaultResult;
    }
  }
}

export const documentPromptBuilder = new DocumentPromptBuilder();
