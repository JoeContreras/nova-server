import { Request, Response } from "express";
import { Session } from "express-session";
import Redis from "ioredis";
import { createUserLoader } from "./utils/createUserLoader";

export type MyContext = {
  req: Request & { session: Session };
  res: Response;
  redisClient: Redis;
  userLoader: ReturnType<typeof createUserLoader>;
};
