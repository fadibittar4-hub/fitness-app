import mysql from "mysql2/promise";

let pool;

export const getDbConfig = () => ({
  host: String(process.env.DB_HOST || "localhost"),
  port: Number(process.env.DB_PORT) || 3306,
  database: String(process.env.DB_NAME || "fitness_booking"),
  user: String(process.env.DB_USER || "root"),
  password: String(process.env.DB_PASSWORD || ""),
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
});

export const getDbClient = () => {
  if (!pool) {
    pool = mysql.createPool(getDbConfig());
  }

  return pool;
};

export const connectDb = async () => {
  const config = getDbConfig();

  if (!config.password) {
    throw new Error("DB_PASSWORD is missing. Add it to your .env file before starting the server.");
  }

  try {
    const connection = await getDbClient().getConnection();
    await connection.ping();
    connection.release();
    console.log("MySQL connected successfully");
  } catch (error) {
    throw new Error(`Failed to connect to MySQL: ${error.message}`);
  }
};

export const dbQuery = async (sql, params = []) => {
  try {
    const [rows] = await getDbClient().execute(sql, params);
    return rows;
  } catch (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
};

export const dbTransaction = async (callback) => {
  const connection = await getDbClient().getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
