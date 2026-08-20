
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from '@react-native-firebase/firestore';
import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo';
import {
  getPendingSyncTasks,
  markTaskSynced,
  upsertSqliteTask,
  hardDeleteSqliteTask,
} from './sqlite';
import { Task } from '../types';

export class SyncEngine {
  private static remoteUnsubscribe: (() => void) | null = null;
  private static netInfoUnsubscribe: NetInfoSubscription | null = null;

  static init(userId: string, onLocalUpdate: () => void): () => void {
    const db = getFirestore();
    const tasksRef = collection(db, 'users', userId, 'tasks');

    // 1. Initial push of any pending offline changes
    this.syncPending(userId);

    // 2. Auto-sync whenever internet connectivity is restored
    this.netInfoUnsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        this.syncPending(userId);
      }
    });

    // 3. Real-time remote listener (Firestore -> SQLite)
    this.remoteUnsubscribe = onSnapshot(
      tasksRef,
      async snapshot => {
        for (const change of snapshot.docChanges()) {
          const remoteData = change.doc.data() as Task;

          if (change.type === 'added' || change.type === 'modified') {
            await upsertSqliteTask({
              ...remoteData,
              syncStatus: 'synced',
            });
          } else if (change.type === 'removed') {
            await hardDeleteSqliteTask(change.doc.id);
          }
        }

        onLocalUpdate();
      },
      error => {
        console.error('Firestore sync listener error:', error);
      }
    );

    return () => this.cleanup();
  }

  static async syncPending(userId: string): Promise<void> {
    const net = await NetInfo.fetch();
    if (!net.isConnected) return;

    const db = getFirestore();
    // Await async SQLite query so pendingTasks resolves to Task[]
    const pendingTasks = await getPendingSyncTasks(userId);

    for (const task of pendingTasks) {
      const taskDocRef = doc(db, 'users', userId, 'tasks', task.id);

      try {
        if (task.syncStatus === 'deleted') {
          await deleteDoc(taskDocRef);
          await hardDeleteSqliteTask(task.id);
        } else {
          await setDoc(
            taskDocRef,
            {
              id: task.id,
              userId: task.userId,
              title: task.title,
              description: task.description || '',
              isCompleted: task.isCompleted,
              dueDate: task.dueDate || null,
              createdAt: task.createdAt,
              updatedAt: task.updatedAt,
            },
            { merge: true }
          );
          await markTaskSynced(task.id);
        }
      } catch (err) {
        console.error(`Failed to sync task ${task.id}:`, err);
      }
    }
  }

  static cleanup() {
    if (this.remoteUnsubscribe) {
      this.remoteUnsubscribe();
      this.remoteUnsubscribe = null;
    }
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
      this.netInfoUnsubscribe = null;
    }
  }
}