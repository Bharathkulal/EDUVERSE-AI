import { useCommandAI } from '../../context/CommandAIContext';
import './CommandAI.css';

const QUICK_COMMANDS = [
  'Open Dashboard',
  'Start Java Quiz',
  'Open Smartboard',
  'Teach me Linked Lists',
  'Explain code',
  'Show progress',
  'Open settings',
  'Help'
];

export default function QuickCommands() {
  const { executeCommand, setIsPanelOpen } = useCommandAI();

  const handleChipClick = (cmd) => {
    executeCommand(cmd);
    setIsPanelOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        Suggested Commands
      </p>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {QUICK_COMMANDS.map((cmd, idx) => (
          <button
            key={idx}
            onClick={() => handleChipClick(cmd)}
            className="cai-chip"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
