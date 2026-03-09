'use client';
    
import { getLocalData, setLocalData } from '@/lib/mock-db';

/**
 * MOCK UPDATES
 * Intercepts cloud writes and redirects them to local state.
 */

function getCollectionFromPath(path: string) {
  return path.split('/').slice(-2, -1)[0] || path.split('/').pop();
}

export function setDocumentNonBlocking(docRef: any, data: any, options: any) {
  const path = docRef.path || '';
  const parts = path.split('/');
  const collectionName = parts[parts.length - 2];
  const id = parts[parts.length - 1];

  const current = getLocalData(collectionName);
  const index = current.findIndex((i: any) => i.id === id);
  
  if (index > -1) {
    current[index] = options?.merge ? { ...current[index], ...data } : data;
  } else {
    current.push({ ...data, id });
  }
  
  setLocalData(collectionName, current);
}

export function addDocumentNonBlocking(colRef: any, data: any) {
  const collectionName = colRef.path?.split('/').pop() || '';
  const current = getLocalData(collectionName);
  const newDoc = { ...data, id: crypto.randomUUID() };
  current.push(newDoc);
  setLocalData(collectionName, current);
  return Promise.resolve({ id: newDoc.id });
}

export function updateDocumentNonBlocking(docRef: any, data: any) {
  setDocumentNonBlocking(docRef, data, { merge: true });
}

export function deleteDocumentNonBlocking(docRef: any) {
  const parts = docRef.path?.split('/') || [];
  const collectionName = parts[parts.length - 2];
  const id = parts[parts.length - 1];
  
  const current = getLocalData(collectionName);
  const filtered = current.filter((i: any) => i.id !== id);
  setLocalData(collectionName, filtered);
}
