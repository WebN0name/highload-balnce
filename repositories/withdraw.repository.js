const sequelize = require('../models').sequelize;
const { User } = require('../models');
const { Op, Transaction } = require("sequelize");

async function withdrawAtomic(userId, amount) {
  return sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE }, async (t) => {
    const [updatedCount, updatedUsers] = await User.update(
        { amount: sequelize.literal(`amount - ${amount}`) },
        { 
            where: { id: userId, amount: { [Op.gte]: amount } }, 
            transaction: t,
            returning: true
        }
    );

    if (updatedCount === 0 || !updatedUsers[0]) {
        throw new Error("Insufficient funds or user not found");
    }

    return { success: true, newBalance: updatedUsers[0].amount };
});
}

module.exports = { withdrawAtomic };