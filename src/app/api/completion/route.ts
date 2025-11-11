import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
    const { prompt, model, max_tokens, temperature, stop } = await req.json()

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens,
            temperature,
            stop,
            stream: true
        })
    })

    return new Response(response.body, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
}