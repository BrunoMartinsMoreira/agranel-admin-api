export interface IDefaultResponse<T> {
  error: boolean;
  message: string;
  data: T;
}
