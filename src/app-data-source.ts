import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { Updoot } from "./entities/Updoot";
import path from "path";
import "dotenv-safe/config";
import { __prod__ } from "./constants";

export const myDataSource = new DataSource({
  type: "postgres",
  port: 5432,
  url: process.env.DATABASE_URL,
  entities: [Post, User, Updoot],
  logging: true,
  synchronize: true,
  ssl: __prod__,
  extra: __prod__ && {
    ssl: {
      rejectUnauthorized: false,
    },
  },
  migrations: [path.join(__dirname, "./migrations/*")],
});
