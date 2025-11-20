import { BundledLanguage, BundledTheme } from "shiki"
import { NodeWithPos, findChildren } from "@tiptap/core"
import { Plugin, PluginKey, PluginView } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"
import { Node as ProsemirrorNode } from "@tiptap/pm/model"
import {
  getShiki,
  initHighlighter,
  loadLanguage,
  loadTheme,
} from "./highlighter"
import { styleToHtml } from "./html-styles"

/** Create code decorations for the current document */
function getDecorations({
  doc,
  name,
  defaultTheme,
  defaultLanguage,
  themes,
}: {
  doc: ProsemirrorNode
  name: string
  defaultLanguage: BundledLanguage | null | undefined
  defaultTheme: BundledTheme
  themes:
    | {
        light: BundledTheme
        dark: BundledTheme
      }
    | null
    | undefined
}) {
  const decorations: Decoration[] = []
  const codeBlocks = findChildren(doc, (node) => node.type.name === name)

  codeBlocks.forEach((block) => {
    let from = block.pos + 1
    let language = block.node.attrs.language || defaultLanguage

    const theme = block.node.attrs.theme || defaultTheme
    const lightTheme = block.node.attrs.themes?.light || themes?.light
    const darkTheme = block.node.attrs.themes?.dark || themes?.dark

    const highlighter = getShiki()

    if (!highlighter) return
    if (!highlighter.getLoadedLanguages().includes(language)) {
      language = "plaintext"
    }

    const getThemeToApply = (theme: string): BundledTheme => {
      if (highlighter.getLoadedThemes().includes(theme)) {
        return theme as BundledTheme
      } else {
        return highlighter.getLoadedThemes()[0] as BundledTheme
      }
    }

    let tokens

    if (themes) {
      tokens = highlighter.codeToTokens(block.node.textContent, {
        lang: language,
        themes: {
          light: getThemeToApply(lightTheme),
          dark: getThemeToApply(darkTheme),
        },
      })

      const blockStyle: { [prop: string]: string } = {}
      if (tokens.bg) blockStyle["background-color"] = tokens.bg
      if (tokens.fg) blockStyle["color"] = tokens.fg

      decorations.push(
        Decoration.node(block.pos, block.pos + block.node.nodeSize, {
          style: styleToHtml(blockStyle),
          class: "shiki code-block-with-lang",
        })
      )
    } else {
      tokens = highlighter.codeToTokens(block.node.textContent, {
        lang: language,
        theme: getThemeToApply(theme),
      })

      const themeToApply = highlighter.getLoadedThemes().includes(theme)
        ? theme
        : highlighter.getLoadedThemes()[0]

      const themeResolved = highlighter.getTheme(themeToApply)

      decorations.push(
        Decoration.node(block.pos, block.pos + block.node.nodeSize, {
          style: `background-color: ${themeResolved.bg}`,
          class: "code-block-with-lang",
        })
      )
    }

    // Create a single container for language indicator and copy button
    const container = document.createElement("div")
    container.className = "code-block-controls"
    container.setAttribute("contenteditable", "false")

    // Language indicator (shown by default)
    const langIndicator = document.createElement("span")
    langIndicator.className = "code-block-language-indicator"
    langIndicator.textContent = language

    // Copy button (shown on hover)
    const copyButton = document.createElement("button")
    copyButton.className = "code-block-copy-button"
    copyButton.setAttribute("type", "button")
    copyButton.setAttribute("aria-label", "Copy code")

    // Material Design Copy Icon
    const copyIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/></svg>`

    // Material Design Check Icon
    const checkIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/></svg>`

    copyButton.innerHTML = copyIcon

    copyButton.addEventListener("click", async (e) => {
      e.preventDefault()
      e.stopPropagation()

      try {
        await navigator.clipboard.writeText(block.node.textContent)
        copyButton.innerHTML = checkIcon
        copyButton.classList.add("copied")
        setTimeout(() => {
          copyButton.innerHTML = copyIcon
          copyButton.classList.remove("copied")
        }, 2000)
      } catch (err) {
        console.error("Failed to copy:", err)
      }
    })

    container.appendChild(langIndicator)
    container.appendChild(copyButton)

    decorations.push(
      Decoration.widget(block.pos + 1, container, {
        side: -1,
      })
    )

    for (const line of tokens.tokens) {
      for (const token of line) {
        const to = from + token.content.length

        //NOTE: tokens object will be different if themes supplied
        // thus, need to handle style accordingly
        let style = ""

        if (themes) {
          style = styleToHtml(token.htmlStyle || {})
        } else {
          style = `color: ${token.color}`
        }

        const decoration = Decoration.inline(from, to, {
          style: style,
        })

        decorations.push(decoration)

        from = to
      }

      from += 1
    }
  })

  return DecorationSet.create(doc, decorations)
}

