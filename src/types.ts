export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: "MEMBER" | "LIBRARIAN";
  deleted: boolean;
  deleted_at: Date;
  created_at: Date;
  updated_at: Date;
};

export type InsertUser = Pick<User, "username" | "email" | "password" | "role">;

export type RefreshToken = {
  id: string;
  refresh_token: string;
  user_id: string;
  device: string | null;
  created_at: Date;
  updated_at: Date;
};

export type InsertRefreshToken = Pick<
  RefreshToken,
  "refresh_token" | "user_id" | "device"
>;

export type Book = {
  id: string;
  title: string;
  author: string;
  status: boolean;
  created_at: Date;
  updated_at: Date;
};

export type InsertBook = Pick<Book, "title" | "author">;
export type UpdateBook = Pick<Book, "title" | "author"> & {
  status?: boolean;
};

export type Borrow = {
  id: string;
  user_id: string;
  book_id: string;
  created_at: Date;
  updated_at: Date;
};

export type InsertBorrow = Pick<Borrow, "user_id" | "book_id">;

export type Historical = {
  id: string;
  user_id: string;
  book_id: string;
  borrowed_at: Date;
  returned_at: Date;
  created_at: Date;
  updated_at: Date;
};
