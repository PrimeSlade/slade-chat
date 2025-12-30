export interface Pagination {
  nextCursor: string | null;
}

export interface ControllerResponse<T> {
  data?: T;
  message: string;
  pagination?: Pagination;
}
