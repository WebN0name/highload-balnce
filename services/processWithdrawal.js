const { Queue, Worker } = require("bullmq");
const redisClient = require("../infrastructure/redisClient");
const withdrawRepository = require("../repositories/withdraw.repository");

const withdrawQueue = new Queue("withdrawQueue", { connection: redisClient });

let successCount = 0;
let failedCount = 0;

const withdrawWorker = new Worker(
  "withdrawQueue",
  async (job) => {
    const { userId, amount } = job.data;

    try {
      const result = await withdrawRepository.withdrawAtomic(userId, amount);
      console.log(`✅ Withdrawal success for user ${userId}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Withdrawal failed for user ${userId}:`, error);
      throw error;
    }
  },
  { connection: redisClient }
);

withdrawWorker.on("completed", (job) => {
    successCount++;
    console.log(`✅ Job ${job.id} completed successfully.`);
  });
  
  withdrawWorker.on("failed", (job, err) => {
    failedCount++;
    console.error(`❌ Job ${job.id} failed:`, err);
  });

module.exports = withdrawQueue;