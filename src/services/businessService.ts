import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BusinessConfig } from '../types';

const CONFIG_DOC = 'config/business';

export const getBusinessConfig = async (): Promise<BusinessConfig | null> => {
  const docRef = doc(db, CONFIG_DOC);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as BusinessConfig) : null;
};

export const saveBusinessConfig = async (config: BusinessConfig): Promise<void> => {
  const docRef = doc(db, CONFIG_DOC);
  await setDoc(docRef, config);
};

export const subscribeToBusinessConfig = (callback: (config: BusinessConfig | null) => void) => {
  const docRef = doc(db, CONFIG_DOC);
  return onSnapshot(docRef, (doc) => {
    callback(doc.exists() ? (doc.data() as BusinessConfig) : null);
  }, (error) => {
    console.error("Error subscribing to business config:", error);
  });
};
