import { collection, getDocs, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Purchase, Provider } from '../types';
import { updateStock } from './productService';

export const getPurchases = async () => {
  const q = query(collection(db, 'purchases'), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase));
};

export const subscribeToPurchases = (callback: (data: Purchase[]) => void) => {
  const q = query(collection(db, 'purchases'), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase)));
  });
};

export const createPurchase = async (purchase: Omit<Purchase, 'id'>) => {
  const docRef = await addDoc(collection(db, 'purchases'), {
    ...purchase,
    date: serverTimestamp()
  });
  
  // Update inventory stocks
  for (const item of purchase.items) {
    await updateStock(item.productId, item.qty);
  }
  
  return docRef.id;
};

// Providers
export const subscribeToProviders = (callback: (data: Provider[]) => void) => {
  return onSnapshot(collection(db, 'providers'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Provider)));
  });
};

export const addProvider = async (provider: Omit<Provider, 'id'>) => {
  return await addDoc(collection(db, 'providers'), provider);
};
