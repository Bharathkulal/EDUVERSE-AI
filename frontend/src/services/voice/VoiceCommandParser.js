// Voice Command Parser
// Matches transcripts to system navigation and assistant commands

class VoiceCommandParser {
  parse(transcript, actions = {}) {
    const text = transcript.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    
    console.log('[VoiceCommandParser] Parsing transcript:', text);

    // Mappings of spoken phrases to navigation routes
    const navRoutes = {
      'dashboard': '/dashboard',
      'profile': '/ai-profile',
      'courses': '/subjects',
      'subjects': '/subjects',
      'settings': '/settings',
      'practice': '/practice-hub',
      'coding': '/coding',
      'tutor': '/ai-tutor',
      'sql': '/dbms-lab',
      'calculus': '/mathematics/calculus'
    };

    // 1. Navigation Commands: "open [page]" or "go to [page]"
    if (text.startsWith('open ') || text.startsWith('go to ')) {
      const target = text.replace('open ', '').replace('go to ', '').trim();
      if (navRoutes[target] && actions.navigate) {
        actions.navigate(navRoutes[target]);
        return { command: 'navigate', param: navRoutes[target] };
      }
    }

    // Direct nav matches
    if (text === 'open dashboard' && actions.navigate) {
      actions.navigate('/dashboard');
      return { command: 'navigate', param: '/dashboard' };
    }
    if ((text === 'open profile' || text === 'open profile page') && actions.navigate) {
      actions.navigate('/ai-profile');
      return { command: 'navigate', param: '/ai-profile' };
    }
    if ((text === 'open courses' || text === 'open subjects') && actions.navigate) {
      actions.navigate('/subjects');
      return { command: 'navigate', param: '/subjects' };
    }

    // 2. Control Commands
    if (text === 'help me' || text === 'explain this page' || text === 'explain page') {
      if (actions.explain) actions.explain();
      return { command: 'explain' };
    }

    if (text === 'next' || text === 'go next') {
      if (actions.next) actions.next();
      return { command: 'next' };
    }

    if (text === 'go back' || text === 'back') {
      if (actions.back) actions.back();
      return { command: 'back' };
    }

    if (text === 'repeat' || text === 'repeat instruction') {
      if (actions.repeat) actions.repeat();
      return { command: 'repeat' };
    }

    if (text === 'stop' || text === 'pause' || text === 'mute') {
      if (actions.stop) actions.stop();
      return { command: 'stop' };
    }

    if (text === 'continue' || text === 'resume' || text === 'unmute') {
      if (actions.continue) actions.continue();
      return { command: 'continue' };
    }

    // 3. Fallback: Not a direct structural command
    return null;
  }
}

export default new VoiceCommandParser();
