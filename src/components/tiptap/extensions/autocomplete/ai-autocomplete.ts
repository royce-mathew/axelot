import { Extension } from "@tiptap/core"
import { AIAutocompleteOptions } from "./types"

// Global storage for handlers - allows React hook to register handlers
const globalHandlers = new Map<
  string,
  {
    acceptSuggestion: () => boolean
    dismissSuggestion: () => boolean
    requestSuggestion: () => void
    hasPendingCompletion: () => boolean
  }
>()

export interface AIAutocompleteStorage {
  editorId: string
}

declare module "@tiptap/core" {
  interface Storage {
    aiAutocomplete: AIAutocompleteStorage
  }
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiAutocomplete: {
      acceptSuggestion: () => ReturnType
      dismissSuggestion: () => ReturnType
      requestSuggestion: () => ReturnType
    }
  }
}

export const AIAutocomplete = Extension.create<
  AIAutocompleteOptions,
  AIAutocompleteStorage
>({
  name: "aiAutocomplete",

  addOptions() {
    return {
      enabled: true,
      acceptKeys: ["Tab", "Enter", "ArrowRight"],
      dismissKey: "Escape",
      requestKey: "Tab",
      maxTokens: 60,
      temperature: 0.5,
      stopSequences: ["\n\n"],
      promptTemplate: (text: string) =>
        text.trim().length > 0
          ? `Continue the text with the next sentence only. Keep it concise and do not repeat existing text. Provide only the continuation without quotes.\n\nContext:\n${text}\n\nContinuation:`
          : "Write a short first sentence to start a document.",
      postProcess: (completion: string) => {
        const trimmed = completion.replace(/\s+/g, " ").trim()
        if (!trimmed) return ""
        const match = trimmed.match(/(.+?[\.!\?])( |$)/)
        if (match) return match[1] + " "
        return trimmed.slice(0, 120)
      },
      model: "openrouter/auto",
    }
  },

  addStorage() {
    return {
      editorId: "",
    }
  },

  onCreate() {
    // Generate unique editor ID on creation
    this.storage.editorId = Math.random().toString(36).substr(2, 9)
    console.log(
      "🆔 AIAutocomplete extension created with ID:",
      this.storage.editorId
    )
  },

  addCommands() {
    return {
      acceptSuggestion:
        () =>
        ({ editor }) => {
          const editorId = editor.storage.aiAutocomplete?.editorId
          const handlers = globalHandlers.get(editorId)
          if (handlers) {
            return handlers.acceptSuggestion()
          }
          return false
        },

      dismissSuggestion:
        () =>
        ({ editor }) => {
          const editorId = editor.storage.aiAutocomplete?.editorId
          const handlers = globalHandlers.get(editorId)
          if (handlers) {
            return handlers.dismissSuggestion()
          }
          return false
        },

      requestSuggestion:
        () =>
        ({ editor }) => {
          const editorId = editor.storage.aiAutocomplete?.editorId
          const handlers = globalHandlers.get(editorId)
          if (handlers) {
            handlers.requestSuggestion()
            return true
          }
          return false
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        console.log("🔥 TAB KEY PRESSED in AI Autocomplete extension!")
        const editorId = editor.storage.aiAutocomplete?.editorId
        console.log("🔍 Editor ID:", editorId)
        console.log("🔍 Full storage:", editor.storage.aiAutocomplete)
        console.log(
          "🔍 Available handler IDs:",
          Array.from(globalHandlers.keys())
        )

        const handlers = globalHandlers.get(editorId)
        console.log("🔍 Handlers found:", handlers ? "✅ YES" : "❌ NO")
        if (!handlers) {
          console.log("❌ No handlers registered, ignoring Tab")
          return false
        }

        const hasPendingCompletion = handlers.hasPendingCompletion()
        console.log(
          "🔍 Has pending completion (and enabled):",
          hasPendingCompletion
        )

        // Accept suggestion if available
        if (hasPendingCompletion && this.options.acceptKeys?.includes("Tab")) {
          console.log("✅ Accepting suggestion via Tab")
          return editor.commands.acceptSuggestion()
        }

        // Request new suggestion if Tab is the request key and no pending completion
        if (!hasPendingCompletion && this.options.requestKey === "Tab") {
          console.log("🎯 Requesting new suggestion via Tab")
          return editor.commands.requestSuggestion()
        }

        console.log("❌ Tab not handled, returning false")
        return false
      },

      Enter: ({ editor }) => {
        if (
          !this.options.enabled ||
          !this.options.acceptKeys?.includes("Enter")
        )
          return false

        const editorId = editor.storage.aiAutocomplete?.editorId
        const handlers = globalHandlers.get(editorId)
        if (!handlers) return false

        const hasPendingCompletion = handlers.hasPendingCompletion()
        if (hasPendingCompletion) {
          return editor.commands.acceptSuggestion()
        }

        return false
      },

      ArrowRight: ({ editor }) => {
        if (
          !this.options.enabled ||
          !this.options.acceptKeys?.includes("ArrowRight")
        )
          return false

        const editorId = editor.storage.aiAutocomplete?.editorId
        const handlers = globalHandlers.get(editorId)
        if (!handlers) return false

        const hasPendingCompletion = handlers.hasPendingCompletion()
        if (hasPendingCompletion) {
          return editor.commands.acceptSuggestion()
        }

        return false
      },

      Escape: ({ editor }) => {
        if (!this.options.enabled || this.options.dismissKey !== "Escape")
          return false

        const editorId = editor.storage.aiAutocomplete?.editorId
        const handlers = globalHandlers.get(editorId)
        if (!handlers) return false

        const hasPendingCompletion = handlers.hasPendingCompletion()
        if (hasPendingCompletion) {
          return editor.commands.dismissSuggestion()
        }

        return false
      },
    }
  },

  onDestroy() {
    // Clean up handlers when extension is destroyed
    globalHandlers.delete(this.storage.editorId)
  },
})

// Export function for hook to register handlers
export function registerAIAutocompleteHandlers(
  editorId: string,
  handlers: {
    acceptSuggestion: () => boolean
    dismissSuggestion: () => boolean
    requestSuggestion: () => void
    hasPendingCompletion: () => boolean
  }
) {
  globalHandlers.set(editorId, handlers)
}

// Export function for hook to unregister handlers
export function unregisterAIAutocompleteHandlers(editorId: string) {
  globalHandlers.delete(editorId)
}

// Export for debugging
export function getGlobalHandlers() {
  return globalHandlers
}
