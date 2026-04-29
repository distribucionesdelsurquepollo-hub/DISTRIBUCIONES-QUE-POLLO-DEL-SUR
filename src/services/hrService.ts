import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Employee, Attendance, EmployeeAdvance } from '../types';
import { format } from 'date-fns';

export const subscribeToEmployees = (callback: (data: Employee[]) => void) => {
  return onSnapshot(collection(db, 'employees'), (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)));
  });
};

export const addEmployee = async (employee: Omit<Employee, 'id'>) => {
  return await addDoc(collection(db, 'employees'), employee);
};

export const updateEmployee = async (id: string, data: Partial<Employee>) => {
  await updateDoc(doc(db, 'employees', id), data);
};

// Attendance
export const registerCheckIn = async (employeeId: string) => {
  const date = format(new Date(), 'yyyy-MM-dd');
  return await addDoc(collection(db, 'attendance'), {
    employeeId,
    date,
    checkIn: serverTimestamp(),
    novedades: ''
  });
};

export const registerCheckOut = async (attendanceId: string) => {
    await updateDoc(doc(db, 'attendance', attendanceId), {
        checkOut: serverTimestamp()
    });
};

export const subscribeToTodayAttendance = (callback: (data: Attendance[]) => void) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const q = query(collection(db, 'attendance'), where('date', '==', today));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance)));
    });
};

// Advances
export const addAdvance = async (advance: Omit<EmployeeAdvance, 'id'>) => {
    // Check limit? (User said 30% max)
    return await addDoc(collection(db, 'advances'), {
        ...advance,
        date: serverTimestamp()
    });
};

export const subscribeToAdvances = (employeeId: string, callback: (data: EmployeeAdvance[]) => void) => {
    const q = query(collection(db, 'advances'), where('employeeId', '==', employeeId));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmployeeAdvance)));
    });
};
