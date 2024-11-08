import { Hono } from "hono";
import { createUserService } from "../service";
import { createUserRepository } from "../repository";
import { userSchema } from "../helpers";
import db from "../../../db/db";

const userRouter = new Hono();
const userRepository = createUserRepository(db);
const userService = createUserService(userRepository);

userRouter.get("/", async (c) => {
  const result = await userService.getAllUsers();
  if (!result.success) {
    return c.json(
      {
        success: false,
        error: { message: result.error.message },
      },
      500
    );
  }
  return c.json({ success: true, data: result.data });
});

userRouter.post("/", async (c) => {
  const body = await c.req.json();

  try {
    const userData = userSchema.parse(body);
    const result = await userService.createUser(userData);

    if (!result.success) {
      return c.json(
        {
          success: false,
          error: { message: result.error.message },
        },
        500
      );
    }

    return c.json({ success: true, data: result.data }, 201);
  } catch (error) {
    if (error) {
      return c.json({ success: false, error: { message: error } }, 400);
    }
    throw error;
  }
});

export { userRouter };
