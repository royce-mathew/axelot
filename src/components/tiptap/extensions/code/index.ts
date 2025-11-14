import CodeBlock, { CodeBlockOptions } from "@tiptap/extension-code-block"
import { BundledLanguage, BundledTheme } from "shiki"
import { ShikiPlugin } from "./shiki-plugin"

export interface CodeBlockShikiOptions extends CodeBlockOptions {
  defaultLanguage: BundledLanguage | null | undefined
  defaultTheme: BundledTheme
  languageClassPrefix: string
  themes:
    | {
        light: BundledTheme
        dark: BundledTheme
      }
    | null
    | undefined
}

export const CodeBlockShiki = CodeBlock.extend<CodeBlockShikiOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      defaultLanguage: null,
      languageClassPrefix: "language-",
      exitOnArrowDown: true,
      exitOnTripleEnter: true,
      enableTabIndentation: true,
      tabSize: 4,
      defaultTheme: "github-dark",
      themes: null,
      HTMLAttributes: {
        spellcheck: "false",
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() || []),
      ShikiPlugin({
        name: this.name,
        defaultLanguage: this.options.defaultLanguage,
        defaultTheme: this.options.defaultTheme,
        themes: this.options.themes,
      }),
    ]
  },
})
