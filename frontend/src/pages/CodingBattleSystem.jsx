import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Zap, Shield, Target, Trophy, Play, RotateCcw, 
  ChevronRight, Award, Code2, Clock, Users, ArrowLeft, Send, Sparkles 
} from 'lucide-react';
import { animateCombo, xpBurst, shakeError } from '../utils/gameAnimations';
import './CodingBattleSystem.css';

// Mock matchmaking opponents
const MATCH_OPPONENTS = [
  { name: 'NullPointer_Ninja', elo: 1840, avatar: '🥷', difficulty: 'Medium' },
  { name: 'Syntax_Error_Sorcerer', elo: 1910, avatar: '🧙', difficulty: 'Hard' },
  { name: 'Stack_Overflow_Surfer', elo: 1720, avatar: '🏄', difficulty: 'Easy' },
  { name: 'Java_Jedi', elo: 1890, avatar: '🤺', difficulty: 'Medium' },
  { name: 'Garbage_Collector_Pro', elo: 1980, avatar: '🧹', difficulty: 'Hard' }
];

const PROBLEMS = [
  {
    id: 1,
    title: 'Two Sum Strategy',
    difficulty: 'Medium',
    elo: 1850,
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    starterCode: {
      java: `public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your implementation here\n        for (int i = 0; i < nums.length; i++) {\n            for (int j = i + 1; j < nums.length; j++) {\n                if (nums[i] + nums[j] == target) {\n                    return new int[]{i, j};\n                }\n            }\n        }\n        return new int[]{};\n    }\n}`,
      python: `def two_sum(nums, target):\n    # Your implementation here\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []`,
      cpp: `#include <vector>\n#include <unordered_map>\n\nclass Solution {\npublic:\n    std::vector<int> twoSum(std::vector<int>& nums, int target) {\n        std::unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); ++i) {\n            int complement = target - nums[i];\n            if (seen.count(complement)) {\n                return {seen[complement], i};\n            }\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};`
    },
    ghostPredictions: {
      java: [
        '// Use hashmap for O(N) complexity',
        'Map<Integer, Integer> map = new HashMap<>();',
        'for (int i = 0; i < nums.length; i++) {',
        '    int diff = target - nums[i];',
        '    if (map.containsKey(diff)) {',
        '        return new int[] { map.get(diff), i };',
        '    }',
        '    map.put(nums[i], i);',
        '}'
      ],
      python: [
        '# Use hashmap for O(N) complexity',
        'seen = {}',
        'for i, num in enumerate(nums):',
        '    diff = target - num',
        '    if diff in seen:',
        '        return [seen[diff], i]',
        '    seen[num] = i'
      ],
      cpp: [
        '// Use hashmap for O(N) complexity',
        'std::unordered_map<int, int> seen;',
        'for (int i = 0; i < nums.size(); ++i) {',
        '    int diff = target - nums[i];',
        '    if (seen.count(diff)) {',
        '        return {seen[diff], i};',
        '    }',
        '    seen[nums[i]] = i;',
        '}'
      ]
    },
    testCases: [
      { input: 'nums = [2,7,11,15], target = 9', expected: '[0,1]', status: 'pending' },
      { input: 'nums = [3,2,4], target = 6', expected: '[1,2]', status: 'pending' },
      { input: 'nums = [3,3], target = 6', expected: '[0,1]', status: 'pending' }
    ]
  }
];

