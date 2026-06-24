import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook: reads the URL hash and calls a setter to activate the right tab/section.
 * @param {Object} hashToTabMap - e.g. { '#notes': 'notes', '#roadmaps': 'roadmap' }
 * @param {Function} setActiveTab - state setter for the active tab
 */
export function useHashNavigation(hashToTabMap, setActiveTab) {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (hash && hashToTabMap[hash]) {
      setActiveTab(hashToTabMap[hash]);
      // Scroll to top of page after tab switch
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.hash]);
}
