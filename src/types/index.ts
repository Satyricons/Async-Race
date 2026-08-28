// src/types/index.ts
export interface Car {
  id: number;
  name: string;
  color: string;
}

export interface ApiResponse<T> {
  items: T[];
  totalCount: number;
}