export default function CodingBattleSystem({ onExit }) {
  // Game state
  const [battleState, setBattleState] = useState('lobby'); // lobby, matchmaking, battle, completed, failed
  const [playerElo, setPlayerElo] = useState(1800);
  const [winStreak, setWinStreak] = useState(3);
  
  // Matchmaking
  const [opponent, setOpponent] = useState(null);
  const [matchmakingProgress, setMatchmakingProgress] = useState(0);
  
  // Battle state
  const [selectedLanguage, setSelectedLanguage] = useState('java');
  const [currentProblem] = useState(PROBLEMS[0]);
  const [codeContent, setCodeContent] = useState('');
  const [cursorIndex, setCursorIndex] = useState(0);
  
  // AI Prediction Ghost overlay state
  const [ghostLineIndex, setGhostLineIndex] = useState(0);
  const [aiConfidence, setAiConfidence] = useState(85);
  
  // Battle dynamic timers
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes for battle
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [totalKeys, setTotalKeys] = useState(0);
  const [correctKeys, setCorrectKeys] = useState(0);
  const [combo, setCombo] = useState(1);
  const [testCases, setTestCases] = useState(PROBLEMS[0].testCases);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'System', text: 'Match started! Good luck.' }
  ]);
  const [customChatMessage, setCustomChatMessage] = useState('');
  
  // Replay metrics timeline
  const [replayEvents, setReplayEvents] = useState([]);
  
  const codeTextareaRef = useRef(null);
  const comboRef = useRef(null);
  
  // Load initial starter code on language selection
  useEffect(() => {
    if (currentProblem && currentProblem.starterCode[selectedLanguage]) {
      setCodeContent(currentProblem.starterCode[selectedLanguage]);
    }
  }, [selectedLanguage, currentProblem, battleState]);

  // Matchmaking Sim
  useEffect(() => {
    let interval;
    if (battleState === 'matchmaking') {
      setMatchmakingProgress(0);
      interval = setInterval(() => {
        setMatchmakingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            const randomOpponent = MATCH_OPPONENTS[Math.floor(Math.random() * MATCH_OPPONENTS.length)];
            setOpponent(randomOpponent);
            setBattleState('battle');
            setTimeLeft(180);
            setOpponentProgress(0);
            setAccuracy(100);
            setTotalKeys(0);
            setCorrectKeys(0);
            setCombo(1);
            setTestCases(currentProblem.testCases.map(tc => ({ ...tc, status: 'pending' })));
            setReplayEvents([]);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [battleState]);

  // Battle countdown timers & opponent simulation
  useEffect(() => {
    let timer;
    if (battleState === 'battle') {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setBattleState('failed');
            return 0;
          }
          // Log timeline event for replay periodically
          if (prev % 20 === 0) {
            setReplayEvents(rev => [...rev, {
              time: 180 - prev,
              playerProgress: Math.min(100, Math.round((codeContent.length / 500) * 100)),
              opponentProgress: Math.round(opponentProgress),
              wpm: Math.round((correctKeys / 5) / ((180 - prev) / 60 || 1))
            }]);
          }
          return prev - 1;
        });

        // Opponent progress simulation
        setOpponentProgress((prev) => {
          const nextProgress = prev + (Math.random() * 1.5);
          if (nextProgress >= 100) {
            // Opponent finished! Finish game as defeat if opponent completes all cases
            clearInterval(timer);
            setBattleState('failed');
            return 100;
          }
          return nextProgress;
        });

        // Randomly simulate opponent chat reactions
        if (Math.random() < 0.08) {
          const reactions = ['🔥 Nice speed!', '💻 Almost done!', '⚡ ELO is mine!', '🤯 What a challenge!', '👾 Happy coding!'];
          const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
          setChatMessages(prev => [...prev, { sender: opponent?.name || 'Opponent', text: randomReaction }]);
        }

      }, 1000);
    }
    return () => clearInterval(timer);
  }, [battleState, opponent, codeContent, correctKeys, opponentProgress]);

  // Track cursor position to display custom ghost overlays or prediction indicators
  const handleTextareaSelect = (e) => {
    setCursorIndex(e.target.selectionStart);
  };

  // Keyboard listeners for dynamic combos, predictions, and accuracies
  const handleKeyDown = (e) => {
    if (battleState !== 'battle') return;
    setTotalKeys(prev => prev + 1);
    
    // Simulate keyboard accuracy and combo increment
    const isTypoChance = Math.random() > 0.95; // 5% typo simulator
    if (!isTypoChance) {
      setCorrectKeys(prev => prev + 1);
      const newCombo = Math.min(combo + 1, 20);
      setCombo(newCombo);
      if (comboRef.current) {
        animateCombo(comboRef.current, newCombo);
      }
    } else {
      setCombo(1);
      if (comboRef.current) {
        animateCombo(comboRef.current, 1);
      }
    }

    setAccuracy(Math.round((correctKeys / (totalKeys || 1)) * 100));

    // Handle Tab to simulate accepting AI Ghost text prediction
    if (e.key === 'Tab') {
      e.preventDefault();
      const ghostPredictionLines = currentProblem.ghostPredictions[selectedLanguage] || [];
      if (ghostLineIndex < ghostPredictionLines.length) {
        const nextGhostLine = ghostPredictionLines[ghostLineIndex];
        setCodeContent(prev => prev + '\n' + nextGhostLine);
        setGhostLineIndex(prev => prev + 1);
        setAiConfidence(Math.min(100, Math.round(80 + Math.random() * 20)));
      }
    }
  };

  // Chat message sending
  const sendChatMessage = () => {
    if (!customChatMessage.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'You', text: customChatMessage }]);
    setCustomChatMessage('');
  };

  // Compile and run code to solve battle
  const runTestCases = () => {
    // Transition test cases to running
    setTestCases(tc => tc.map(t => ({ ...t, status: 'running' })));
    
    setTimeout(() => {
      // All correct for simplicity
      setTestCases(tc => tc.map(t => ({ ...t, status: 'success' })));
      
      // Conclude match as win
      setBattleState('completed');
      setPlayerElo(prev => prev + 25);
      setWinStreak(prev => prev + 1);
    }, 1500);
  };

  return (
    <div className="battle-arena-container">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#7c3aed]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#2563eb]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* LOBBY VIEW */}
      {battleState === 'lobby' && (
        <div className="lobby-panel">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={onExit} className="exit-btn">
              <ArrowLeft size={16} />
              <span>Back to Hub</span>
            </button>
            <h1 className="lobby-title">ELO Coding Battle</h1>
          </div>

          <div className="lobby-dashboard">
            {/* Rank Card */}
            <div className="stat-card">
              <div className="stat-header">
                <Trophy className="text-yellow-500" size={24} />
                <span className="stat-label">Global Rank</span>
              </div>
              <div className="stat-value">Rank 1,842</div>
              <div className="stat-sub">{playerElo} ELO (Bronze ✦)</div>
            </div>

            {/* Streak Card */}
            <div className="stat-card">
              <div className="stat-header">
                <Flame className="text-orange-500" size={24} />
                <span className="stat-label">Win Streak</span>
              </div>
              <div className="stat-value">{winStreak} Wins</div>
              <div className="stat-sub">Keep the flame alive!</div>
            </div>
          </div>

          {/* Operations & Launch Grid */}
          <div className="lobby-operations-grid">
            {/* Left: Operations Configuration */}
            <div className="stat-card operations-config">
              <div className="stat-header">
                <Sparkles className="text-purple-400" size={20} />
                <span className="stat-label">Match Configuration</span>
              </div>
              
              <div className="space-y-4 mt-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1 font-bold">Select Game Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="op-tab active">Ranked 1v1</button>
                    <button className="op-tab">AI Practice</button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1 font-bold">Difficulty Scaling</label>
                  <div className="grid grid-cols-3 gap-1">
                    <button className="op-difficulty active">Dynamic</button>
                    <button className="op-difficulty">Apprentice</button>
                    <button className="op-difficulty">Grandmaster</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle: Launchpad */}
            <div className="matchmaking-launchpad">
              <h2 className="match-prompt">Ready to Duel?</h2>
              <p className="match-desc">Match against online players or advanced AI bots scaled to your ELO.</p>
              <button onClick={() => setBattleState('matchmaking')} className="match-btn">
                <Zap className="mr-2" size={18} />
                Find Match
              </button>
            </div>

            {/* Right: Operations & Recent Logs */}
            <div className="stat-card operations-log">
              <div className="stat-header">
                <Code2 className="text-blue-400" size={20} />
                <span className="stat-label">Recent Duel Logs</span>
              </div>
              <div className="mt-2 space-y-2 max-h-[140px] overflow-y-auto scrollbar-thin">
                <div className="flex justify-between items-center text-xs p-2 rounded bg-slate-800/40 border border-slate-700/50">
                  <span className="text-emerald-400 font-semibold">Victory</span>
                  <span className="text-slate-300">vs NullPointer_Ninja</span>
                  <span className="text-slate-400">+25 ELO</span>
                </div>
                <div className="flex justify-between items-center text-xs p-2 rounded bg-slate-800/40 border border-slate-700/50">
                  <span className="text-rose-400 font-semibold">Defeat</span>
                  <span className="text-slate-300">vs Java_Jedi</span>
                  <span className="text-slate-400">-15 ELO</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MATCHMAKING VIEW */}
      {battleState === 'matchmaking' && (
        <div className="matchmaking-panel">
          <div className="spinner-container">
            <div className="radar-circle" />
            <Users className="matchmaker-icon" size={48} />
          </div>
          <h2 className="matchmaking-title">Searching for Opponents...</h2>
          <p className="matchmaking-status">Current ELO: {playerElo} | Matching Range: {playerElo - 50} - {playerElo + 50}</p>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${matchmakingProgress}%` }} />
          </div>
          <button onClick={() => setBattleState('lobby')} className="cancel-match-btn">
            Cancel Search
          </button>
        </div>
      )}

      {/* BATTLE ARENA GRID */}
      {(battleState === 'battle' || battleState === 'completed' || battleState === 'failed') && (
        <div className="arena-grid">
          {/* Header */}
          <div className="arena-header col-span-12">
            <div className="player-stats-bar">
              <div className="player-badge">
                <span className="player-avatar">🦸</span>
                <div>
                  <div className="player-name">You</div>
                  <div className="player-elo-label">{playerElo} ELO</div>
                </div>
              </div>
              
              <div className="battle-vs">VS</div>

              <div className="player-badge flex-row-reverse">
                <span className="player-avatar">{opponent?.avatar || '👾'}</span>
                <div className="text-right">
                  <div className="player-name">{opponent?.name || 'Searching...'}</div>
                  <div className="player-elo-label">{opponent?.elo || 1850} ELO</div>
                </div>
              </div>
            </div>

            <div className="arena-timers">
              <div className="timer-badge">
                <Clock className="mr-1.5" size={16} />
                <span>{timeLeft}s</span>
              </div>
              <div className="confidence-track">
                <span className="confidence-label"><Sparkles size={12} className="mr-1 inline text-purple-400" /> AI Confidence</span>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width: `${aiConfidence}%` }} />
                  <span className="confidence-percent">{aiConfidence}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Left Panel: Problem Statement */}
          <div className="problem-panel col-span-3">
            <h3 className="panel-title">{currentProblem.title}</h3>
            <div className="difficulty-tag font-semibold text-purple-400 mb-4">{currentProblem.difficulty} | {currentProblem.elo} ELO</div>
            
            <p className="problem-text">{currentProblem.description}</p>
            
            <h4 className="section-title mt-6 mb-2">Constraints</h4>
            <ul className="constraints-list">
              {currentProblem.constraints.map((c, i) => (
                <li key={i} className="constraint-item font-mono text-xs">{c}</li>
              ))}
            </ul>
          </div>

          {/* Center Panel: Code Workspace */}
          <div className="editor-panel col-span-6">
            <div className="editor-tab-bar">
              <div className="tab-group">
                {['java', 'python', 'cpp'].map((lang) => (
                  <button 
                    key={lang} 
                    onClick={() => setSelectedLanguage(lang)} 
                    className={`tab-btn capitalize ${selectedLanguage === lang ? 'active' : ''}`}
                  >
                    {lang === 'cpp' ? 'C++' : lang}
                  </button>
                ))}
              </div>
              <div className="run-button-group">
                <button onClick={runTestCases} className="run-btn" disabled={battleState !== 'battle'}>
                  Compile & Run
                </button>
              </div>
            </div>

            <div className="editor-workspace">
              <div className="line-numbers">
                {Array.from({ length: Math.max(15, codeContent.split('\n').length + 3) }).map((_, i) => (
                  <div key={i} className="line-num">{i + 1}</div>
                ))}
              </div>
              <div className="textarea-container">
                <textarea
                  ref={codeTextareaRef}
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  onSelect={handleTextareaSelect}
                  onKeyDown={handleKeyDown}
                  disabled={battleState !== 'battle'}
                  spellCheck="false"
                  className="code-textarea"
                />
                
                {/* AI Ghost overlay line */}
                {battleState === 'battle' && (
                  <div className="ghost-predictions-container font-mono text-sm pointer-events-none select-none">
                    {/* Render next predictive lines as subtle green ghost-text */}
                    {currentProblem.ghostPredictions[selectedLanguage]?.slice(ghostLineIndex, ghostLineIndex + 3).map((line, i) => (
                      <div key={i} className="ghost-line opacity-30 text-emerald-400">
                        {line}
                      </div>
                    ))}
                    {currentProblem.ghostPredictions[selectedLanguage] && ghostLineIndex < currentProblem.ghostPredictions[selectedLanguage].length && (
                      <div className="ghost-hint mt-2 text-[10px] text-purple-400 animate-pulse">
                        💡 Press [Tab] to insert predictive AI strategy
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Performance HUD */}
            <div className="performance-hud">
              <div className="metric-box">
                <span className="metric-label">Accuracy</span>
                <span className="metric-value">{accuracy}%</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Combo</span>
                <span ref={comboRef} className="metric-value text-orange-400">x{combo}</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Opponent progress</span>
                <div className="opponent-progress-bar">
                  <div className="opponent-progress-fill" style={{ width: `${opponentProgress}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Duel Progress & Chat */}
          <div className="duel-panel col-span-3">
            <h3 className="panel-title">Duel Feed</h3>
            
            <div className="test-cases-zone">
              <h4 className="section-title mb-2">Test Cases</h4>
              <div className="test-cases-list">
                {testCases.map((tc, idx) => (
                  <div key={idx} className="test-case-item">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span>Case {idx + 1}: {tc.input}</span>
                      <span className={`case-badge ${tc.status}`}>{tc.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chat-arena">
              <h4 className="section-title mt-4 mb-2">Battle Chat</h4>
              <div className="chat-messages scrollbar-thin">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`chat-bubble ${msg.sender === 'You' ? 'me' : 'them'}`}>
                    <span className="sender">{msg.sender}:</span>
                    <span className="text">{msg.text}</span>
                  </div>
                ))}
              </div>
              <div className="chat-input-row">
                <input 
                  type="text" 
                  value={customChatMessage} 
                  onChange={(e) => setCustomChatMessage(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Send match emoji or chat..." 
                  className="chat-input"
                />
                <button onClick={sendChatMessage} className="chat-send-btn">
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Match Completion Overlays */}
          <AnimatePresence>
            {battleState === 'completed' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="battle-result-overlay win"
              >
                <div className="result-modal">
                  <Award className="result-icon win" size={64} />
                  <h2 className="result-title">Victory!</h2>
                  <p className="result-desc">You solved the strategy challenge ahead of the opponent!</p>
                  
                  <div className="elo-bump font-semibold text-emerald-400">+25 ELO Points</div>
                  
                  <div className="replay-timeline">
                    <h4 className="timeline-title mb-2">Duels Performance Timeline</h4>
                    <div className="flex gap-2 justify-center">
                      {replayEvents.slice(-5).map((evt, idx) => (
                        <div key={idx} className="timeline-dot">
                          <span className="text-[10px] block text-white/50">{evt.time}s</span>
                          <span className="text-xs font-bold font-mono">P:{evt.playerProgress}% / O:{evt.opponentProgress}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => setBattleState('lobby')} className="continue-btn win">
                    Continue to Lobby
                  </button>
                </div>
              </motion.div>
            )}

            {battleState === 'failed' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="battle-result-overlay lose"
              >
                <div className="result-modal">
                  <RotateCcw className="result-icon lose" size={64} />
                  <h2 className="result-title">Defeat</h2>
                  <p className="result-desc">Your opponent completed the challenge first, or time expired.</p>
                  
                  <div className="elo-bump font-semibold text-red-400">-15 ELO Points</div>
                  
                  <button onClick={() => setBattleState('lobby')} className="continue-btn lose">
                    Return to Lobby
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
