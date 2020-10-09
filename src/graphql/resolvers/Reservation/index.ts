import { IResolvers } from "apollo-server-express";
import { CreateReservationArgs } from "./types";
import {
  Database,
  Reservation,
  ReservationsIndex,
  Listing,
  User,
} from "../../../lib/types";
import { Request } from "express";
import { authorize } from "../../../lib/utils";
import { ObjectId } from "mongodb";
import { Stripe } from "../../../lib/api/Stripe";

const millisecondsPerDay = 86400000;

const resolveReservationsIndex = (
  reservationsIndex: ReservationsIndex,
  checkInDate: string,
  checkOutDate: string
): ReservationsIndex => {
  let dateCursor = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const newReservationsIndex: ReservationsIndex = { ...reservationsIndex };

  while (dateCursor <= checkOut) {
    const y = dateCursor.getUTCFullYear();
    const m = dateCursor.getUTCMonth();
    const d = dateCursor.getUTCDate();

    if (!newReservationsIndex[y]) {
      newReservationsIndex[y] = {};
    }

    if (!newReservationsIndex[y][m]) {
      newReservationsIndex[y][m] = {};
    }

    if (!newReservationsIndex[y][m][d]) {
      newReservationsIndex[y][m][d] = true;
    } else {
      throw new Error(
        "selected dates can't overlap dates that have already been booked"
      );
    }

    dateCursor = new Date(dateCursor.getTime() + 86400000);
  }

  return newReservationsIndex;
};
export const reservationResolvers: IResolvers = {
  Mutation: {
    createReservation: async (
      _root: undefined,
      { input }: CreateReservationArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Reservation> => {
      try {
        const { id, source, checkIn, checkOut } = input;

        const viewer = await authorize(db, req);
        if (!viewer) {
          throw new Error("viewer cannot be found");
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
        const today = new Date();

        if (checkInDate.getTime() > today.getTime() + 90 * millisecondsPerDay) {
          throw new Error(
            "check in date cannot be more than 90 days from today"
          );
        }
        if (
          checkOutDate.getTime() >
          today.getTime() + 90 * millisecondsPerDay
        ) {
          throw new Error(
            "check out date cannot be more than 90 days from today"
          );
        }

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

        await Stripe.charge(totalPrice, source, host.walletId);

        const insertRes = await db.reservations.insertOne({
          _id: new ObjectId(),
          listing: listing._id,
          tenant: viewer._id,
          checkIn,
          checkOut,
        });
        console.log("INSERT RES", insertRes);

        const insertedReservation: Reservation = insertRes.ops[0];

        await db.users.updateOne(
          {
            _id: host._id,
          },
          {
            $inc: { income: totalPrice },
          }
        );

        await db.users.updateOne(
          {
            _id: viewer._id,
          },
          {
            $push: { reservations: insertedReservation._id },
          }
        );

        await db.listings.updateOne(
          {
            _id: listing._id,
          },
          {
            $set: { reservationsIndex },
            $push: { reservations: insertedReservation._id },
          }
        );

        return insertedReservation;
      } catch (error) {
        throw new Error(`Failed to create a booking: ${error}`);
      }
    },
  },
  Reservation: {
    id: (reservation: Reservation): string => {
      return reservation._id.toString();
    },
    listing: (
      reservation: Reservation,
      _args: Record<string, unknown>,
      { db }: { db: Database }
    ): Promise<Listing | null> => {
      return db.listings.findOne({ _id: reservation.listing });
    },
    tenant: (
      reservation: Reservation,
      _args: Record<string, unknown>,
      { db }: { db: Database }
    ): Promise<User | null> => {
      return db.users.findOne({ _id: reservation.tenant });
    },
  },
};
