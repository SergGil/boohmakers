import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const nicknameCache = new Map<string, string | null>();

/** Resolves each uid's current profile nickname, falling back to the caller-supplied name if unset. */
export function useDisplayNames(uids: string[]): Map<string, string> {
  const [, forceRender] = useState(0);
  const key = [...new Set(uids)].sort().join(',');

  useEffect(() => {
    const missing = key ? key.split(',').filter((uid) => !nicknameCache.has(uid)) : [];
    if (missing.length === 0) return;

    let cancelled = false;
    Promise.all(
      missing.map(async (uid) => {
        const snap = await getDoc(doc(db, 'users', uid));
        const nickname = snap.exists() ? (snap.data().nickname as string | undefined) : undefined;
        nicknameCache.set(uid, nickname?.trim() || null);
      }),
    ).then(() => {
      if (!cancelled) forceRender((n) => n + 1);
    });

    return () => {
      cancelled = true;
    };
  }, [key]);

  const result = new Map<string, string>();
  for (const uid of key ? key.split(',') : []) {
    const nickname = nicknameCache.get(uid);
    if (nickname) result.set(uid, nickname);
  }
  return result;
}
