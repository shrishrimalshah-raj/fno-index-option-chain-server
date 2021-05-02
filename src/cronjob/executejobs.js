import cron from "node-cron";

import { getCookies } from "./genericInstance";
import { getNiftyOptionChainData } from "./niftyOptionChain";
import { getBankNiftyOptionChainData } from "./bankniftyOptionChain";
import { getNiftyFutureData } from "./niftyFuture";
import { getBankNiftyFutureData } from "./bankniftyFuture";

const executeCronJobs = async () => {
  // ones
  try {
    await getCookies();
    await getNiftyOptionChainData();
    await getBankNiftyOptionChainData();
    await getNiftyFutureData();
    await getBankNiftyFutureData();
  } catch (error) {
    console.log("executeCronJobs ===========> Error");
  }

  cron.schedule("*/5 * * * *", async () => {
    try {
      await getCookies();
    } catch (error) {
      console.log("executeCronJobs ===========> getCookies ========> Error");
    }
  });

  cron.schedule("*/3 * * * *", async () => {
    try {
      await getNiftyOptionChainData();
    } catch (error) {
      console.log(
        "executeCronJobs ===========> getNiftyOptionChainData ========> Error"
      );
    }
  });

  cron.schedule("*/3 * * * *", async () => {
    try {
      await getBankNiftyOptionChainData();
    } catch (error) {
      console.log(
        "executeCronJobs ===========> getBankNiftyOptionChainData ========> Error"
      );
    }
  });

  cron.schedule("*/3 * * * *", async () => {
    try {
      await getNiftyFutureData();
    } catch (error) {
      console.log(
        "executeCronJobs ===========> getNiftyFutureData ========> Error"
      );
    }
  });

  cron.schedule("*/3 * * * *", async () => {
    try {
      await getBankNiftyFutureData();
    } catch (error) {
      console.log(
        "executeCronJobs ===========> getBankNiftyFutureData ========> Error"
      );
    }
  });
};

export { executeCronJobs };
