import merge from "lodash.merge";
import { listingResolvers } from "./Listing";
import { viewerResolvers } from "./Viewer";
import { userResolvers } from "./User";
import { reservationResolvers } from "./Reservation";

export const resolvers = merge(
  listingResolvers,
  viewerResolvers,
  userResolvers,
  reservationResolvers
);
