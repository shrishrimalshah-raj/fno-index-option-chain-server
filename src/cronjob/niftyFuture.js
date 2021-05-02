import { NiftyFutureModel } from "../db/models";
import { instance, getCookies, cookie } from "./genericInstance";

let NIFTY_FUTURE_URL =
  "https://www.nseindia.com/api/liveEquity-derivatives?index=nse50_fut";

const getNiftyFutureData = async () => {
  try {
    if (cookie) {
      const { data } = await instance.get(NIFTY_FUTURE_URL, {
        headers: {
          cookie,
          "user-agent": `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36`,
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "cache-control": "max-age=0",
          "sec-ch-ua":
            '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
          "sec-ch-ua-mobile": "?0",
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "none",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
          referrerPolicy: "strict-origin-when-cross-origin",
          body: null,
          method: "GET",
          mode: "cors",
        },
      });
      let timestamp = data.timestamp;
      let storeObject = {};

      //niftyFutureData
      const niftyFutureData = data.data.reduce((acc, curr) => {
        if (Object.keys(acc).length === 0) {
          return {
            ...curr,
          };
        }

        acc = {
          ...acc,
          openInterest: acc.openInterest + curr.openInterest,
          noOfTrades: acc.noOfTrades + curr.noOfTrades,
        };

        return acc;
      }, {});

      storeObject = {
        ...niftyFutureData,
        lastPrice: Math.round(niftyFutureData.lastPrice),
        underlyingValue: Math.round(niftyFutureData.underlyingValue),
        stringTimestamp: timestamp,
        timestamp: new Date(timestamp),
        createdAt: new Date(),
      };

      try {
        const record = await NiftyFutureModel.find({
          stringTimestamp: timestamp,
        });
        if (!record.length) {
          await NiftyFutureModel.create(storeObject);
          console.log(
            "getNiftyFutureData =====> NiftyFutureModel.create ======> Data addded successfully"
          );
        }
      } catch (error) {
        console.log(
          "getNiftyFutureData =====> NiftyFutureModel.create ======> error"
        );
      }
    } else {
      // await getCookies();
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log("getNiftyFutureData =========> error.status === 401");
      if (!cookie) {
        console.log("getNiftyFutureData =========> cookie not found");
        // await getCookies();
      }
      // await getNiftyOptionChainData();
    } else {
      console.log("getNiftyFutureData =========> error", error);
    }
  }
};

export { getNiftyFutureData };
