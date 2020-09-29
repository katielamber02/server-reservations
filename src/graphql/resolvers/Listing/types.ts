import { Reservation } from "./../../../lib/types";

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
