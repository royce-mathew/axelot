import { MathExtension } from "@aarkue/tiptap-math-extension"
import { Editor } from "@tiptap/core"
import Blockquote from "@tiptap/extension-blockquote"
import Bold from "@tiptap/extension-bold"
import Code from "@tiptap/extension-code"
import Color from "@tiptap/extension-color"
import Document from "@tiptap/extension-document"
import FontFamily from "@tiptap/extension-font-family"
import Gapcursor from "@tiptap/extension-gapcursor"
import Heading from "@tiptap/extension-heading"
import Highlight from "@tiptap/extension-highlight"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import InvisibleCharacters from "@tiptap/extension-invisible-characters"
import Italic from "@tiptap/extension-italic"
import Link from "@tiptap/extension-link"
import { BulletList, ListItem, OrderedList } from "@tiptap/extension-list"
import Paragraph from "@tiptap/extension-paragraph"
import Strike from "@tiptap/extension-strike"
import { Table } from "@tiptap/extension-table"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TableOfContents from "@tiptap/extension-table-of-contents"
import TableRow from "@tiptap/extension-table-row"
import Text from "@tiptap/extension-text"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import Typography from "@tiptap/extension-typography"
import Underline from "@tiptap/extension-underline"
import { CharacterCount, Placeholder } from "@tiptap/extensions"
import { Node } from "@tiptap/pm/model"
import { Extensions } from "@tiptap/react"
import { CodeBlockShiki } from "../extensions/code"
import { FontSize } from "../extensions/font-size"
import { Indent } from "../extensions/indent"
import { LineHeight } from "../extensions/line-height"
import { Print } from "../extensions/print"

export const extensions: Extensions = [
  // Core extensions
  Document,
  Text,
  Paragraph,
  
  // Formatting extensions
  Bold.configure({ HTMLAttributes: { class: "font-bold" } }),
  Italic,
  Strike,
  Underline,
  Code,
  
  // Text style extensions
  TextStyle,
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  FontFamily,
  FontSize,
  LineHeight,
  
  // Block extensions
  Heading.configure({ levels: [1, 2, 3, 4] }),
  Blockquote,
  CodeBlockShiki,
  HorizontalRule,
  
  // List extensions
  BulletList.configure({
    HTMLAttributes: {
      class: "list-disc",
    },
  }),
  OrderedList.configure({
    HTMLAttributes: {
      class: "list-decimal",
    },
  }),
  ListItem,
  
  // Link extension
  Link,
  
  // Table extensions
  Table.configure({
    resizable: true,
    handleWidth: 5,
    cellMinWidth: 50,
    lastColumnResizable: true,
    allowTableNodeSelection: true,
    HTMLAttributes: {
      class: "tiptap-table",
    },
  }),
  TableRow,
  TableHeader,
  TableCell,
  
  // Alignment
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  
  // Utility extensions
  Gapcursor,
  Typography,
  Indent,
  CharacterCount,
  InvisibleCharacters.configure({
    visible: false, // Hidden by default, toggle with toolbar button
  }),
  TableOfContents,
  Print,
  
  // Special extensions
  MathExtension.configure({ evaluation: true }),
  Placeholder.configure({
    includeChildren: true,
    placeholder: ({
      editor,
      node,
    }: {
      editor: Editor
      node: Node
      pos: number
      hasAnchor: boolean
    }) => {
      if (editor.isActive("table")) return "List"
      if (node.type.name === "heading") {
        return `Heading ${node.attrs.level}`
      }
      return "Start Writing..."
    },
  }),
]
