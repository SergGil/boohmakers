import {
  addDoc,
  arrayUnion,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { calculatePoints } from './scoring';
import type { Competition, Match, Prediction, UserProfile } from '../types';

export async function createCompetition(name: string, ownerId: string): Promise<string> {
  const ref = await addDoc(collection(db, 'competitions'), {
    name,
    ownerId,
    memberIds: [ownerId],
    createdAt: Date.now(),
  });
  return ref.id;
}

/** Adds uid to the competition's memberIds if not already present — placing a bet implies joining. */
export async function ensureMembership(competitionId: string, uid: string): Promise<void> {
  await updateDoc(doc(db, 'competitions', competitionId), { memberIds: arrayUnion(uid) });
}

export function subscribeToAllCompetitions(cb: (competitions: Competition[]) => void) {
  const q = query(collection(db, 'competitions'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Competition, 'id'>) })));
  });
}

export function subscribeToCompetition(id: string, cb: (competition: Competition | null) => void) {
  return onSnapshot(doc(db, 'competitions', id), (snap) => {
    cb(snap.exists() ? { id: snap.id, ...(snap.data() as Omit<Competition, 'id'>) } : null);
  });
}

export async function addMatch(
  competitionId: string,
  match: Omit<Match, 'id' | 'status' | 'homeScore' | 'awayScore'>,
): Promise<void> {
  await addDoc(collection(db, 'competitions', competitionId, 'matches'), {
    ...match,
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
  });
}

export function subscribeToMatches(competitionId: string, cb: (matches: Match[]) => void) {
  const q = collection(db, 'competitions', competitionId, 'matches');
  return onSnapshot(q, (snap) => {
    const matches = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Match, 'id'>) }))
      .sort((a, b) => a.kickoff - b.kickoff);
    cb(matches);
  });
}

export async function setMatchResult(
  competitionId: string,
  matchId: string,
  homeScore: number,
  awayScore: number,
): Promise<void> {
  await updateDoc(doc(db, 'competitions', competitionId, 'matches', matchId), {
    homeScore,
    awayScore,
    status: 'finished',
  });
}

export async function submitPrediction(
  competitionId: string,
  matchId: string,
  prediction: Prediction,
): Promise<void> {
  await setDoc(
    doc(db, 'competitions', competitionId, 'matches', matchId, 'predictions', prediction.uid),
    prediction,
  );
}

export function subscribeToPredictions(
  competitionId: string,
  matchId: string,
  cb: (predictions: Prediction[]) => void,
) {
  const q = collection(db, 'competitions', competitionId, 'matches', matchId, 'predictions');
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => d.data() as Prediction));
  });
}

export async function getOwnPrediction(
  competitionId: string,
  matchId: string,
  uid: string,
): Promise<Prediction | null> {
  const snap = await getDoc(doc(db, 'competitions', competitionId, 'matches', matchId, 'predictions', uid));
  return snap.exists() ? (snap.data() as Prediction) : null;
}

export function subscribeToOwnPrediction(
  competitionId: string,
  matchId: string,
  uid: string,
  cb: (prediction: Prediction | null) => void,
) {
  return onSnapshot(doc(db, 'competitions', competitionId, 'matches', matchId, 'predictions', uid), (snap) => {
    cb(snap.exists() ? (snap.data() as Prediction) : null);
  });
}

export function subscribeToUserProfile(uid: string, cb: (profile: UserProfile | null) => void) {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    cb(snap.exists() ? (snap.data() as UserProfile) : null);
  });
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(doc(db, 'users', profile.uid), profile);
}

export interface UserStats {
  totalPoints: number;
  totalBets: number;
  averagePoints: number;
}

/** Aggregates a player's points/bets across every competition they've predicted in. */
export async function getUserStats(uid: string): Promise<UserStats> {
  const q = query(collectionGroup(db, 'predictions'), where('uid', '==', uid));
  const snap = await getDocs(q);

  let totalPoints = 0;
  let totalBets = 0;

  await Promise.all(
    snap.docs.map(async (predictionDoc) => {
      const matchRef = predictionDoc.ref.parent.parent;
      if (!matchRef) return;
      const matchSnap = await getDoc(matchRef);
      if (!matchSnap.exists()) return;
      const match = { id: matchSnap.id, ...(matchSnap.data() as Omit<Match, 'id'>) };
      if (match.status !== 'finished') return;
      totalBets += 1;
      totalPoints += calculatePoints(match, predictionDoc.data() as Prediction);
    }),
  );

  return { totalPoints, totalBets, averagePoints: totalBets ? totalPoints / totalBets : 0 };
}
