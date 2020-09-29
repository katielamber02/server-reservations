import { IResolvers } from "apollo-server-express";
import { UserArgs } from "./types";
import { Database, User } from "../../../lib/types";
import { Request } from "express";
import { authorize } from "../../../lib/utils";
import { UserReservationsArgs, UserReservationsData } from "./types";

export const userResolvers: IResolvers = {
  Query: {
    user: async (
      _root: undefined,
      { id }: UserArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<User> => {
      try {
        const user = await db.users.findOne({ _id: id });
        if (!user) {
          throw new Error("user can not be found");
        }
        const viewer = await authorize(db, req);
        if (viewer && viewer._id === user._id) {
          user.authorized = true;
        }
        return user;
      } catch (error) {
        throw new Error(`Failed to query user:${error}`);
      }
    },
  },
  User: {
    id: (user: User): string => {
      return user._id;
    },
    hasWallet: (user: User): boolean => {
      return Boolean(user.walletId);
    },
    income: (user: User): number | null => {
      return user.authorized ? user.income : null;
    },
    reservations: async (
      user: User,
      { limit, page }: UserReservationsArgs,
      { db }: { db: Database }
    ): Promise<UserReservationsData | null> => {
      try {
        if (!user.authorized) {
          return null;
        }

        const data: UserReservationsData = {
          total: 0,
          result: [],
        };

        let cursor = await db.reservations.find({
          _id: { $in: user.reservations },
        });

        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
        cursor = cursor.limit(limit);

        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (error) {
        throw new Error(`Failed to query user bookings: ${error}`);
      }
    },

    listings: (): string => "listings",
  },
};
