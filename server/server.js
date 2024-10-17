// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./db');
const routes = require('./routes');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const app = express();
const port = process.env.PORT; 

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

app.use(morgan('dev'));

app.use(express.json());
app.use(cors());
app.use(routes);
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

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
require('./models/Address');
require('./models/Notification');
require('./models/Message');
require('./models/Chat');

