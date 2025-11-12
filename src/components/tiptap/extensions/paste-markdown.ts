import { Extension } from '@tiptap/core'
import { Plugin } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'

// Heuristic: detect if text looks like Markdown (headings, lists, code fences, blockquotes)
function looksLikeMarkdown(text: string): boolean {
  const patterns = [
    /^\s{0,3}#{1,6}\s+/m,        // headings
    /^\s{0,3}[-*+]\s+/m,         // bullets
    /^\s{0,3}\d+\.\s+/m,       // ordered lists
    /^\s{0,3}>\s+/m,             // blockquotes
    /```[\s\S]*?```/m,           // code fences
    /^\s{0,3}(?:---|\*\*\*|___)\s*$/m, // hr
  ]
  return patterns.some((re) => re.test(text))
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Very small markdown to HTML converter for common blocks (no inline emphasis)
function markdownToHtml(md: string): string {
  // Normalize line endings
  const text = md.replace(/\r\n?/g, '\n')

  // First, extract fenced code blocks and replace with placeholders to avoid inner parsing
  const codeBlocks: string[] = []
  let replaced = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (_m, lang, code) => {
    const idx = codeBlocks.push(`<pre><code class="language-${lang ? String(lang) : 'plaintext'}">${escapeHtml(code)}</code></pre>`) - 1
    return `@@CODEBLOCK_${idx}@@`
  })

  // Split into lines for block parsing
  const lines = replaced.split('\n')
  const out: string[] = []
  let i = 0

  const flushParagraph = (buf: string[]) => {
    if (buf.length === 0) return
    const content = escapeHtml(buf.join(' ').trim())
    if (content) out.push(`<p>${content}</p>`) 
    buf.length = 0
  }

  const parseList = (ordered: boolean): string => {
    const tag = ordered ? 'ol' : 'ul'
    const itemRe = ordered ? /^\s{0,3}\d+\.\s+(.*)$/ : /^\s{0,3}[-*+]\s+(.*)$/
    const items: string[] = []
    while (i < lines.length) {
      const m = lines[i].match(itemRe)
      if (!m) break
      items.push(`<li>${escapeHtml(m[1])}</li>`) 
      i++
    }
    return `<${tag}>${items.join('')}</${tag}>`
  }

  const paraBuf: string[] = []

  while (i < lines.length) {
    const line = lines[i]
    // Horizontal rule
    if (/^\s{0,3}(?:---|\*\*\*|___)\s*$/.test(line)) {
      flushParagraph(paraBuf)
      out.push('<hr/>')
      i++
      continue
    }
    // Heading
    const h = line.match(/^\s{0,3}(#{1,6})\s+(.*)$/)
    if (h) {
      flushParagraph(paraBuf)
      const level = h[1].length
      out.push(`<h${level}>${escapeHtml(h[2].trim())}</h${level}>`)
      i++
      continue
    }
    // Blockquote
    const bq = line.match(/^\s{0,3}>\s?(.*)$/)
    if (bq) {
      flushParagraph(paraBuf)
      const quoteLines: string[] = []
      while (i < lines.length) {
        const q = lines[i].match(/^\s{0,3}>\s?(.*)$/)
        if (!q) break
        quoteLines.push(q[1])
        i++
      }
      const inner = escapeHtml(quoteLines.join('\n').trim())
      out.push(`<blockquote>${inner}</blockquote>`)
      continue
    }
    // Ordered list
    if (/^\s{0,3}\d+\.\s+/.test(line)) {
      flushParagraph(paraBuf)
      out.push(parseList(true))
      continue
    }
    // Unordered list
    if (/^\s{0,3}[-*+]\s+/.test(line)) {
      flushParagraph(paraBuf)
      out.push(parseList(false))
      continue
    }
    // Blank line -> paragraph break
    if (/^\s*$/.test(line)) {
      flushParagraph(paraBuf)
      i++
      continue
    }
    // Accumulate paragraph
    paraBuf.push(line.trim())
    i++
  }

  flushParagraph(paraBuf)

  // Restore code blocks
  let html = out.join('\n')
  html = html.replace(/@@CODEBLOCK_(\d+)@@/g, (_m, id) => codeBlocks[Number(id)] || '')
  return html
}

export const PasteMarkdown = Extension.create({
  name: 'paste-markdown',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: (_view: EditorView, event: ClipboardEvent) => {
            if (!event.clipboardData) return false
            const html = event.clipboardData.getData('text/html')
            const text = event.clipboardData.getData('text/plain')

            // If HTML is present, let default handlers process (usually rich paste)
            if (html && html.trim()) return false

            if (!text || !looksLikeMarkdown(text)) return false

            // If the text looks like a GFM table, skip and let the table handler run
            const isTable = /\|.*\|/.test(text) && /\n\s*\|?\s*:?-{3,}:?/.test(text)
            if (isTable) return false

            const converted = markdownToHtml(text)
            if (!converted.trim()) return false

            event.preventDefault()
            this.editor.commands.insertContent(converted)
            return true
          },
        },
      }),
    ]
  },
})

export default PasteMarkdown
