import { DataSource } from "typeorm";
import { Activity } from "./entities/Activity";
import { User } from "./entities/User";
import path from "path";
import "dotenv-safe/config";
import { __prod__ } from "./constants";

export const myDataSource = new DataSource({
  type: "postgres",
  port: 5432,
  url: process.env.DATABASE_URL,
  entities: [Activity, User],
  logging: true,
  synchronize: true,
  ssl: true,
  extra: __prod__ && {
    ssl: {
      rejectUnauthorized: false,
    },
  },
  migrations: [path.join(__dirname, "./migrations/*")],
});
