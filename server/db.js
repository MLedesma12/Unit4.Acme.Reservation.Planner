const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL ||
    "postgres://mario:password12@localhost:5432/the_acme_reservation_planner"
);

const uuid = require("uuid");
const createTables = async () => {
  await client.connect();
  const SQL = `
        DROP TABLE IF EXISTS reservations;
        DROP TABLE IF EXISTS customers;
        DROP TABLE IF EXISTS restaurants;
        CREATE TABLE customers (
            id UUID PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE
        );
        CREATE TABLE restaurants (
            id UUID PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE
        );
        CREATE TABLE reservations (
            id UUID PRIMARY KEY,
            date DATE NOT NULL,
            party_count INTEGER NOT NULL,
            restaurant_id UUID REFERENCES restaurants NOT NULL,
            customer_id UUID REFERENCES customers NOT NULL
        );
    `;

  await client.query(SQL);
};

const createCustomer = async (name) => {
  const SQL = `
      INSERT INTO customers(id, name) VALUES($1, $2) RETURNING *
    `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const createRestaurant = async (name) => {
  const SQL = `
      INSERT INTO restaurants(id, name) VALUES($1, $2) RETURNING *
    `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const fetchCustomers = async () => {
  const SQL = `
  SELECT *
  FROM customers
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchRestaurants = async () => {
  const SQL = `
  SELECT *
  FROM restaurants
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const createReservation = async ({
  restaurant_id,
  customer_id,
  party_count,
  date,
}) => {
  const SQL = `
      INSERT INTO reservations(id, restaurant_id, customer_id, party_count, date) VALUES($1, $2, $3, $4, $5) RETURNING *
    `;
  const response = await client.query(SQL, [
    uuid.v4(),
    restaurant_id,
    customer_id,
    party_count,
    date,
  ]);
  return response.rows[0];
};

const fetchReservations = async () => {
  const SQL = `
  SELECT * FROM reservations;
  `;
  const reservations = await client.query(SQL);
  return reservations.rows[0];
};

const destroyReservation = async ({ id, customer_id }) => {
  console.log(id, customer_id);
  const SQL = `
        DELETE FROM reservations
        WHERE id = $1 AND customer_id=$2
    `;
  await client.query(SQL, [id, customer_id]);
};

module.exports = {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  fetchReservations,
  destroyReservation,
};