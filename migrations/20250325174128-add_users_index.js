'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex("users", ["id", "amount"], {
      name: "idx_users_id_amount",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex("users", "idx_users_id_amount");
  },
};
