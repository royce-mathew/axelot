import { Extension, textblockTypeInputRule } from "@tiptap/core"
import { MermaidPreviewPlugin } from "./preview-plugin"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mermaid: {
      insertMermaid: (template?: string) => ReturnType
    }
  }
}

export const MermaidPreview = Extension.create({
  name: "mermaidPreview",

  addProseMirrorPlugins() {
    return [
      MermaidPreviewPlugin({
        codeBlockName: "codeBlock",
      }),
    ]
  },

  addCommands() {
    return {
      insertMermaid:
        (template?: string) =>
        ({ chain, state }) => {
          const content =
            template?.trim() ||
            `flowchart TD\n  A[Christmas] -->|Get money| B(Go shopping)\n  B --> C{Let me think}\n  C -->|One| D[Laptop]\n  C -->|Two| E[iPhone]\n  C -->|Three| F[fa:fa-car Car]`

          return chain()
            .focus()
            .insertContent({
              type: "codeBlock",
              attrs: { language: "mermaid" },
              content: [{ type: "text", text: content }],
            })
            .run()
        },
    }
  },

  addInputRules() {
    // Transform ```mermaid into a mermaid code block
    // Use same input rules from codeblock
    return [
      textblockTypeInputRule({
        find: /^```mermaid[\s\n]$/,
        type: this.editor.schema.nodes.codeBlock,
        getAttributes: () => ({ language: "mermaid" }),
      }),
    ]
  },
})
