// server.js
require('dotenv').config();

const express = require('express');
const { connectToDatabase } = require('./db');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 13000; 

app.use(express.json());

app.use(routes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Serwer działa na porcie ${port}`);
  });
});
