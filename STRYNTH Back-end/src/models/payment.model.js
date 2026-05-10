export class Payment {
  constructor({
    id,
    user_id,
    user_first_name = null,
    user_last_name = null,
    trainer_first_name = null,
    trainer_last_name = null,
    booking_id,
    amount,
    payment_method,
    status,
    created_at = null,
    booking = null,
  }) {
    this.id = id;
    this.user_id = user_id;
    this.user_first_name = user_first_name;
    this.user_last_name = user_last_name;
    this.trainer_first_name = trainer_first_name;
    this.trainer_last_name = trainer_last_name;
    this.booking_id = booking_id;
    this.amount = amount;
    this.payment_method = payment_method;
    this.status = status;
    this.created_at = created_at;
    this.booking = booking;
  }
}
