import {
  NiftyOptionChainModel,
  BankNiftyOptionChainModel,
  NiftyFutureModel,
  BankNiftyFutureModel,
} from "./db/models";

import { niftyStrikePricesArray } from "./cronjob/niftyOptionChain";
import { bankNiftyStrikePricesArray } from "./cronjob/bankniftyOptionChain";

// NIFTY FUTURE AND OPTION DATA
const getNiftyOptionChainData = async (socket, timestamp) => {
  try {
    return new Promise(async (resolve, reject) => {
      let start = new Date(timestamp);
      start.setHours(0, 0, 0, 0);
      let end = new Date(timestamp);
      end.setHours(23, 59, 59, 999);
      let niftyLastPrice = null;
      let niftyStrikePricesData = {};

      let niftyOptionChainData = await NiftyOptionChainModel.find({
        timestamp: { $gte: start, $lt: end },
      }).sort({ timestamp: 1 });

      let niftyFutureData = await NiftyFutureModel.find({
        timestamp: { $gte: start, $lt: end },
      }).sort({ timestamp: 1 });

      // MONGOOSE PARSE ARRAY AS JSON
      niftyOptionChainData = JSON.parse(JSON.stringify(niftyOptionChainData));
      niftyFutureData = JSON.parse(JSON.stringify(niftyFutureData));

      niftyLastPrice = niftyFutureData.length
        ? JSON.parse(
            JSON.stringify(niftyFutureData[niftyFutureData.length - 1])
          )
        : false;

      if (niftyLastPrice) {
        niftyLastPrice = Math.ceil(niftyLastPrice?.lastPrice / 50) * 50;

        let strikeArray = [
          ...new Set(niftyStrikePricesArray(niftyLastPrice - 50, 7)),
        ].sort();
        // remove last strikePrice
        strikeArray.pop();

        // store temporary data
        let tempObject = {};
        for (let index = 0; index < strikeArray.length; index++) {
          const num = strikeArray[index];
          const data = niftyOptionChainData.map((record) => {
            record.data.filter((element) => {
              if (element.strikePrice === num) {
                tempObject = {
                  timestamp: record.timestamp,
                  underlyingValue: record.underlyingValue,
                  strikePrice: num,
                  CEPrice: element.CE.lastPrice,
                  CEOpenInterest: element.CE.openInterest,
                  CEChangeinOpenInterest: element.CE.changeinOpenInterest,
                  PEPrice: element.PE.lastPrice,
                  PEOpenInterest: element.PE.openInterest,
                  PEChangeinOpenInterest: element.PE.changeinOpenInterest,
                };
              }
            });
            return tempObject;
          });
          niftyStrikePricesData[num] = data;
        }
      }

      // console.log("niftyOptionChainData", niftyOptionChainData.length);
      // console.log("niftyFutureData", niftyFutureData.length);
      // console.log(
      //   "niftyStrikePricesData",
      //   Object.keys(niftyStrikePricesData).length
      // );

      // socket.emit("FromAPI", niftyOptionChainData);

      // socket.emit("niftyOptionChainData", {
      //   niftyOptionChainData,
      //   niftyFutureData,
      //   niftyStrikePricesData,
      // });

      const data = {
        niftyOptionChainData,
        niftyFutureData,
        niftyStrikePricesData,
      };

      socket.emit("FromAPI", {
        niftyOptionChainData,
        niftyFutureData,
        niftyStrikePricesData,
      });

      resolve({ ...data });
    });
  } catch (error) {
    console.error(`getNiftyOptionChainData ==============> Error: ${error}`);
  }
};

const getBankNiftyOptionChainData = async (socket, timestamp) => {
  try {
    let start = new Date(timestamp);
    start.setHours(0, 0, 0, 0);
    let end = new Date(timestamp);
    end.setHours(23, 59, 59, 999);
    let bankNiftyLastPrice = null;
    let bankNiftyStrikePricesData = {};

    let bankNiftyOptionChainData = await BankNiftyOptionChainModel.find({
      timestamp: { $gte: start, $lt: end },
    }).sort({ timestamp: 1 });

    let bankNiftyFutureData = await BankNiftyFutureModel.find({
      timestamp: { $gte: start, $lt: end },
    }).sort({ timestamp: 1 });

    // MONGOOSE PARSE ARRAY AS JSON
    bankNiftyOptionChainData = JSON.parse(
      JSON.stringify(bankNiftyOptionChainData)
    );
    bankNiftyFutureData = JSON.parse(JSON.stringify(bankNiftyFutureData));

    bankNiftyLastPrice = bankNiftyFutureData.length
      ? JSON.parse(
          JSON.stringify(bankNiftyFutureData[bankNiftyFutureData.length - 1])
        )
      : false;

    if (bankNiftyLastPrice) {
      bankNiftyLastPrice = Math.ceil(bankNiftyLastPrice?.lastPrice / 100) * 100;

      let strikeArray = [
        ...new Set(bankNiftyStrikePricesArray(bankNiftyLastPrice - 200, 7)),
      ].sort();
      // remove last strikePrice
      strikeArray.pop();

      // store temporary data
      let tempObject = {};
      for (let index = 0; index < strikeArray.length; index++) {
        const num = strikeArray[index];
        const data = bankNiftyOptionChainData.map((record) => {
          record.data.filter((element) => {
            if (element.strikePrice === num) {
              tempObject = {
                timestamp: record.timestamp,
                underlyingValue: record.underlyingValue,
                strikePrice: num,
                CEPrice: element.CE.lastPrice,
                CEOpenInterest: element.CE.openInterest,
                CEChangeinOpenInterest: element.CE.changeinOpenInterest,
                PEPrice: element.PE.lastPrice,
                PEOpenInterest: element.PE.openInterest,
                PEChangeinOpenInterest: element.PE.changeinOpenInterest,
              };
            }
          });
          return tempObject;
        });
        bankNiftyStrikePricesData[num] = data;
      }
    }

    socket.emit("bankNiftyOptionChainData", {
      bankNiftyOptionChainData,
      bankNiftyFutureData,
      bankNiftyStrikePricesData,
    });
  } catch (error) {
    console.error(
      `getBankNiftyOptionChainData ==============> Error: ${error}`
    );
  }
};

export { getNiftyOptionChainData, getBankNiftyOptionChainData };