export function ShikiPlugin({
  name,
  defaultLanguage,
  defaultTheme,
  themes,
}: {
  name: string
  defaultLanguage: BundledLanguage | null | undefined
  defaultTheme: BundledTheme
  themes:
    | {
        light: BundledTheme
        dark: BundledTheme
      }
    | null
    | undefined
}) {
  const shikiPlugin: Plugin<DecorationSet> = new Plugin({
    key: new PluginKey("shiki"),

    view(view) {
      // This small view is just for initial async handling
      class ShikiPluginView implements PluginView {
        constructor() {
          this.initDecorations()
        }

        update() {
          this.checkUndecoratedBlocks()
        }
        destroy() {}

        // Initialize shiki async, and then highlight initial document
        async initDecorations() {
          const doc = view.state.doc
          await initHighlighter({
            doc,
            name,
            defaultLanguage,
            defaultTheme,
            themeModes: themes,
          })
          const tr = view.state.tr.setMeta("shikiPluginForceDecoration", true)
          view.dispatch(tr)
        }

        // When new codeblocks were added and they have missing themes or
        // languages, load those and then add code decorations once again.
        async checkUndecoratedBlocks() {
          const codeBlocks = findChildren(
            view.state.doc,
            (node) => node.type.name === name
          )

          const loaderFns = (block: NodeWithPos): Promise<boolean>[] => {
            const fns = [loadLanguage(block.node.attrs.language)]

            if (themes) {
              fns.push(
                loadTheme(block.node.attrs.themes?.light || themes.light)
              )
              fns.push(loadTheme(block.node.attrs.themes?.dark || themes.dark))
            } else {
              fns.push(loadTheme(block.node.attrs.theme))
            }

            return fns
          }

          // Load missing themes or languages when necessary.
          // loadStates is an array with booleans depending on if a theme/lang
          // got loaded.
          const loadStates = await Promise.all(
            codeBlocks.flatMap((block) => loaderFns(block))
          )
          const didLoadSomething = loadStates.includes(true)

          // The asynchronous nature of this is potentially prone to
          // race conditions. Imma just hope it's fine lol
          if (didLoadSomething) {
            const tr = view.state.tr.setMeta("shikiPluginForceDecoration", true)
            view.dispatch(tr)
          }
        }
      }

      return new ShikiPluginView()
    },

    state: {
      init: (_, { doc }) => {
        return getDecorations({
          doc,
          name,
          defaultLanguage,
          defaultTheme,
          themes: themes,
        })
      },
      apply: (transaction, decorationSet, oldState, newState) => {
        const oldNodeName = oldState.selection.$head.parent.type.name
        const newNodeName = newState.selection.$head.parent.type.name
        const oldNodes = findChildren(
          oldState.doc,
          (node) => node.type.name === name
        )
        const newNodes = findChildren(
          newState.doc,
          (node) => node.type.name === name
        )

        const didChangeSomeCodeBlock =
          transaction.docChanged &&
          // Apply decorations if:
          // selection includes named node,
          ([oldNodeName, newNodeName].includes(name) ||
            // OR transaction adds/removes named node,
            newNodes.length !== oldNodes.length ||
            // OR transaction has changes that completely encapsulte a node
            // (for example, a transaction that affects the entire document).
            // Such transactions can happen during collab syncing via y-prosemirror, for example.
            transaction.steps.some((s) => {
              const step = s as { from?: number; to?: number }
              if (step.from === undefined || step.to === undefined) return false
              const from = step.from as number
              const to = step.to as number
              return oldNodes.some((node) => {
                return node.pos >= from && node.pos + node.node.nodeSize <= to
              })
            }))

        // only create code decoration when it's necessary to do so
        if (
          transaction.getMeta("shikiPluginForceDecoration") ||
          didChangeSomeCodeBlock
        ) {
          return getDecorations({
            doc: transaction.doc,
            name,
            defaultLanguage,
            defaultTheme,
            themes,
          })
        }

        return decorationSet.map(transaction.mapping, transaction.doc)
      },
    },

    props: {
      decorations(state) {
        return shikiPlugin.getState(state)
      },
    },
  })

  return shikiPlugin
}
