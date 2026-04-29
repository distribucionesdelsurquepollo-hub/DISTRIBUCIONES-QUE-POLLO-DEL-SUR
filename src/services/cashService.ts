import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CashSession, CashMovement } from '../types';
import { format } from 'date-fns';

export const getSessionDate = () => {
  const now = new Date();
  const hour = now.getHours();
  // If after 7pm, it belongs to the next day's session logic for new transactions?
  // User says: "Toda transacción se registra automáticamente para el día siguiente"
  if (hour >= 19) {
    const nextDay = new Date(now);
    nextDay.setDate(now.getDate() + 1);
    return format(nextDay, 'yyyy-MM-dd');
  }
  return format(now, 'yyyy-MM-dd');
};

export const getCurrentSession = async () => {
  const date = getSessionDate();
  const q = query(collection(db, 'cashSessions'), where('date', '==', date));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as CashSession;
};

export const openSession = async (base: number) => {
  const date = getSessionDate();
  const docRef = await addDoc(collection(db, 'cashSessions'), {
    date,
    initialBase: base,
    status: 'open',
    totalSales: 0,
    totalPurchases: 0,
    totalEntries: 0,
    totalExits: 0,
    closingBalance: base
  });
  return docRef.id;
};

export const addMovement = async (movement: Omit<CashMovement, 'id'>) => {
  const session = await getCurrentSession();
  if (!session) throw new Error("No hay una sesión de caja abierta para hoy.");

  const docRef = await addDoc(collection(db, 'cashMovements'), {
    ...movement,
    date: serverTimestamp()
  });

  // Update session totals
  const sessionRef = doc(db, 'cashSessions', session.id!);
  const updates: any = {};
  if (movement.type === 'entry') {
    updates.totalEntries = session.totalEntries + movement.amount;
    updates.closingBalance = session.closingBalance + movement.amount;
  } else {
    updates.totalExits = session.totalExits + movement.amount;
    updates.closingBalance = session.closingBalance - movement.amount;
  }
  
  await updateDoc(sessionRef, updates);
  return docRef.id;
};
