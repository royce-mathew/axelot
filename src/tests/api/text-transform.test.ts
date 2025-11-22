import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "@/app/api/text-transform/route"
import { NextRequest } from "next/server"

// Mock global fetch
global.fetch = vi.fn()

describe("Text Transform API", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should successfully transform text with 'make-longer' action", async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("Expanded text content"))
        controller.close()
      },
    })

    ;(global.fetch as any).mockResolvedValue({
      body: mockStream,
    })

    const req = new NextRequest("http://localhost/api/text-transform", {
      method: "POST",
      body: JSON.stringify({
        text: "Short text",
        action: "make-longer",
        model: "gpt-3.5-turbo",
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(res.headers.get("Content-Type")).toBe("text/event-stream")

    // Verify fetch was called with correct prompt
    expect(global.fetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('Expand this text: \\"Short text\\"'),
      })
    )
  })

  it("should successfully transform text with 'improve' action", async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("Improved text content"))
        controller.close()
      },
    })

    ;(global.fetch as any).mockResolvedValue({
      body: mockStream,
    })

    const req = new NextRequest("http://localhost/api/text-transform", {
      method: "POST",
      body: JSON.stringify({
        text: "Bad text",
        action: "improve",
        model: "gpt-3.5-turbo",
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    // Verify fetch was called with correct prompt
    expect(global.fetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('Improve this text: \\"Bad text\\"'),
      })
    )
  })
})
