const { Umzug, SequelizeStorage } = require('umzug');
const sequelize = require('./infrastructure/db');

const umzug = new Umzug({
  migrations: {
    path: './migrations',
    pattern: /\.js$/,
  },
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

module.exports = umzug;