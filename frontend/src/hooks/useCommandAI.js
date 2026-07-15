import { useContext } from 'react';
import CommandAIContext from '../context/CommandAIContext';

export function useCommandAI() {
  const context = useContext(CommandAIContext);
  if (!context) {
    throw new Error('useCommandAI must be used within a CommandAIProvider');
  }
  return context;
}
export default useCommandAI;
