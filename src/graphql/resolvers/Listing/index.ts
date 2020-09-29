import { ObjectId } from "mongodb";
import { IResolvers } from "apollo-server-express";
import { Database, Listing, User } from "../../../lib/types";
import {
  ListingArgs,
  ListingReservationsArgs,
  ListingReservationsData,
} from "./types";
import { authorize } from "../../../lib/utils";
import { Request } from "express";

export const listingResolvers: IResolvers = {
  Query: {
    listings: async (
      _root: undefined,
      _args: Record<string, unknown>,
      { db }: { db: Database }
    ): Promise<Listing[]> => {
      return await db.listings.find({}).toArray();
    },
    listing: async (
      _root: undefined,
      { id }: ListingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Listing> => {
      try {
        const listing = await db.listings.findOne({ _id: new ObjectId(id) });
        if (!listing) {
          throw new Error("listing can't be found");
        }

        const viewer = await authorize(db, req);
        if (viewer && viewer._id === listing.host) {
          listing.authorized = true;
        }

        return listing;
      } catch (error) {
        throw new Error(`Failed to query listing: ${error}`);
      }
    },
  },
  Mutation: {
    deleteListing: async (
      _root: undefined,
      { id }: { id: string },
      { db }: { db: Database }
    ): Promise<Listing> => {
      const deleteRes = await db.listings.findOneAndDelete({
        _id: new ObjectId(id),
      });

      if (!deleteRes.value) {
        throw new Error("failed to delete listing");
      }

      return deleteRes.value;
    },
  },
  Listing: {
    id: (listing: Listing): string => listing._id.toString(),
    host: async (
      listing: Listing,
      _args: Record<string, unknown>,
      { db }: { db: Database }
    ): Promise<User> => {
      const host = await db.users.findOne({ _id: listing.host });
      if (!host) {
        throw new Error("host can't be found");
      }
      return host;
    },
    reservationsIndex: (listing: Listing): string => {
      return JSON.stringify(listing.reservationsIndex);
    },
    reservations: async (
      listing: Listing,
      { limit, page }: ListingReservationsArgs,
      { db }: { db: Database }
    ): Promise<ListingReservationsData | null> => {
      try {
        if (!listing.authorized) {
          return null;
        }

        const data: ListingReservationsData = {
          total: 0,
          result: [],
        };

        let cursor = await db.reservations.find({
          _id: { $in: listing.reservations },
        });

        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
        cursor = cursor.limit(limit);

        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (error) {
        throw new Error(`Failed to query listing reservations: ${error}`);
      }
    },
  },
};
