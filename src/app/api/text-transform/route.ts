import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const { text, action, model, max_tokens, temperature } = await req.json()

  const prompts: Record<string, string> = {
    "make-longer": `Expand this text: "${text}"`,
    improve: `Improve this text: "${text}"`,
    // Add more actions as needed
  }

  const prompt = prompts[action] || `Transform this text: "${text}"`

  const openRouterRes = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens,
        temperature,
        stream: true,
      }),
    }
  )

  const stream = new ReadableStream({
    async start(controller) {
      const reader = openRouterRes.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) {
        controller.close()
        return
      }
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        // Here, transform OpenRouter stream chunks to SSE format
        // For demonstration, just wrap chunk as content
        controller.enqueue(
          `data: ${JSON.stringify({ type: "content", content: chunk })}\n\n`
        )
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  })
}
