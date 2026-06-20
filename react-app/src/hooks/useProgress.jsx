import { createContext, useContext, useState, useCallback } from 'react'
import * as storage from './progressStorage.js'

const ProgressContext = createContext(null);

function useProgress() {
  const [data, setData] = useState(() => storage.load());

  const refresh = useCallback((fn) => {
    setData(fn());
  }, []);

  const markComplete = useCallback((id) => {
    refresh(() => storage.markComplete(id));
  }, [refresh]);

  const toggleBookmark = useCallback((id) => {
    refresh(() => storage.toggleBookmark(id));
  }, [refresh]);

  const setLastVisited = useCallback((id) => {
    refresh(() => storage.setLastVisited(id));
  }, [refresh]);

  const isCompleted    = useCallback((id) => Boolean(data[id]?.completed),    [data]);
  const isBookmarked   = useCallback((id) => Boolean(data[id]?.bookmarked),   [data]);
  const getLastVisited = useCallback((id) => data[id]?.lastVisited || null,    [data]);

  const getTrackProgress = useCallback((moduleIds) => ({
    completed: moduleIds.filter(id => data[id]?.completed).length,
    total: moduleIds.length,
  }), [data]);

  return { data, markComplete, toggleBookmark, setLastVisited, isCompleted, isBookmarked, getLastVisited, getTrackProgress };
}

export function ProgressProvider({ children }) {
  const value = useProgress();
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export const useProgressContext = () => useContext(ProgressContext);
