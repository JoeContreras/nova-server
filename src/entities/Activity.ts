import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { IsInt, Max, Min } from "class-validator";

@ObjectType()
@Entity()
export class Activity extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  date: Date;

  @Field(() => String)
  @Column()
  project!: string;

  @Field(() => String)
  @Column()
  category!: string;

  @Field(() => String)
  @Column()
  ticket!: string;

  @Field(() => String)
  @Column()
  comment!: string;

  @IsInt()
  @Min(0)
  @Max(8)
  @Field(() => Int)
  @Column({ type: "int", default: 0 })
  hours!: number;

  @Field(() => String)
  @Column()
  creatorId: number;

  @Field()
  @ManyToOne(() => User, (user) => user.activities, {
    onDelete: "CASCADE",
  })
  creator: User;
}
