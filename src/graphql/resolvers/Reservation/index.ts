import { IResolvers } from "apollo-server-express";
import { CreateReservationArgs } from "./types";
import { Database, Reservation } from "../../../lib/types";
import { Request } from "express";
import { authorize } from "../../../lib/utils";
import { ObjectId } from "mongodb";

const resolveReservationsIndex = () => {};
export const reservationResolvers: IResolvers = {
  Mutation: {
    createReservation: async (
      _root: undefined,
      { input }: CreateReservationArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Reservation | undefined> => {
      try {
        const { id, source, checkIn, checkOut } = input;

        const viewer = await authorize(db, req);
        if (!viewer) {
          throw new Error("viewer");
        }

        const listing = await db.listings.findOne({
          _id: new ObjectId(id),
        });
        if (!listing) {
          throw new Error("listing can't be found");
        }
        if (listing.host === viewer._id) {
          throw new Error("viewer can't book own listing");
        }
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkOutDate < checkInDate) {
          throw new Error("check out date can't be before check in date");
        }
        const reservationsIndex = resolveReservationsIndex(
          listing.reservationsIndex,
          checkIn,
          checkOut
        );
        const totalPrice =
          listing.price *
          ((checkOutDate.getTime() - checkInDate.getTime()) / 86400000 + 1);

        const host = await db.users.findOne({
          _id: listing.host,
        });

        if (!host || !host.walletId) {
          throw new Error(
            "the host either can't be found or is not connected with Stripe"
          );
        }

        return undefined;
      } catch {}
    },
  },
};
