export class Booking {
  constructor({ id, user_id, session_id, status = "pending", created_at = null }) {
    this.id = id;
    this.user_id = user_id;
    this.session_id = session_id;
    this.status = status;
    this.created_at = created_at;
  }
}
