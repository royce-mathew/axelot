import { visit } from "unist-util-visit"

import { UnistNode, UnistTree } from "@/types/unist"

export const rawCodePreProcessor = () => (tree: UnistTree) => {
  visit(tree, "element", (node: UnistNode) => {
    if (node?.type === "element" && node?.tagName === "pre") {
      if (!node.children || node.children.length === 0) {
        return
      }

      const [codeEl] = node.children

      if (codeEl.tagName !== "code") {
        return
      }

      node.__raw__ = codeEl.children?.[0].value
    }
  })
}

export const rawCodePostProcessor = () => (tree: UnistTree) => {
  visit(tree, "element", (node: UnistNode) => {
    if (node?.type === "element" && node?.tagName === "figure") {
      if (
        !node.properties ||
        !("data-rehype-pretty-code-figure" in node.properties)
      ) {
        return
      }

      // Get pre element
      const preElement = node.children?.find(
        (child: UnistNode) => child.tagName === "pre"
      )

      if (preElement?.tagName !== "pre") {
        return
      }

      if (preElement?.properties) {
        preElement.properties.__raw__ = node.__raw__!
      }
    }
  })
}
