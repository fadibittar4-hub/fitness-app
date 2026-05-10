export class Session {
  constructor({ id, trainer_id, session_time, status = "available", capacity = 1, created_at = null }) {
    this.id = id;
    this.trainer_id = trainer_id;
    this.session_time = session_time;
    this.status = status;
    this.capacity = capacity;
    this.created_at = created_at;
  }
}
