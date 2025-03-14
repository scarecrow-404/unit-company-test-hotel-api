const { Pool } = require("pg");
require("dotenv").config();
const { Client } = require("pg");

const dbName = process.env.DB_NAME || "hotel_db";

async function createDatabase() {
  const client = new Client({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    password: process.env.DB_PASSWORD || "postgres",
    port: process.env.DB_PORT || 5432,
    database: "postgres",
  });

  try {
    await client.connect();

    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );
    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database '${dbName}' created successfully.`);
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }
  } catch (error) {
    console.error("Error creating database:", error);
  } finally {
    await client.end();
  }
}

async function createTable() {
  const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: dbName,
    password: process.env.DB_PASSWORD || "postgres",
    port: process.env.DB_PORT || 5432,
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price INTEGER NOT NULL,
        doingtime TIMESTAMP NOT NULL
      )
    `);
    console.log("Table created successfully.");
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    await pool.end();
  }
}

async function seedDatabase() {
  const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: dbName,
    password: process.env.DB_PASSWORD || "postgres",
    port: process.env.DB_PORT || 5432,
  });

  const seedData = [
    { name: "Anataya Hotel", price: 2500, doingtime: "2023-05-17 17:02:54" },
    {
      name: "Mirana Beach Hotel",
      price: 7200,
      doingtime: "2023-05-20 10:31:09",
    },
    {
      name: "Huska Spirit Hotel",
      price: 3750,
      doingtime: "2023-05-20 10:31:09",
    },
  ];

  try {
    await pool.query("TRUNCATE TABLE hotels RESTART IDENTITY");

    for (const hotel of seedData) {
      await pool.query(
        "INSERT INTO hotels (name, price, doingtime) VALUES ($1, $2, $3)",
        [hotel.name, hotel.price, hotel.doingtime]
      );
    }
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await pool.end();
  }
}

(async () => {
  await createDatabase();
  await createTable();
  await seedDatabase();
})();
