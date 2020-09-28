/* eslint @typescript-eslint/no-var-requires: "off" */
require("dotenv").config();

import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import { connectDatabase } from "./database";
import { typeDefs, resolvers } from "./graphql";

const mount = async (app: Application) => {
  const db = await connectDatabase();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({ db }),
    introspection: true,
  });

  server.applyMiddleware({ app, path: "/api" });
  app.listen(process.env.PORT);
  const users = await db.users.find({}).toArray();
  console.log("[USERS]", users);
  console.log(`[app] : http://localhost:${process.env.PORT}`);
};

mount(express());
