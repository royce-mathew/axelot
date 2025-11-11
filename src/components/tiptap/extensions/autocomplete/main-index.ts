// Main Extension
export { AIAutocomplete, registerAIAutocompleteHandlers, unregisterAIAutocompleteHandlers } from './ai-autocomplete'

// React Hook
export { useAIAutocomplete } from './use-ai-autocomplete'

// Components  
export { AIGhostOverlay } from './ai-ghost-overlay'
export { AITextBubbleMenu } from './components/ai-text-bubble-menu'
export { TextTransformDialog } from './components/text-transform-dialog'
export { Badge } from './components/badge'

// Types
export type { 
  AIAutocompleteOptions,
  AICompletionProvider, 
  GhostTextPosition,
  AIAutocompleteState
} from './types'

// Example configurations
export { defaultPrompts, textTransformActions } from './utils/config'