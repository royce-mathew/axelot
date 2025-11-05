import { Extension } from "@tiptap/core"
import type { EditorView } from "@tiptap/pm/view"

import { printView } from "./util"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    print: {
      print: () => ReturnType
    }
  }
}

const Print = Extension.create({
  name: "print",
  addCommands() {
    return {
      print:
        () =>
        ({ view }: { view: EditorView }) => {
          printView(view)
          return true
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      "Mod-p": () => this.editor.commands.print(),
    }
  },
})

export { Print }
