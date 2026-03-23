import { db } from "./firebase";
import {
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, writeBatch,
  where
} from "firebase/firestore";

// === COLLECTIONS ===
const USERS = "users";
const TRUCKS = "trucks";
const ASSIGNS = "assigns";
const HISTORY = "history";

// === USERS ===
export async function createUser(uid, data) {
  await setDoc(doc(db, USERS, uid), {
    name: data.name,
    email: data.email,
    role: data.role || "carretillero",
    createdAt: serverTimestamp(),
  });
}

export async function getUser(uid) {
  const snap = await getDoc(doc(db, USERS, uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export function onUsers(cb) {
  return onSnapshot(collection(db, USERS), (snap) => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function deleteUser(uid) {
  await deleteDoc(doc(db, USERS, uid));
}

export async function updateUserRole(uid, role) {
  await updateDoc(doc(db, USERS, uid), { role });
}

// === TRUCKS ===
export async function createTruck(data) {
  const ref = doc(collection(db, TRUCKS));
  await setDoc(ref, {
    route: data.route,
    positions: data.positions,
    arrivalTime: data.arrivalTime,
    departureTime: data.departureTime || "",
    status: data.status || "pending",
    loadNames: data.loadNames || [],
    posData: data.posData || {},
    createdBy: data.createdBy,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function onTrucks(cb) {
  return onSnapshot(
    query(collection(db, TRUCKS), orderBy("createdAt", "desc")),
    (snap) => {
      cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
  );
}

export async function updateTruck(id, data) {
  await updateDoc(doc(db, TRUCKS, id), data);
}

export async function deleteTruck(id) {
  await deleteDoc(doc(db, TRUCKS, id));
}

// === ASSIGNS ===
// Each admin has a doc with array of assigned user IDs
export function onAssigns(adminId, cb) {
  return onSnapshot(doc(db, ASSIGNS, adminId), (snap) => {
    if (snap.exists()) {
      cb(snap.data().userIds || []);
    } else {
      cb([]);
    }
  });
}

export async function setAssigns(adminId, userIds) {
  await setDoc(doc(db, ASSIGNS, adminId), { userIds });
}

// === HISTORY ===
export async function saveHistory(entry) {
  const ref = doc(collection(db, HISTORY));
  await setDoc(ref, {
    ...entry,
    savedAt: serverTimestamp(),
  });
  return ref.id;
}

export function onHistory(cb) {
  return onSnapshot(
    query(collection(db, HISTORY), orderBy("savedAt", "desc")),
    (snap) => {
      cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
  );
}

export async function deleteHistory(id) {
  await deleteDoc(doc(db, HISTORY, id));
}

// === RESET DAY ===
export async function resetDay(trucks, historyEntry) {
  const batch = writeBatch(db);
  
  // Save history
  const histRef = doc(collection(db, HISTORY));
  batch.set(histRef, { ...historyEntry, savedAt: serverTimestamp() });
  
  // Reset each truck
  trucks.forEach(t => {
    batch.update(doc(db, TRUCKS, t.id), {
      posData: {},
      status: "pending",
      departureTime: "",
      arrivalTime: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    });
  });
  
  await batch.commit();
}
