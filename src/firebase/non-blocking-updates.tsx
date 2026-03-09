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
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * Initiates a document set operation (non-blocking).
 */
export function setDocumentNonBlocking<T>(
  docRef: DocumentReference<T>,
  data: T,
  options?: SetOptions
): void {
  const promise = options ? setDoc(docRef, data, options) : setDoc(docRef, data);
  
  promise.catch(async (err) => {
    const permissionError = new FirestorePermissionError({
      path: docRef.path,
      operation: options && 'merge' in options ? 'update' : 'create',
      requestResourceData: data,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}

/**
 * Initiates a document addition to a collection (non-blocking).
 */
export function addDocumentNonBlocking<T>(
  colRef: CollectionReference<T>,
  data: T
): void {
  addDoc(colRef, data).catch(async (err) => {
    const permissionError = new FirestorePermissionError({
      path: colRef.path,
      operation: 'create',
      requestResourceData: data,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}

/**
 * Initiates a document update operation (non-blocking).
 */
export function updateDocumentNonBlocking(
  docRef: DocumentReference,
  data: any
): void {
  updateDoc(docRef, data).catch(async (err) => {
    const permissionError = new FirestorePermissionError({
      path: docRef.path,
      operation: 'update',
      requestResourceData: data,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}

/**
 * Initiates a document deletion (non-blocking).
 */
export function deleteDocumentNonBlocking(
  docRef: DocumentReference
): void {
  deleteDoc(docRef).catch(async (err) => {
    const permissionError = new FirestorePermissionError({
      path: docRef.path,
      operation: 'delete',
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}
