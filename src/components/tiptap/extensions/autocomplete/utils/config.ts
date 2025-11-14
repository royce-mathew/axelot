import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"
import MenuBookIcon from "@mui/icons-material/MenuBook"
import GroupsIcon from "@mui/icons-material/Groups"
import BusinessIcon from "@mui/icons-material/Business"

export const defaultPrompts = {
  autocomplete: (text: string) =>
    text.trim().length > 0
      ? `Continue the text with the next sentence only. Keep it concise and do not repeat existing text. Provide only the continuation without quotes.\n\nContext:\n${text}\n\nContinuation:`
      : "Write a short first sentence to start a document.",

  makelonger: (text: string) =>
    `Expand and elaborate on the following text, making it longer and more detailed while maintaining the original meaning and style. Add relevant details, examples, or context:\n\n"${text}"\n\nExpanded version:`,

  makeShorter: (text: string) =>
    `Condense and shorten the following text while preserving its key meaning and message. Remove unnecessary words and make it more concise:\n\n"${text}"\n\nConcise version:`,

  improve: (text: string) =>
    `Improve the writing quality of the following text. Fix any grammar issues, enhance clarity, and make it more engaging while maintaining the original meaning:\n\n"${text}"\n\nImproved version:`,

  simplify: (text: string) =>
    `Rewrite the following text to make it simpler and easier to understand. Use clearer language and shorter sentences:\n\n"${text}"\n\nSimplified version:`,

  formalize: (text: string) =>
    `Rewrite the following text in a more formal, professional tone. Adjust the language and style to be appropriate for business or academic contexts:\n\n"${text}"\n\nFormal version:`,

  casualize: (text: string) =>
    `Rewrite the following text in a more casual, conversational tone. Make it sound more relaxed and friendly:\n\n"${text}"\n\nCasual version:`,
}

export const textTransformActions = [
  {
    id: "make-longer",
    label: "Make Longer",
    icon: AddIcon,
    description: "Expand and add more detail",
  },
  {
    id: "make-shorter",
    label: "Make Shorter",
    icon: RemoveIcon,
    description: "Condense and shorten",
  },
  {
    id: "improve",
    label: "Improve",
    icon: AutoAwesomeIcon,
    description: "Enhance writing quality",
  },
  {
    id: "simplify",
    label: "Simplify",
    icon: MenuBookIcon,
    description: "Make easier to understand",
  },
  {
    id: "formalize",
    label: "Formalize",
    icon: BusinessIcon,
    description: "Make more professional",
  },
  {
    id: "casualize",
    label: "Casualize",
    icon: GroupsIcon,
    description: "Make more conversational",
  },
]

export const defaultConfig = {
  enabled: true,
  acceptKeys: ["Tab", "Enter", "ArrowRight"],
  dismissKey: "Escape",
  requestKey: "Tab",
  maxTokens: 60,
  temperature: 0.5,
  stopSequences: ["\n\n"],
  model: "openrouter/auto",
  apiEndpoint: "/api/complete",
  transformEndpoint: "/api/text-transform",
}
