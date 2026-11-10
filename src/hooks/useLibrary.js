import { useCallback, useEffect, useState } from 'react';
import { addProject, listProjects, removeProject } from '../lib/projectStore.js';

/** Loads one category's entries and exposes add/remove that keep the list in sync. */
export function useLibrary(category) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  useEffect(() => {
    let cancelled = false;
    listProjects(category)
      .then((rows) => {
        if (cancelled) return;
        setItems(rows);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  const add = useCallback(async (project) => {
    const saved = await addProject(project);
    setItems((current) => [saved, ...current]);
  }, []);

  const remove = useCallback(async (id) => {
    await removeProject(id);
    setItems((current) => current.filter((project) => project.id !== id));
  }, []);

  return { items, status, add, remove };
}
