import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

/*
 * Who can edit the library?
 *  - Online mode: only someone signed in (the owner account you create in Supabase;
 *    the database rules in supabase/setup.sql enforce this, the UI just follows).
 *  - Local mode: always you, since the data never leaves your browser anyway.
 */
export function useOwner() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!supabase) return undefined;
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setSignedIn(Boolean(data.session));
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  return { online: Boolean(supabase), canEdit: !supabase || signedIn, signIn, signOut };
}
