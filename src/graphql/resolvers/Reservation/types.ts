export interface CreateReservationInput {
  id: string;
  source: string;
  checkIn: string;
  checkOut: string;
}

export interface CreateReservationArgs {
  input: CreateReservationInput;
}
