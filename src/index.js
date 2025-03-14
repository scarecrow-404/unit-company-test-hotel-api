const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hotel API Documentation",
      version: "1.0.0",
      description: "API documentation for Hotel Management System",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
      },
    ],
  },
  apis: ["./src/index.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "hotel_db",
  password: process.env.DB_PASSWORD || "postgres",
  port: process.env.DB_PORT || 5432,
});

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL NOT NULL,
        doingtime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

initializeDatabase();

// API 1: Create Hotel
/**
 * @swagger
 * /api/create/hotel:
 *   post:
 *     summary: Create a new hotel
 *     tags: [Hotels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Hotel created successfully
 *       500:
 *         description: Server error
 */
app.post("/api/create/hotel", async (req, res) => {
  try {
    const { name, price } = req.body;
    const now = new Date();
    const doingtime =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0") +
      " " +
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0") +
      ":" +
      String(now.getSeconds()).padStart(2, "0");
    const result = await pool.query(
      "INSERT INTO hotels (name, price, doingtime) VALUES ($1, $2, $3) RETURNING *",
      [name, price, doingtime]
    );

    res.json({
      RespCode: 200,
      RespMessage: "success",
      Result: [result.rows[0]],
    });
  } catch (error) {
    res.status(500).json({
      RespCode: 500,
      RespMessage: "error",
      Result: error.message,
    });
  }
});

// API 2: List Hotels
/**
 * @swagger
 * /api/listhotel:
 *   get:
 *     summary: Get all hotels
 *     tags: [Hotels]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 RespCode:
 *                   type: integer
 *                   example: 200
 *                 RespMessage:
 *                   type: string
 *                   example: success
 *                 Result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       doingtime:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Server error
 *
 * /api/listhotel/{id}:
 *   get:
 *     summary: Get a specific hotel by ID
 *     tags: [Hotels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 RespCode:
 *                   type: integer
 *                   example: 200
 *                 RespMessage:
 *                   type: string
 *                   example: success
 *                 Result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       doingtime:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Bad request - Invalid ID format
 *       500:
 *         description: Server error
 */
app.get("/api/listhotel/:id?", async (req, res) => {
  try {
    const { id } = req.params;
    let query = "SELECT * FROM hotels";
    let values = [];

    if (id) {
      const parsedId = parseInt(id);
      if (isNaN(parsedId)) {
        return res.status(400).json({
          RespCode: 400,
          RespMessage: "error",
          Result: "Invalid ID format - must be a number",
        });
      }
      query += " WHERE id = $1";
      values.push(parsedId);
    }

    const result = await pool.query(query, values);

    res.json({
      RespCode: 200,
      RespMessage: "success",
      Result: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      RespCode: 500,
      RespMessage: "error",
      Result: error.message,
    });
  }
});

// API 3: Search Hotels by Date
/**
 * @swagger
 * /api/search/hotel:
 *   post:
 *     summary: Search hotels by date
 *     tags: [Hotels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Server error
 */
app.post("/api/search/hotel", async (req, res) => {
  try {
    const { date } = req.body;
    const result = await pool.query(
      "SELECT * FROM hotels WHERE DATE(doingtime) = DATE($1)",
      [date]
    );

    res.json({
      RespCode: 200,
      RespMessage: "success",
      Result: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      RespCode: 500,
      RespMessage: "error",
      Result: error.message,
    });
  }
});

// API 4: Dashboard
/**
 * @swagger
 * /api/dashboard/hotel:
 *   get:
 *     summary: Get hotel dashboard statistics
 *     tags: [Hotels]
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Server error
 */
app.get("/api/dashboard/hotel", async (req, res) => {
  try {
    const hotelsResult = await pool.query("SELECT * FROM hotels");
    const hotels = hotelsResult.rows;

    const highestPriceHotel = hotels.reduce((prev, current) =>
      prev.price > current.price ? prev : current
    );

    const lowestPriceHotel = hotels.reduce((prev, current) =>
      prev.price < current.price ? prev : current
    );

    const lastHotelAdd = hotels.reduce((prev, current) =>
      new Date(prev.doingtime) > new Date(current.doingtime) ? prev : current
    );

    res.json({
      RespCode: 200,
      RespMessage: "success",
      Result: {
        Data: hotels,
        Dashboard: {
          AllHotel: hotels.length,
          Price: {
            High: highestPriceHotel.name,
            Low: lowestPriceHotel.name,
          },
          LastHotelAdd: lastHotelAdd.doingtime,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      RespCode: 500,
      RespMessage: "error",
      Result: error.message,
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
