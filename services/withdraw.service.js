const withdrawQueue = require("./processWithdrawal");

module.exports = {
  async processWithdrawal(userId, amount) {
    await withdrawQueue.add("withdraw", { userId, amount });
    return { status: "queued" };
  },
};