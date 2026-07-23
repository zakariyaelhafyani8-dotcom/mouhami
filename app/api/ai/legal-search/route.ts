import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middlewares/auth";

export async function POST(request: NextRequest) {
  try {
    requireAuth(request);
    const { question } = await request.json();
    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: "يرجى كتابة سؤال للبحث في المكتبة القانونية" },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const { legalSearchService } = await import(
            "@/lib/ai/legal-search/legalSearch.service"
          );
          const { sources, fullPrompt } = await legalSearchService.searchSources(question.trim());

          if (sources.length === 0) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ sources: [], answer: "لم يتم العثور على أي نص قانوني مطابق داخل قاعدة المعرفة." })}\n\n`
              )
            );
            controller.close();
            return;
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ sources })}\n\n`)
          );

          let fullAnswer = "";
          try {
            const ollama = (await import("ollama")).default;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const streamRes: any = await ollama.chat({
              model: "qwen2.5:3b",
              messages: [{ role: "user", content: fullPrompt }],
              options: { temperature: 0.1 },
              stream: true,
            });

            for await (const chunk of streamRes.itr) {
              const token = chunk.message?.content || "";
              fullAnswer += token;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ token })}\n\n`)
              );
            }
          } catch {
            fullAnswer = "تعذر الاتصال بالمساعد.";
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, answer: fullAnswer })}\n\n`
            )
          );
          controller.close();
        } catch (err: any) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: err.message || "حدث خطأ" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
