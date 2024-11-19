const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  destroyReservation,
  fetchReservations,
} = require("./db");

const express = require("express");
const app = express();

app.use(express.json());
app.use(require("morgan")("dev"));

app.get("/api/customers", async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/reservations", async (req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch (ex) {
    next(ex);
  }
});

app.delete(
  "/api/customers/:customer_id/reservations/:id",
  async (req, res, next) => {
    try {
      await destroyReservation({
        customer_id: req.params.customer_id,
        id: req.params.id,
      });
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  }
);

app.post("/api/customers/:customer_id/reservations", async (req, res, next) => {
  try {
    res.status(201).send(
      await createReservation({
        customer_id: req.params.customer_id,
        restaurant_id: req.body.restaurant_id,
        date: req.body.date,
        party_count,
      })
    );
  } catch (ex) {
    next(ex);
  }
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).send({ error: err.message || err });
});

const init = async () => {
  await createTables();
  console.log("created tables");

  const [mario, noel, sammie, aviana, bizzybees, logans, twinpeaks] =
    await Promise.all([
      createCustomer({ name: "mario" }),
      createCustomer({ name: "noel" }),
      createCustomer({ name: "sammie" }),
      createCustomer({ name: "aviana" }),
      createRestaurant({ name: "bizzybees" }),
      createRestaurant({ name: "logans" }),
      createRestaurant({ name: "twinpeaks" }),
    ]);

  console.log(await fetchCustomers());
  console.log(await fetchRestaurants());

  const [reservation, reservation2] = await Promise.all([
    createReservation({
      customer_id: mario.id,
      restaurant_id: logans.id,
      party_count: 2,
      date: "02/14/2024",
    }),
    createReservation({
      customer_id: mario.id,
      restaurant_id: twinpeaks.id,
      party_count: 4,
      date: "02/28/2024",
    }),
  ]);

  const allReservations = async () => {
    let reservations = await fetchReservations();
    console.log("Reservations: ", reservations);
  };
  allReservations();

  await destroyReservation({
    id: reservation.id,
    customer_id: reservation.customer_id,
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
    console.log(`curl localhost:${port}/api/customers`);
    console.log(`curl localhost:${port}/api/restaurants`);
    console.log(`curl localhost:${port}/api/reservations`);
    console.log(
      `curl -X DELETE localhost:${port}/api/customers/${mario.id}/reservations/${reservation2.id}`
    );
    console.log(
      `curl -X POST localhost:${port}/api/customers/${mario.id}/reservations/ -d '{"restaurant_id":"${logans.id}", "party_count", "date": "02/15/2025"}' -H "Content-Type:application/json"`
    );
  });
};

init();
