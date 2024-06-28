import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface Games {
  id: Generated<number>;
}

export interface Members {
  created_at: Generated<string>;
  id: Generated<number>;
  name: string;
  password_hash: string;
}

export interface DB {
  games: Games;
  members: Members;
}
