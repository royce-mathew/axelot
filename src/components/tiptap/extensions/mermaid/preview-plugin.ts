import { findChildren } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet, EditorView } from "@tiptap/pm/view"
import type { Node as ProseMirrorNode } from "@tiptap/pm/model"

let mermaidReady = false
let currentTheme: "default" | "dark" = "default"

// Track active render operations to cancel stale ones
const activeRenders = new Map<string, AbortController>()

// Debounce map to prevent rapid re-renders while typing
const debounceTimers = new Map<string, NodeJS.Timeout>()

// Generate stable hash for caching (content only)
function hashCode(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString(36)
}

let initPromise: Promise<void> | null = null

async function ensureMermaidInitialized(theme: "default" | "dark") {
  if (typeof window === "undefined") return

  // If theme changed, we need to re-initialize
  const needsReinit = mermaidReady && currentTheme !== theme

  if (mermaidReady && !needsReinit) return

  // If already initializing, wait for that promise
  if (initPromise) {
    await initPromise
    // After waiting, check if we need to re-init (in case theme changed while waiting)
    if (mermaidReady && currentTheme === theme) return
  }

  // Start new initialization
  initPromise = (async () => {
    try {
      const mermaid = (await import("mermaid")).default
      mermaid.initialize({
        startOnLoad: false,
        suppressErrorRendering: true, // Prevent Mermaid from injecting error divs
        theme,
        // Add Material UI compatible colors
        themeVariables:
          theme === "dark"
            ? {
                primaryColor: "#7877c6",
                primaryTextColor: "#e0e0e0",
                primaryBorderColor: "#7877c6",
                lineColor: "#9e9e9e",
                secondaryColor: "#252526",
                tertiaryColor: "#1e1e1e",
                background: "#252526",
                mainBkg: "#252526",
                secondBkg: "#1e1e1e",
                textColor: "#e0e0e0",
                border1: "#9e9e9e",
                border2: "#666666",
              }
            : {
                primaryColor: "#7877c6",
                primaryTextColor: "#1a1a1a",
                primaryBorderColor: "#7877c6",
                lineColor: "#666666",
                secondaryColor: "#ffffff",
                tertiaryColor: "#f5f5f5",
                background: "#ffffff",
                mainBkg: "#ffffff",
                secondBkg: "#f5f5f5",
                textColor: "#1a1a1a",
                border1: "#666666",
                border2: "#9e9e9e",
              },
      })
      mermaidReady = true
      currentTheme = theme
    } catch (error) {
      console.error("Failed to initialize Mermaid:", error)
    } finally {
      initPromise = null
    }
  })()

  await initPromise
}

async function renderMermaid(
  container: HTMLElement,
  code: string,
  renderId: string
) {
  // Cancel any existing render for this container
  const existingController = activeRenders.get(renderId)
  if (existingController) {
    existingController.abort()
  }

  // Clear any pending debounce for this renderId
  if (debounceTimers.has(renderId)) {
    clearTimeout(debounceTimers.get(renderId))
    debounceTimers.delete(renderId)
  }

  // Debounce the render
  await new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      debounceTimers.delete(renderId)
      resolve()
    }, 300) // 300ms debounce
    debounceTimers.set(renderId, timer)
  })

  const controller = new AbortController()
  activeRenders.set(renderId, controller)

  try {
    // Check if render was cancelled
    if (controller.signal.aborted) return
    const mermaid = (await import("mermaid")).default // Dynamically import mermaid only when needed

    try {
      // Validate syntax first to avoid rendering errors if possible
      await mermaid.parse(code)
    } catch (parseError) {
      throw parseError // If parsing fails, throw it so we can catch it below and show the error box
    }

    if (controller.signal.aborted) return

    // Use a unique id per render to avoid collisions
    const id = `tiptap-mermaid-${renderId}`
    const result = await mermaid.render(id, code)

    // Check again if render was cancelled before updating DOM
    if (controller.signal.aborted) return
    const svg = result?.svg || ""

    // Update DOM
    container.innerHTML = svg
  } catch (err) {
    if (controller.signal.aborted) return
    console.error("Mermaid render error:", err)

    // Format the error message nicely
    let errorMessage = String(err)
    if (err instanceof Error) {
      errorMessage = err.message
    }

    // Clean up common Mermaid error prefixes if present
    if (errorMessage.startsWith("Error: ")) {
      errorMessage = errorMessage.substring(7)
    }

    container.innerHTML = `<div style="color: #ef4444; padding: 1rem; font-family: monospace; font-size: 0.875rem; background: rgba(239, 68, 68, 0.1); border-radius: 4px; white-space: pre-wrap;">
      ${errorMessage}
    </div>`
  } finally {
    activeRenders.delete(renderId)
  }
}

