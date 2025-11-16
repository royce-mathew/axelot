import { findChildren } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet, EditorView } from "@tiptap/pm/view"
import type { Node as ProseMirrorNode } from "@tiptap/pm/model"

let mermaidReady = false
let isInitializing = false

async function ensureMermaidInitialized(theme: "default" | "dark") {
  if (typeof window === "undefined") return
  if (mermaidReady || isInitializing) return

  isInitializing = true
  try {
    const mermaid = (await import("mermaid")).default
    mermaid.initialize({ startOnLoad: false, theme })
    mermaidReady = true
  } catch {
    // noop
  } finally {
    isInitializing = false
  }
}

async function renderMermaid(container: HTMLElement, code: string) {
  const mermaid = (await import("mermaid")).default
  try {
    // Use a unique id per render to avoid collisions
    const id = `tiptap-mermaid-${Math.random().toString(36).slice(2)}`
    // Some mermaid versions expose render as promise-based
    const result = await mermaid.render?.(id, code)
    const svg = result?.svg || ""
    container.innerHTML = svg
  } catch (err) {
    container.innerHTML = `<pre style="color:#f87171">Mermaid render error\n${String(err)}</pre>`
  }
}

function getThemeFromDocument(): "default" | "dark" {
  if (typeof document === "undefined") return "default"
  const root = document.documentElement
  const isDark =
    root.classList.contains("dark") ||
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
  return isDark ? "dark" : "default"
}

function createDecorations(
  doc: ProseMirrorNode,
  codeBlockName: string,
  hideCode: boolean
) {
  const decorations: Decoration[] = []

  const blocks = findChildren(doc, (node) => node.type.name === codeBlockName)
  const theme = getThemeFromDocument()

  blocks.forEach((block) => {
    const language = block.node.attrs.language
    if (language !== "mermaid") return

    // Insert preview widget immediately BEFORE the code block
    const pos = block.pos
    const code = block.node.textContent
    if (!code || code.trim().length === 0) return
    const widget = Decoration.widget(
      pos,
      (view: EditorView) => {
        const outer = document.createElement("div")
        outer.className = "tiptap-mermaid-preview"

        const container = document.createElement("div")
        container.className = "tiptap-mermaid-svg"
        outer.appendChild(container)

        // Defer rendering to next microtask so DOM attaches
        queueMicrotask(async () => {
          await ensureMermaidInitialized(theme)
          await renderMermaid(container, code)
        })

        return outer
      },
      { side: -1 }
    )

    decorations.push(widget)

    if (hideCode) {
      decorations.push(
        Decoration.node(block.pos, block.pos + block.node.nodeSize, {
          class: "tiptap-mermaid-hide shiki",
          style: "display: none;",
        })
      )
    }
  })

  return DecorationSet.create(doc, decorations)
}

export function MermaidPreviewPlugin({
  codeBlockName,
  showPreview,
}: {
  codeBlockName: string
  showPreview: boolean
}) {
  return new Plugin<DecorationSet>({
    key: new PluginKey("tiptap-mermaid-preview"),
    state: {
      init: (_, { doc }) =>
        showPreview
          ? createDecorations(doc, codeBlockName, true)
          : DecorationSet.empty,
      apply: (tr, old) => {
        if (tr.docChanged) {
          return showPreview
            ? createDecorations(tr.doc, codeBlockName, true)
            : DecorationSet.empty
        }
        return old
      },
    },
    props: {
      decorations(state) {
        return this.getState(state)
      },
    },
  })
}
