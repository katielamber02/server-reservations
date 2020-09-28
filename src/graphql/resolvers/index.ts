import merge from "lodash.merge";
import { listingResolvers } from "./Listing";
import { viewerResolvers } from "./Viewer";
import { userResolvers } from "./User";

export const resolvers = merge(
  listingResolvers,
  viewerResolvers,
  userResolvers
);
