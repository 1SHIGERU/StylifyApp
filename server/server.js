// server.js
require('dotenv').config();


const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./db');
const routes = require('./routes');

const app = express();
const port = process.env.PORT; 

app.use(express.json());
app.use(cors());
app.use(routes);

app.get('/', (req, res) => {
  res.send('No witam cześć!');
});

connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server działa na porcie ${port} \n\n\n\n`);
  });
});

require('./models/User');
require('./models/Offer');
require('./models/OfferImage');
require('./models/Favourite');
require('./models/Transaction');
