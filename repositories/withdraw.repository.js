const sequelize = require('../models').sequelize;

async function withdrawAtomic(userId, amount) {
    return sequelize.transaction(async (t) => {
        const [user] = await sequelize.query(
          `SELECT amount FROM users 
           WHERE id = :userId 
           FOR UPDATE SKIP LOCKED`,
          {
            replacements: { userId },
            type: sequelize.QueryTypes.SELECT,
            transaction: t,
          }
        );
    
        if (!user) {
          throw new Error("Пользователь не найден или баланс уже обновляется");
        }
    
        if (user.amount < amount) {
          throw new Error("Недостаточно средств");
        }
    
        const [updatedUser] = await sequelize.query(
          `UPDATE users 
           SET amount = amount - :amount 
           WHERE id = :userId 
           RETURNING *`,
          {
            replacements: { userId, amount },
            type: sequelize.QueryTypes.SELECT,
            transaction: t,
          }
        );
    
        return updatedUser;
      });
}

module.exports = { withdrawAtomic };