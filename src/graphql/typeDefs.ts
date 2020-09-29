import { gql } from "apollo-server-express";

export const typeDefs = gql`
  enum ListingType {
    APARTMENT
    HOUSE
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
    city: String!
    host: User!
    description: String!
    type: ListingType!
  }
  type Listings {
    total: Int!
    result: [Listing!]!
  }

  type Query {
    listings: [Listing!]!
    authUrl: String!
    # user: String!
    user(id: ID!): User!
    listing(id: ID!): Listing!
  }

  type Mutation {
    deleteListing(id: ID!): Listing!
    logIn(input: LogInInput): Viewer!
    logOut: Viewer!
  }
`;
