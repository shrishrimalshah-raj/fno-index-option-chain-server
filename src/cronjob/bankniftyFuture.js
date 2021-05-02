import { BankNiftyFutureModel } from "../db/models";
import { instance, getCookies, cookie } from "./genericInstance";

let BANK_NIFTY_FUTURE_URL =
  "https://www.nseindia.com/api/liveEquity-derivatives?index=nifty_bank_fut";

const getBankNiftyFutureData = async () => {
  try {
    if (cookie) {
      const { data } = await instance.get(BANK_NIFTY_FUTURE_URL, {
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

      //bankNiftyFutureData
      const bankNiftyFutureData = data.data.reduce((acc, curr) => {
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
        ...bankNiftyFutureData,
        lastPrice: Math.round(bankNiftyFutureData.lastPrice),
        underlyingValue: Math.round(bankNiftyFutureData.underlyingValue),
        stringTimestamp: timestamp,
        timestamp: new Date(timestamp),
        createdAt: new Date(),
      };

      try {
        const record = await BankNiftyFutureModel.find({
          stringTimestamp: timestamp,
        });
        if (!record.length) {
          await BankNiftyFutureModel.create(storeObject);
          console.log(
            "getBankNiftyFutureData =====> BankNiftyFutureModel.create ======> Data addded successfully"
          );
        }
      } catch (error) {
        console.log(
          "getBankNiftyFutureData =====> BankNiftyFutureModel.create ======> error"
        );
      }
    } else {
      // await getCookies();
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log("getBankNiftyFutureData =========> error.status === 401");
      if (!cookie) {
        console.log("getBankNiftyFutureData =========> cookie not found");
        // await getCookies();
      }
      // await getNiftyOptionChainData();
    } else {
      console.log("getBankNiftyFutureData =========> error", error);
    }
  }
};

export { getBankNiftyFutureData };
