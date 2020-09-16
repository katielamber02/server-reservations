import { MongoClient } from "mongodb";
import { Database, Reservation, Listing, User } from "../lib/types";

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@${process.env.DB_CLUSTER}`;

export const connectDatabase = async (): Promise<Database> => {
  const client = await MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = client.db("book-appartment");

  return {
    reservations: db.collection<Reservation>("reservations"),
    listings: db.collection<Listing>("listings"),
    users: db.collection<User>("users"),
  };
};
