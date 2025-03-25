const { Queue, Worker } = require("bullmq");
const redisClient = require("../infrastructure/redisClient");
const withdrawRepository = require("../repositories/withdraw.repository");

const withdrawQueue = new Queue("withdrawQueue", {
  connection: redisClient,
  limiter: {
    max: 20000,
    duration: 6000, 
  },
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 100,
    attempts: 5, 
    backoff: {
      type: "exponential",
      delay: 1000, 
    },
  },
});

const withdrawWorker = new Worker(
  "withdrawQueue",
  async (job) => {
    const { userId, amount } = job.data;

    let attempts = 5;
    while (attempts > 0) {
      try {
        const result = await withdrawRepository.withdrawAtomic(userId, amount);
        console.log(`✅ Withdrawal success for user ${userId}:`, result);
        return result;
      } catch (error) {
        if (error.message.includes("could not serialize access") || error.message.includes("deadlock")) {
          console.warn(`🔄 Retrying withdrawal for ${userId}... Attempts left: ${attempts}`);
          attempts--;
          await new Promise((resolve) => setTimeout(resolve, 100)); // Ждём перед повтором
        } else {
          console.error(`❌ Withdrawal failed for user ${userId}:`, error);
          throw error;
        }
      }
    }
    throw new Error(`Failed to process withdrawal for ${userId} after multiple attempts`);
  },
  {
    connection: redisClient,
    concurrency: 15,
  }
);

withdrawWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed successfully.`);
});

withdrawWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err);
});

setInterval(async () => {
  const counts = await withdrawQueue.getJobCounts();
  console.log("📊 Статистика очереди:", counts);
}, 20000);

module.exports = withdrawQueue;