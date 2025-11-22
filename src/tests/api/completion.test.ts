import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "@/app/api/completion/route"
import { NextRequest } from "next/server"

// Mock global fetch
global.fetch = vi.fn()

describe("Completion API", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should successfully generate completion", async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("Completion content"))
        controller.close()
      },
    })

    ;(global.fetch as any).mockResolvedValue({
      body: mockStream,
    })

    const req = new NextRequest("http://localhost/api/completion", {
      method: "POST",
      body: JSON.stringify({
        prompt: "Hello",
        model: "gpt-3.5-turbo",
        max_tokens: 100,
        temperature: 0.7,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8")

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"content":"Hello"'),
      })
    )
  })
})
