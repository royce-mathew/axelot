import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import type { AICompletionProvider, AIAutocompleteOptions, GhostTextPosition } from './types';
import { registerAIAutocompleteHandlers, unregisterAIAutocompleteHandlers } from './ai-autocomplete';

interface UseAIAutocompleteProps {
  editor: Editor | null;
  completionProvider: AICompletionProvider;
  options?: AIAutocompleteOptions;
}

export function useAIAutocomplete({
  editor,
  completionProvider,
  options = {},
}: UseAIAutocompleteProps) {
  const [pendingCompletion, setPendingCompletion] = useState('');
  const [ghostPosition, setGhostPosition] = useState<GhostTextPosition | null>(null);
  const pendingCompletionRef = useRef('');
  const editorIdRef = useRef<string | null>(null);
  const wasAcceptedRef = useRef(false);

  const config = useMemo(() => {
    const defaultOptions: Required<AIAutocompleteOptions> = {
      enabled: true,
      acceptKeys: ['Tab', 'Enter', 'ArrowRight'],
      dismissKey: 'Escape',
      requestKey: 'Tab',
      maxTokens: 60,
      temperature: 0.5,
      stopSequences: ['\n\n'],
      promptTemplate: (text: string) => 
        text.trim().length > 0
          ? `Continue the text with the next sentence only. Keep it concise and do not repeat existing text. Provide only the continuation without quotes.\n\nContext:\n${text}\n\nContinuation:`
          : 'Write a short first sentence to start a document.',
      postProcess: (completion: string) => {
        const trimmed = completion.replace(/\s+/g, ' ').trim();
        if (!trimmed) return '';
        const match = trimmed.match(/(.+?[\.!\?])( |$)/);
        if (match) return match[1] + ' ';
        return trimmed.slice(0, 120);
      },
      model: 'openrouter/auto',
    };
    return { ...defaultOptions, ...options };
  }, [options]);

  // Update pending completion when AI completion changes
  useEffect(() => {
    if (completionProvider.completion && !completionProvider.isLoading) {
      // Don't update if the suggestion was manually accepted/dismissed
      if (wasAcceptedRef.current) {
        console.log('🚫 Ignoring completion update - suggestion was accepted/dismissed');
        return;
      }
      
      const processed = config.postProcess(completionProvider.completion);
      console.log('📝 Updating pending completion from provider:', processed);
      setPendingCompletion(processed);
      pendingCompletionRef.current = processed;
    }
  }, [completionProvider.completion, completionProvider.isLoading, config]);

  // Calculate ghost text position
  const updateGhostPosition = useCallback(() => {
    if (!editor || !pendingCompletion) {
      setGhostPosition(null);
      return;
    }

    try {
      const { from } = editor.state.selection;
      const coords = editor.view.coordsAtPos(from);
      const editorContainer = editor.view.dom.closest('.ProseMirror');
      
      if (!editorContainer) return;
      
      const relativeContainer = (editorContainer as HTMLElement).offsetParent || editorContainer;
      const parentRect = relativeContainer.getBoundingClientRect();
      
      const position = {
        top: coords.top - parentRect.top,
        left: coords.left - parentRect.left,
      };
      
      setGhostPosition(position);
    } catch (error) {
      console.error('Error calculating ghost position:', error);
      setGhostPosition({ top: 40, left: 20 });
    }
  }, [editor, pendingCompletion]);

  // Accept suggestion
  const acceptSuggestion = useCallback(() => {
    const currentCompletion = pendingCompletionRef.current;
    
    if (!editor || !currentCompletion.trim()) return false;
    
    try {
      console.log('🎯 Accepting suggestion:', currentCompletion);
      
      // Mark as accepted first to prevent race conditions
      wasAcceptedRef.current = true;
      
      // Clear the suggestion state immediately
      console.log('🧹 Clearing pending completion state');
      setPendingCompletion('');
      pendingCompletionRef.current = '';
      
      // Use setTimeout to avoid transaction conflicts in keyboard handler
      setTimeout(() => {
        try {
          if (editor && !editor.isDestroyed) {
            // Use the insertContent command which is safer
            const success = editor.commands.insertContent(currentCompletion);
            if (!success) {
              console.warn('⚠️ InsertContent command returned false');
            }
          }
        } catch (insertError) {
          console.error('❌ Error in delayed insert:', insertError);
        }
      }, 0);
      
      return true;
    } catch (error) {
      console.error('❌ Error accepting suggestion:', error);
      return false;
    }
  }, [editor]);

  // Dismiss suggestion
  const dismissSuggestion = useCallback(() => {
    console.log('🗑️ Dismissing suggestion');
    
    // Mark as dismissed to prevent the useEffect from overriding
    wasAcceptedRef.current = true;
    
    setPendingCompletion('');
    pendingCompletionRef.current = '';
    return true;
  }, []);

  // Request new suggestion
  const requestSuggestion = useCallback(async () => {
    if (completionProvider.isLoading || !editor || !config.enabled) {
      console.log('🚫 Request blocked:', { 
        loading: completionProvider.isLoading, 
        editor: !!editor, 
        enabled: config.enabled 
      });
      return;
    }

    // Reset the accepted flag for new requests
    wasAcceptedRef.current = false;

    const text = editor.getText();
    const prompt = config.promptTemplate(text);

    setPendingCompletion('');
    pendingCompletionRef.current = '';

    console.log('🎯 Requesting suggestion with prompt:', prompt.substring(0, 100) + '...');
    await completionProvider.complete(prompt, {
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      stop: config.stopSequences,
    });
  }, [editor, completionProvider, config]);

  // Check if current completion exists and feature is enabled
  const hasPendingCompletion = useCallback(() => {
    return config.enabled && pendingCompletionRef.current.trim().length > 0;
  }, [config.enabled]);

  // Function to register handlers - called directly from onCreate
  const registerHandlers = useCallback((targetEditor: Editor) => {
    // Try to get the extension instance directly
    const extension = targetEditor.extensionManager.extensions.find(
      (ext) => ext.name === 'aiAutocomplete'
    );

    console.log('🔍 Extension found:', !!extension);
    console.log('🔍 Extension:', extension);

    if (extension) {
      // Try to access storage via the editor's storage system
      const editorStorage = targetEditor.storage.aiAutocomplete;
      console.log('🔍 Editor storage for aiAutocomplete:', editorStorage);
      
      let editorId = editorStorage?.editorId;
      
      // If no ID in storage, generate one and set it
      if (!editorId) {
        editorId = Math.random().toString(36).substr(2, 9);
        if (editorStorage) {
          editorStorage.editorId = editorId;
        }
        console.log('🆔 Generated new editor ID:', editorId);
      }

      editorIdRef.current = editorId;

      // Register handlers with the extension
      console.log('🔧 Registering AI autocomplete handlers for editor:', editorId);
      registerAIAutocompleteHandlers(editorId, {
        acceptSuggestion,
        dismissSuggestion,
        requestSuggestion,
        hasPendingCompletion,
      });
      console.log('✅ Handlers registered successfully');

      // Setup editor event listeners for ghost position updates
      const handleUpdate = () => {
        setTimeout(updateGhostPosition, 0);
      };

      targetEditor.on('selectionUpdate', handleUpdate);
      targetEditor.on('update', handleUpdate);

      // Return cleanup function
      return () => {
        targetEditor.off('selectionUpdate', handleUpdate);
        targetEditor.off('update', handleUpdate);
        unregisterAIAutocompleteHandlers(editorId);
      };
    }
    
    return () => {};
  }, [acceptSuggestion, dismissSuggestion, requestSuggestion, hasPendingCompletion, updateGhostPosition]);

  // Register handlers when editor changes
  useEffect(() => {
    if (!editor) return;
    return registerHandlers(editor);
  }, [editor, registerHandlers]);

  // Update ghost position when relevant state changes
  useEffect(() => {
    updateGhostPosition();
  }, [pendingCompletion, updateGhostPosition]);

  return {
    pendingCompletion,
    ghostPosition,
    acceptSuggestion,
    dismissSuggestion,
    requestSuggestion,
    registerHandlers,
    isLoading: completionProvider.isLoading,
    config,
  };
}