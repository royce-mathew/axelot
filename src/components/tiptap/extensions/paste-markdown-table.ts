import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

function isMarkdownTable(text: string): boolean {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return false
  const header = lines[0]
  const sep = lines[1]
  const pipeRow = /\|/
  if (!pipeRow.test(header) || !pipeRow.test(sep)) return false
  // separator must be like | --- | :---: | ---: |
  const sepCells = sep.split('|').map(c => c.trim()).filter(Boolean)
  if (sepCells.length === 0) return false
  const validSep = sepCells.every(cell => /^:?-{3,}:?$/.test(cell))
  return validSep
}

function mdTableToHtml(text: string): string {
  const lines = text.trim().split(/\r?\n/)
  const rows = lines.filter(l => l.trim().length > 0)
  const headerCells = rows[0].split('|').map(c => c.trim()).filter(Boolean)
  // align detection from separator row
  const sepCells = rows[1].split('|').map(c => c.trim()).filter(Boolean)
  const aligns = sepCells.map(c => {
    const left = c.startsWith(':')
    const right = c.endsWith(':')
    if (left && right) return 'center'
    if (right) return 'right'
    return 'left'
  })
  const bodyRows = rows.slice(2).map(r => r.split('|').map(c => c.trim()))

  const ths = headerCells.map((cell, i) => `<th style="text-align:${aligns[i] || 'left'}">${escapeHtml(cell)}</th>`).join('')
  const thead = `<thead><tr>${ths}</tr></thead>`
  const tbody = `<tbody>${bodyRows.map(r => {
    const tds = headerCells.map((_, i) => `<td style="text-align:${aligns[i] || 'left'}">${escapeHtml(r[i] ?? '')}</td>`).join('')
    return `<tr>${tds}</tr>`
  }).join('')}</tbody>`
  return `<table>${thead}${tbody}</table>`
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export const PasteMarkdownTable = Extension.create({
  name: 'pasteMarkdownTable',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('pasteMarkdownTable'),
        props: {
          handlePaste: (view, event) => {
            const text = event.clipboardData?.getData('text/plain') || ''
            if (isMarkdownTable(text)) {
              const html = mdTableToHtml(text)
              // Insert as HTML so TipTap table schema parses into nodes
              this.editor.commands.insertContent(html)
              return true
            }
            return false
          },
        },
      }),
    ]
  },
})
