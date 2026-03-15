import { useCallback, useEffect, useMemo, useState } from 'react';

type ExplorerSection = 'hero' | 'services' | 'products' | 'cta';

interface ExplorerState {
  visited: Record<ExplorerSection, boolean>;
  points: number;
}

export interface AchievementState {
  id: ExplorerSection | 'master';
  title: string;
  description: string;
  unlocked: boolean;
}

const STORAGE_KEY = 'topheights_explorer_state';
const sectionKeys: ExplorerSection[] = ['hero', 'services', 'products', 'cta'];

const createDefaultState = (): ExplorerState => ({
  visited: sectionKeys.reduce(
    (acc, key) => ({ ...acc, [key]: false }),
    {} as Record<ExplorerSection, boolean>
  ),
  points: 40,
});

const readSavedState = (): ExplorerState => {
  if (typeof window === 'undefined') {
    return createDefaultState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...createDefaultState(), ...JSON.parse(raw) };
    }
  } catch (error) {
    console.warn('Explorer state load failed', error);
  }

  return createDefaultState();
};

const clampPoints = (value: number) => Math.max(0, value);

const useExplorerTracker = () => {
  const [state, setState] = useState<ExplorerState>(() => readSavedState());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Explorer state save failed', error);
    }
  }, [state]);

  const markSectionVisited = useCallback((section: ExplorerSection) => {
    setState((current) => {
      if (current.visited[section]) {
        return current;
      }
      return {
        ...current,
        visited: { ...current.visited, [section]: true },
        points: current.points + 5,
      };
    });
  }, []);

  const addPoints = useCallback((value: number) => {
    setState((current) => ({
      ...current,
      points: clampPoints(current.points + value),
    }));
  }, []);

  const progress = useMemo(() => {
    const unlocked = sectionKeys.filter((section) => state.visited[section]).length;
    if (sectionKeys.length === 0) {
      return 0;
    }
    return unlocked / sectionKeys.length;
  }, [state.visited]);

  const achievements = useMemo<AchievementState[]>(() => {
    const base: AchievementState[] = sectionKeys.map((section) => {
      const map: Record<ExplorerSection, { title: string; description: string }> = {
        hero: {
          title: 'Curious Circuit',
          description: 'Touched the luminous hero spotlight',
        },
        services: {
          title: 'Service Scout',
          description: 'Explored the solutions grid',
        },
        products: {
          title: 'Spark Cartographer',
          description: 'Browsed featured power tools',
        },
        cta: {
          title: 'Voyager Pulse',
          description: 'Engaged with the mission call',
        },
      };

      return {
        id: section,
        title: map[section].title,
        description: map[section].description,
        unlocked: state.visited[section],
      };
    });

    return [
      ...base,
      {
        id: 'master',
        title: 'TopHeights Voyager',
        description: 'Visited every premium section of the experience',
        unlocked: progress === 1,
      },
    ];
  }, [state.visited, progress]);

  return {
    achievements,
    addPoints,
    markSectionVisited,
    points: state.points,
    progress,
  };
};

export default useExplorerTracker;
