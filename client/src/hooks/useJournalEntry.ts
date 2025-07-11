import { useState } from 'react';

// Global state for journal entry text
let globalJournalText = '';
let globalJournalSetter: ((text: string) => void) | null = null;

export function useJournalEntry() {
  const [text, setText] = useState(globalJournalText);

  // Register this component's setter as the global one
  if (!globalJournalSetter) {
    globalJournalSetter = setText;
  }

  const updateText = (newText: string) => {
    globalJournalText = newText;
    setText(newText);
    if (globalJournalSetter && globalJournalSetter !== setText) {
      globalJournalSetter(newText);
    }
  };

  return {
    text,
    updateText
  };
}

// Function to set journal text from anywhere in the app
export function setGlobalJournalText(text: string) {
  globalJournalText = text;
  if (globalJournalSetter) {
    globalJournalSetter(text);
  }
}