import { z } from "zod";

export const userSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(255)
    .regex(
      /^[a-zA-Z0-9_.]+$/,
      "Only alphabets, numbers, underscores and dots are allowed"
    ),
  email: z.string().email({ message: "Email is invalid" }),
  password: z
    .string()
    .min(8, "Password should be atleast 8 characters")
    .regex(/.*[a-z].*/, "Must contain one lowercase character")
    .regex(/.*[A-Z].*/, "Must contain one uppercase character")
    .regex(/.*[0-9].*/, "Must contain one number")
    .regex(/.*[!@#$%^&*(),.?":{}|<>].*/, "Must contain one special character"),
  role: z.enum(["MEMBER", "LIBRARIAN"]),
});

export const loginSchema = userSchema.pick({ username: true, password: true });

export const bookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
});

export const bookSchemaUpdate = bookSchema.extend({
  status: z.enum(["AVAILABLE", "BORROWED"]).optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().positive().min(1).default(1).catch(1),
});

export type Pagination = z.infer<typeof paginationSchema>;

export const borrowQuery = paginationSchema.extend({
  type: z.enum(["BORROWED", "HISTORY"]).default("HISTORY").catch("HISTORY"),
});

export type BorrowQuery = z.infer<typeof borrowQuery>;
