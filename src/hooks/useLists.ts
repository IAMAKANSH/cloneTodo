import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export function useLists() {
  return useLiveQuery(() => db.lists.orderBy('sortOrder').toArray());
}

export function useGroups() {
  return useLiveQuery(() => db.groups.orderBy('sortOrder').toArray());
}

export function useList(listId: string) {
  return useLiveQuery(() => db.lists.get(listId), [listId]);
}
