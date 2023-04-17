// import mysql from "mysql";
// import dotenv from "dotenv";

// dotenv.config();

// const connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   charset: "utf8mb4_unicode_ci",
// });

// connection.connect();

// export default connection;

import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connection = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Veuillez noter que vous devrez également changer les paramètres de connexion si vous avez des ports spécifiques ou d'autres configurations
});

export default connection;
