# Hotel Management API

A REST API for managing hotel information built with Node.js, Express, and PostgreSQL.

## Prerequisites

- Node.js
- PostgreSQL
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone https://github.com/scarecrow-404/unit-company-test-hotel-api.git
cd unit-company-test-hotel-api
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=hotel_db
DB_PASSWORD=postgres
DB_PORT=5432
PORT=3001
```

## Database Setup

Run the seed script to create and populate the database:

```bash
node src/seed.js
```

This will:

- Create a new database named `hotel_db` (or as specified in .env)
- Create the `hotels` table
- Populate the table with sample data

## API Documentation

The API documentation is available through Swagger UI at:

```
http://localhost:3001/api-docs
```

### Available Endpoints

#### Hotel Operations

- **GET /api/listhotel**

  - Get all hotels
  - Optional path parameter: `id` to get specific hotel
  - Response:
    ```json
    {
      "RespCode": 200,
      "RespMessage": "success",
      "Result": [
        {
          "id": 1,
          "name": "Hotel Name",
          "price": 1000,
          "doingtime": "2023-05-17 17:02:54"
        }
      ]
    }
    ```

- **POST /api/create/hotel**

  - Create a new hotel
  - Request body:
    ```json
    {
      "name": "Hotel Name",
      "price": 1000
    }
    ```

- **POST /api/search/hotel**

  - Search hotels by date
  - Request body:
    ```json
    {
      "date": "2023-05-20"
    }
    ```
  - Returns hotels created on the specified date

- **GET /api/dashboard/hotel**
  - Get hotel statistics dashboard
  - Returns:
    - Total number of hotels
    - Highest and lowest priced hotels
    - Most recently added hotel
  - Response format:
    ```json
    {
      "RespCode": 200,
      "RespMessage": "success",
      "Result": {
        "Data": [...hotels],
        "Dashboard": {
          "AllHotel": 3,
          "Price": {
            "High": "Mirana Beach Hotel",
            "Low": "Anataya Hotel"
          },
          "LastHotelAdd": "2023-05-20 10:31:09"
        }
      }
    }
    ```

## Running the Application

1. Start the server:

```bash
npm start
```

2. The API will be available at `http://localhost:3001`
3. Access Swagger documentation at `http://localhost:3001/api-docs`

## Sample Database Data

The seed script includes the following sample hotels:

```javascript
[
  {
    name: "Anataya Hotel",
    price: 2500,
    doingtime: "2023-05-17 17:02:54",
  },
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
```
