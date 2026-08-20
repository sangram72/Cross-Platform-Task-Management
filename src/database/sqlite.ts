
import { open } from '@op-engineering/op-sqlite';
import { Task, SyncStatus } from '../types';

const db = open({ name: 'tasks.db' });

export const initDatabase = async (): Promise<void> => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      isCompleted INTEGER NOT NULL,
      dueDate INTEGER,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      syncStatus TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_tasks_user_sync 
    ON tasks (userId, syncStatus);
  `);
};

export const getSqliteTasks = async (userId: string): Promise<Task[]> => {
  const result = await db.execute(
    `SELECT * FROM tasks WHERE userId = ? AND syncStatus != 'deleted' ORDER BY createdAt DESC;`,
    [userId]
  );

  if (!result.rows) return [];

  return result.rows.map((row: any) => ({
    id: row.id,
    userId: row.userId,
    title: row.title,
    description: row.description || '',
    isCompleted: Boolean(row.isCompleted),
    dueDate: row.dueDate || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    syncStatus: row.syncStatus as SyncStatus,
  }));
};

export const upsertSqliteTask = async (task: Task): Promise<void> => {
  await db.execute(
    `INSERT INTO tasks (id, userId, title, description, isCompleted, dueDate, createdAt, updatedAt, syncStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title,
       description = excluded.description,
       isCompleted = excluded.isCompleted,
       dueDate = excluded.dueDate,
       updatedAt = excluded.updatedAt,
       syncStatus = excluded.syncStatus;`,
    [
      task.id,
      task.userId,
      task.title,
      task.description || '',
      task.isCompleted ? 1 : 0,
      task.dueDate || null,
      task.createdAt,
      task.updatedAt,
      task.syncStatus,
    ]
  );
};

export const markSqliteTaskDeleted = async (id: string): Promise<void> => {
  await db.execute(
    `UPDATE tasks SET syncStatus = 'deleted', updatedAt = ? WHERE id = ?;`,
    [Date.now(), id]
  );
};

export const getPendingSyncTasks = async (userId: string): Promise<Task[]> => {
  const result = await db.execute(
    `SELECT * FROM tasks WHERE userId = ? AND syncStatus != 'synced';`,
    [userId]
  );

  if (!result.rows) return [];

  return result.rows.map((row: any) => ({
    id: row.id,
    userId: row.userId,
    title: row.title,
    description: row.description || '',
    isCompleted: Boolean(row.isCompleted),
    dueDate: row.dueDate || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    syncStatus: row.syncStatus as SyncStatus,
  }));
};

export const markTaskSynced = async (id: string): Promise<void> => {
  await db.execute(`UPDATE tasks SET syncStatus = 'synced' WHERE id = ?;`, [id]);
};

export const hardDeleteSqliteTask = async (id: string): Promise<void> => {
  await db.execute(`DELETE FROM tasks WHERE id = ?;`, [id]);
};