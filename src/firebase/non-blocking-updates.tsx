
'use client';

import { 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  DocumentReference, 
  CollectionReference,
  SetOptions
} from 'firebase/firestore';

/**
 * Initiates a document set operation (non-blocking).
 */
export function setDocumentNonBlocking<T>(
  docRef: DocumentReference<T>,
  data: T,
  options?: SetOptions
): void {
  if (options) {
    setDoc(docRef, data, options);
  } else {
    setDoc(docRef, data);
  }
}

/**
 * Initiates a document addition to a collection (non-blocking).
 */
export function addDocumentNonBlocking<T>(
  colRef: CollectionReference<T>,
  data: T
): void {
  addDoc(colRef, data);
}

/**
 * Initiates a document update operation (non-blocking).
 */
export function updateDocumentNonBlocking(
  docRef: DocumentReference,
  data: any
): void {
  updateDoc(docRef, data);
}

/**
 * Initiates a document deletion (non-blocking).
 */
export function deleteDocumentNonBlocking(
  docRef: DocumentReference
): void {
  deleteDoc(docRef);
}
