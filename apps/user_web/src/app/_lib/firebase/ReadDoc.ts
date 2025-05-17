export type ReadDoc<T> = {
  id: string;
  path: string;
  createdAt: Date;
  updatedAt: Date;
} & T;
