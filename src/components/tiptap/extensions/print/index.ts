import { Extension } from "@tiptap/core"
import { printView } from "./print-utils"

export interface PrintOptions {
  /**
   * The keyboard shortcut to trigger printing
   * @default 'Mod-p'
   */
  shortcut: string
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    print: {
      /**
       * Prints the editor content
       */
      print: () => ReturnType
    }
  }
}

/**
 * Print extension for TipTap
 * Allows printing the editor content with proper styling
 *
 * @example
 * ```ts
 * import { Print } from './extensions/print'
 *
 * const editor = useEditor({
 *   extensions: [
 *     Print.configure({
 *       shortcut: 'Mod-p',
 *     }),
 *   ],
 * })
 *
 * // Trigger print programmatically
 * editor.commands.print()
 * ```
 */
export const Print = Extension.create<PrintOptions>({
  name: "print",

  addOptions() {
    return {
      shortcut: "Mod-p",
    }
  },

  addCommands() {
    return {
      print:
        () =>
        ({ view }) => {
          // Execute async but return true immediately for command system
          printView(view).catch((error) => {
            console.error("Print command failed:", error)
          })
          return true
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      [this.options.shortcut]: () => {
        return this.editor.commands.print()
      },
    }
  },
})

export default Print
