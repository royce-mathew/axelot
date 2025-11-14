export interface AICompletionProvider {
  complete: (prompt: string, options?: Record<string, unknown>) => Promise<void>
  completion: string
  isLoading: boolean
}

export interface AIAutocompleteOptions {
  /**
   * Whether autocomplete is enabled
   */
  enabled?: boolean

  /**
   * Keys that trigger suggestion acceptance
   */
  acceptKeys?: string[]

  /**
   * Key that dismisses suggestions
   */
  dismissKey?: string

  /**
   * Key that requests new suggestions
   */
  requestKey?: string

  /**
   * Maximum tokens for completion
   */
  maxTokens?: number

  /**
   * Temperature for AI completion
   */
  temperature?: number

  /**
   * Stop sequences for completion
   */
  stopSequences?: string[]

  /**
   * Custom prompt template function
   */
  promptTemplate?: (text: string) => string

  /**
   * Post-processing function for completions
   */
  postProcess?: (completion: string) => string

  /**
   * AI model to use
   */
  model?: string
}

export interface GhostTextPosition {
  top: number
  left: number
}

export interface AIAutocompleteState {
  pendingCompletion: string
  ghostPosition: GhostTextPosition | null
  isEnabled: boolean
}
