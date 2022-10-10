import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { Activity } from "../entities/Activity";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { myDataSource } from "../app-data-source";
import { User } from "../entities/User";

@InputType()
class ActivityInput {
  @Field()
  project: string;

  @Field()
  category: string;

  @Field()
  ticket: string;

  @Field()
  comment: string;

  @Field()
  hours: number;

  @Field({ nullable: true })
  date: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Activity])
  posts: Activity[];

  @Field()
  hasMore: boolean;
}

@Resolver(Activity)
export class ActivityResolver {
  @FieldResolver(() => User)
  creator(
    @Root() activity: Activity,
    @Ctx() { userLoader }: MyContext
  ): Promise<User | null> {
    return userLoader.load(activity.creatorId);
  }

  /*
  @FieldResolver(() => String)
  textSnippet(@Root() root: Activity) {
    return root.text.slice(0, 50);
  }
*/
  @Query(() => PaginatedPosts)
  async activities(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = Math.min(50, limit) + 1;
    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await myDataSource.query(
      `
    select p.*
     from post p
    ${cursor ? `where p."createdAt" < $2` : ""}
    and p."creatorId" = ${req.session.userId}
    order by p."createdAt" DESC
    limit $1
    `,
      replacements
    );
    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Activity, { nullable: true })
  activity(@Arg("id", () => Int) id: number): Promise<Activity | null> {
    return Activity.findOne({ where: { id } });
  }

  @Mutation(() => Activity)
  @UseMiddleware(isAuth)
  async createActivity(
    @Arg("input") input: ActivityInput,
    @Ctx() { req }: MyContext
  ): Promise<Activity> {
    return Activity.create({ ...input, creatorId: req.session.userId }).save();
  }

  @Mutation(() => Activity, { nullable: true })
  @UseMiddleware(isAuth)
  async updateActivity(
    @Arg("id", () => Int) id: number,
    @Arg("project", () => String, { nullable: true }) project: string,
    @Arg("category", () => String, { nullable: true }) category: string,
    @Arg("hours", () => Int, { nullable: true }) hours: number,
    @Arg("ticket", () => String, { nullable: true }) ticket: string,
    @Arg("comment", () => String, { nullable: true }) comment: string,
    @Ctx() { req }: MyContext
  ): Promise<Activity | null> {
    const result = await myDataSource
      .createQueryBuilder()
      .update(Activity)
      .set({ project, category, hours, ticket, comment })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteActivity(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    try {
      await Activity.delete({ id: id, creatorId: req.session.userId });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
