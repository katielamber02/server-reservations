import { Collection, ObjectId } from "mongodb";

export enum ListingType {
  Apartment = "APARTMENT",
  House = "HOUSE",
}

export interface Viewer {
  _id?: string;
  token?: string;
  avatar?: string;
  walletId?: string;
  didRequest: boolean;
}

export interface reservationsIndexMonth {
  [key: string]: boolean;
}

export interface reservationsIndexYear {
  [key: string]: reservationsIndexMonth;
}

export interface Reservation {
  _id: ObjectId;
  listing: ObjectId;
  tenant: string;
  checkIn: string;
  checkOut: string;
}

export interface Listing {
  _id: ObjectId;
  title: string;
  description: string;
  image: string;
  host: string;
  type: ListingType;
  address: string;
  country: string;
  admin: string;
  city: string;
  reservations: ObjectId[];
  reservationsIndex: reservationsIndexYear;
  price: number;
  guests: number;
  authorized?: boolean;
}

export interface User {
  _id: string;
  token: string;
  name: string;
  avatar: string;
  contact: string;
  walletId?: string;
  income: number;
  reservations: ObjectId[];
  listings: ObjectId[];
  authorized?: boolean;
}

export interface Database {
  reservations: Collection<Reservation>;
  listings: Collection<Listing>;
  users: Collection<User>;
}
