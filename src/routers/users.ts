import {
  createUser,
  deleteUser,
  signIn,
  logout,
  getMe,
  updateUser,
  getAUser,
  getAllUser,
  deleteUserAdmin,
} from "@/controllers/users";
import { adminOnly, authenticate } from "@/middleware/authenticate";
import { validateBody } from "@/middleware/validations";
import { userSchema } from "@/util/validations";
import { Router } from "express";

const usersRouter = Router();

usersRouter.post("/signup", validateBody(userSchema), createUser);
usersRouter.post("/signin", signIn);
usersRouter.post("/logout", authenticate, logout);
usersRouter.get("/me", authenticate, getMe);

usersRouter.put(
  "/:id",
  authenticate,
  validateBody(userSchema),
  adminOnly,
  updateUser
);
usersRouter.get("/:id", authenticate, adminOnly, getAUser);

usersRouter.delete("/", authenticate, deleteUser);
usersRouter.get("/", authenticate, adminOnly, getAllUser);
usersRouter.delete("/:id", authenticate, adminOnly, deleteUserAdmin);

export default usersRouter;
