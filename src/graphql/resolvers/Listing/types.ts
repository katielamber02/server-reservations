import { Reservation, Listing } from "./../../../lib/types";

export enum ListingsFilter {
  PRICE_LOW_TO_HIGH = "PRICE_LOW_TO_HIGH",
  PRICE_HIGH_TO_LOW = "PRICE_HIGH_TO_LOW",
}
export interface ListingArgs {
  id: string;
}

export interface ListingReservationsArgs {
  limit: number;
  page: number;
}

export interface ListingReservationsData {
  total: number;
  result: Reservation[];
}
export interface ListingsArgs {
  filter: ListingsFilter;
  limit: number;
  page: number;
}
export interface ListingsData {
  total: number;
  result: Listing[];
}
