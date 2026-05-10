import dotenv from "dotenv";
import app from "./app.js";
import { connectDb, getDbConfig } from "./config/db.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    const dbConfig = getDbConfig();
    console.log(`[db] host: ${dbConfig.host}, port: ${dbConfig.port}, database: ${dbConfig.database}`);

    await connectDb();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