function getThemeFromDocument(): "default" | "dark" {
  if (typeof document === "undefined") return "default"
  // Material UI uses html.dark class selector
  const isDark = document.documentElement.classList.contains("dark")
  return isDark ? "dark" : "default"
}

function createDecorations(doc: ProseMirrorNode, codeBlockName: string) {
  const decorations: Decoration[] = []
  const blocks = findChildren(doc, (node) => node.type.name === codeBlockName)
  const theme = getThemeFromDocument()

  blocks.forEach((block) => {
    const language = block.node.attrs.language
    if (language !== "mermaid") return

    const pos = block.pos
    const code = block.node.textContent
    if (!code || code.trim().length === 0) return

    // Use stable ID based on position only (not random) to prevent layout shifts
    // But use content hash for renderId stability
    const contentHash = hashCode(code)
    const renderId = `${pos}-${contentHash}`

    // Create the preview widget (Always created, visibility controlled by CSS)
    const widget = Decoration.widget(
      pos,
      (view: EditorView) => {
        const outer = document.createElement("div")
        outer.className = "tiptap-mermaid-preview"
        outer.dataset.renderId = renderId

        const container = document.createElement("div")
        container.className = "tiptap-mermaid-svg"
        outer.appendChild(container)

        // Render immediately using double RAF for stability
        requestAnimationFrame(() => {
          requestAnimationFrame(async () => {
            try {
              if (!container.isConnected) return
              await ensureMermaidInitialized(theme)
              await renderMermaid(container, code, renderId)
            } catch (error) {
              // console.error("Mermaid render error:", error)
              container.innerHTML = `<div style="color: #ef4444; padding: 1rem; font-family: monospace; font-size: 0.875rem; background: rgba(239, 68, 68, 0.1); border-radius: 4px;">
                Mermaid render error: ${error instanceof Error ? error.message : String(error)}
              </div>`
            }
          })
        })

        return outer
      },
      { side: -1 }
    )

    decorations.push(widget)

    // Add class to the code block for CSS targeting (mermaid preview visibility)
    decorations.push(
      Decoration.node(block.pos, block.pos + block.node.nodeSize, {
        class: "tiptap-mermaid-code-block",
      })
    )
  })

  return DecorationSet.create(doc, decorations)
}

export function MermaidPreviewPlugin({
  codeBlockName,
}: {
  codeBlockName: string
}) {
  let themeObserver: MutationObserver | null = null

  return new Plugin<DecorationSet>({
    key: new PluginKey("tiptap-mermaid-preview"),

    view(editorView) {
      // Set up theme change observer
      if (typeof window !== "undefined") {
        themeObserver = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (
              mutation.type === "attributes" &&
              mutation.attributeName === "class"
            ) {
              const newTheme = getThemeFromDocument()
              if (newTheme !== currentTheme) {
                // Theme changed, force re-render
                mermaidReady = false
                const tr = editorView.state.tr.setMeta(
                  "mermaidForceUpdate",
                  true
                )
                editorView.dispatch(tr)
              }
              break
            }
          }
        })

        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"],
        })
      }

      return {
        destroy() {
          if (themeObserver) {
            themeObserver.disconnect()
            themeObserver = null
          }
          // Cancel all active renders
          activeRenders.forEach((controller) => controller.abort())
          activeRenders.clear()
        },
      }
    },

    state: {
      init: (_, { doc }) => createDecorations(doc, codeBlockName),
      apply: (tr, oldSet, oldState, newState) => {
        // Force update on theme change
        if (tr.getMeta("mermaidForceUpdate")) {
          return createDecorations(newState.doc, codeBlockName)
        }

        if (!tr.docChanged) {
          return oldSet
        }

        // Only recreate decorations for changed mermaid blocks
        const oldBlocks = findChildren(
          oldState.doc,
          (node) =>
            node.type.name === codeBlockName &&
            node.attrs.language === "mermaid"
        )
        const newBlocks = findChildren(
          newState.doc,
          (node) =>
            node.type.name === codeBlockName &&
            node.attrs.language === "mermaid"
        )

        // Check if mermaid blocks changed
        const blocksChanged =
          oldBlocks.length !== newBlocks.length ||
          oldBlocks.some((oldBlock, i) => {
            const newBlock = newBlocks[i]
            return (
              !newBlock ||
              oldBlock.pos !== newBlock.pos ||
              oldBlock.node.textContent !== newBlock.node.textContent
            )
          })

        if (blocksChanged) {
          return createDecorations(newState.doc, codeBlockName)
        }

        // Map existing decorations to new positions
        return oldSet.map(tr.mapping, tr.doc)
      },
    },
    props: {
      decorations(state) {
        return this.getState(state)
      },
    },
  })
}
