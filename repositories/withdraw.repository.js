const sequelize = require('../models').sequelize;

async function withdrawAtomic(userId, amount) {
  return sequelize.transaction(async (t) => {
      const [updatedUser] = await sequelize.query(
          `UPDATE users 
           SET amount = amount - :amount 
           WHERE id = :userId 
           AND amount >= :amount
           RETURNING *`,
          {
              replacements: { userId, amount },
              type: sequelize.QueryTypes.SELECT,
              transaction: t,
          }
      );

      if (!updatedUser) {
          throw new Error("Недостаточно средств или пользователь не найден");
      }

      return updatedUser;
  });
}

module.exports = { withdrawAtomic };