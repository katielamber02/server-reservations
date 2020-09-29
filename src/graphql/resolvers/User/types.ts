import { Reservation, Listing } from "../../../lib/types";

export interface UserArgs {
  id: string;
}

export interface UserReservationsArgs {
  limit: number;
  page: number;
}

export interface UserReservationsData {
  total: number;
  result: Reservation[];
}
export interface UserListingsArgs {
  limit: number;
  page: number;
}

export interface UserListingsData {
  total: number;
  result: Listing[];
}
