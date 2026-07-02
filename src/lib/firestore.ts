import {
  addDoc,
  arrayUnion,
  collection,
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
import type { Competition, Match, Prediction, UserProfile } from '../types';

const randomInviteCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

export async function createCompetition(name: string, ownerId: string): Promise<string> {
  const ref = await addDoc(collection(db, 'competitions'), {
    name,
    ownerId,
    inviteCode: randomInviteCode(),
    memberIds: [ownerId],
    createdAt: Date.now(),
  });
  return ref.id;
}

export async function joinCompetitionByCode(inviteCode: string, uid: string): Promise<string> {
  const q = query(collection(db, 'competitions'), where('inviteCode', '==', inviteCode.toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('Змагання з таким кодом не знайдено');
  const competitionDoc = snap.docs[0];
  await updateDoc(competitionDoc.ref, { memberIds: arrayUnion(uid) });
  return competitionDoc.id;
}

export function subscribeToUserCompetitions(uid: string, cb: (competitions: Competition[]) => void) {
  const q = query(collection(db, 'competitions'), where('memberIds', 'array-contains', uid));
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

export function subscribeToUserProfile(uid: string, cb: (profile: UserProfile | null) => void) {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    cb(snap.exists() ? (snap.data() as UserProfile) : null);
  });
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(doc(db, 'users', profile.uid), profile);
}
