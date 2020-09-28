import { gql } from "apollo-server-express";

export const typeDefs = gql`
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
  }

  type Query {
    listings: [Listing!]!
    authUrl: String!
  }

  type Mutation {
    deleteListing(id: ID!): Listing!
    logIn(input: LogInInput): Viewer!
    logOut: Viewer!
  }
`;
