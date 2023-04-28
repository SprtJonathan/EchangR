import { Client } from "pg";

const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === "true",
  },
});

console.log("test db-test")

async function testDb() {
  await client.connect();

  const res = await client.query("SELECT NOW()");
  console.log(res.rows[0]);

  await client.end();
}

testDb();
