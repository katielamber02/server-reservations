import { gql } from "apollo-server-express";

export const typeDefs = gql`
  enum ListingType {
    APARTMENT
    HOUSE
  }
  enum ListingsFilter {
    PRICE_LOW_TO_HIGH
    PRICE_HIGH_TO_LOW
  }
  type Reservation {
    id: ID!
    listing: Listing!
    tenant: User!
    checkIn: String!
    checkOut: String!
  }

  type Reservations {
    total: Int!
    result: [Reservation!]!
  }
  type User {
    id: ID!
    name: String!
    avatar: String!
    contact: String!
    hasWallet: Boolean!
    income: Int
    reservations(limit: Int!, page: Int!): Reservations
    listings(limit: Int!, page: Int!): Listings!
  }
  input LogInInput {
    code: String!
  }
  input ConnectStripeInput {
    code: String!
  }
  input HostListingInput {
    title: String!
    description: String!
    image: String!
    type: ListingType!
    address: String!
    guests: Int!
    price: Int!
  }
  type Viewer {
    id: ID
    token: String
    avatar: String
    hasWallet: Boolean
    didRequest: Boolean!
  }
  type Listing {
    id: ID!
    title: String!
    image: String!
    address: String!
    price: Int!
    guests: Int!
    country: String!
    admin: String!
    city: String!
    host: User!
    description: String!
    type: ListingType!
    reservations(limit: Int!, page: Int!): Reservations
    reservationsIndex: String!
  }
  type Listings {
    region: String
    total: Int!
    result: [Listing!]!
  }

  type Query {
    # listings: [Listing!]!
    listings(
      location: String
      filter: ListingsFilter!
      limit: Int!
      page: Int!
    ): Listings!
    authUrl: String!
    # user: String!
    user(id: ID!): User!
    listing(id: ID!): Listing!
  }

  type Mutation {
    deleteListing(id: ID!): Listing!
    logIn(input: LogInInput): Viewer!
    logOut: Viewer!
    connectStripe(input: ConnectStripeInput!): Viewer!
    disconnectStripe: Viewer!
    hostListing(input: HostListingInput!): Listing!
  }
`;
