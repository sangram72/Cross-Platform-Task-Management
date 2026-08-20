import { Task } from '../types';

export type AuthStackParamList = {
  Login: undefined;
};

export type AppStackParamList = {
  TaskList: undefined;
  TaskDetail: { task?: Task } | undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};