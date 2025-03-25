require('dotenv').config();
const express = require('express');
const http = require('http');
const sequelize = require('./infrastructure/db');
const bodyParser = require('body-parser');
const withdrawController = require('./controllers/withdraw.controller');

const app = express();

app.use(bodyParser.json());

const router = express.Router();

router.post('/withdraw/:userId', withdrawController.withdraw);

app.use(router);

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

  server.keepAliveTimeout = 5000;
  server.headersTimeout = 7000;

server.listen(PORT, () => {
  console.log(`Worker ${process.pid} is running on http://localhost:${PORT}`);
});

module.exports = server;