/* eslint @typescript-eslint/no-var-requires: "off" */
require("dotenv").config();

import { connectDatabase } from "../src/database";

import { listings, users } from "./mock";

const seed = async () => {
  try {
    console.log("[seed] : running...");

    const db = await connectDatabase();

    for (const listing of listings) {
      await db.listings.insertOne(listing);
    }

    for (const user of users) {
      await db.users.insertOne(user);
    }

    console.log("[seed] : success");
  } catch {
    throw new Error("failed to seed database");
  }
};

seed();
