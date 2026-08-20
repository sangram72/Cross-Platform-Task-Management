
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Task } from '../../types';
import {
  getSqliteTasks,
  upsertSqliteTask,
  markSqliteTaskDeleted,
} from '../../database/sqlite';
import { SyncEngine } from '../../database/syncEngine';

interface TaskState {
  tasks: Task[];
  loading: boolean;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
};

export const loadTasks = createAsyncThunk(
  'tasks/load',
  async (userId: string) => {
    return await getSqliteTasks(userId);
  }
);

export const saveTaskAction = createAsyncThunk(
  'tasks/save',
  async (task: Task, { dispatch }) => {
    await upsertSqliteTask(task);
    await SyncEngine.syncPending(task.userId);
    dispatch(loadTasks(task.userId));
  }
);

export const deleteTaskAction = createAsyncThunk(
  'tasks/delete',
  async ({ id, userId }: { id: string; userId: string }, { dispatch }) => {
    await markSqliteTaskDeleted(id);
    await SyncEngine.syncPending(userId);
    dispatch(loadTasks(userId));
  }
);

export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasks: state => {
      state.tasks = [];
      state.loading = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadTasks.pending, state => {
        state.loading = true;
      })
      .addCase(loadTasks.fulfilled, (state, action) => {
        state.tasks = action.payload;
        state.loading = false;
      })
      .addCase(loadTasks.rejected, state => {
        state.loading = false;
      });
  },
});

export const { clearTasks } = taskSlice.actions;
export default taskSlice.reducer;