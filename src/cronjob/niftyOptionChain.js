import { NiftyOptionChainModel } from "../db/models";
import { instance, getCookies, cookie } from "./genericInstance";

let NIFTY_OPTION_CHAIN_URL =
  "https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY";

function round(value) {
  return Math.round(value * 100) / 100;
}

/**
 * NIFTY STRIKE ARRAY
 * @returns tempArray
 */

const niftyStrikePricesArray = (underlyingValue, size = 15) => {
  const tempArray = [];
  // let size = 15;
  let count = size / 2;

  for (let i = 1; i <= size; i++) {
    if (i <= count) {
      const roundedNumber = underlyingValue - i * 50;
      const value = Math.ceil(roundedNumber / 50) * 50;
      tempArray.push(value);
    }
    if (i === Math.ceil(count)) {
      tempArray.push(underlyingValue);
    }
    if (i >= count) {
      const roundedNumber = underlyingValue + (i - count) * 50;
      const value = Math.ceil(roundedNumber / 50) * 50;
      tempArray.push(value);
    }
  }

  return tempArray;
};

const getNiftyOptionChainData = async () => {
  try {
    if (cookie) {
      const { data } = await instance.get(NIFTY_OPTION_CHAIN_URL, {
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
      let currentExpiry = data.records.expiryDates[0];
      let timestamp = data.records.timestamp;
      let underlyingValue = data.records.underlyingValue;
      underlyingValue = Math.ceil(underlyingValue / 50) * 50;
      let filtered = data.filtered;

      /**
       * TEMPORARY COMMENTED
       */

      //CHANGE IN OI Function
      // get strikeArray near underlying value
      // const allStrikePricesData = [];

      // let strikeArray = [
      //   ...new Set(niftyStrikePricesArray(underlyingValue)),
      // ].sort();
      // // remove last strikePrice
      // strikeArray.pop();

      // for (let index = 0; index < strikeArray.length; index++) {
      //   const num = strikeArray[index];
      //   const data = filtered.data.find((row) => row.strikePrice === num);
      //   allStrikePricesData.push(data);
      // }

      // const filterCallData = allStrikePricesData.map((item) => {
      //   return item.CE;
      // });

      // const filterPutData = allStrikePricesData.map((item) => {
      //   return item.PE;
      // });

      /**
       * ALL STRIKE PRICES COMPUTATION
       */

      const filterCallData = data.filtered.data.map((item) => {
        return item.CE;
      });

      const filterPutData = data.filtered.data.map((item) => {
        return item.PE;
      });

      //callData
      const additionCallData = filterCallData.reduce((acc, curr) => {
        if (Object.keys(acc).length === 0) {
          return {
            CECumulativePrice: curr.lastPrice,
            CECumulativeOpenInterest: curr.openInterest,
            CECumulativeChangeInOpenInterest: curr.changeinOpenInterest,
            CECumulativePChangeInOpenInterest: curr.pchangeinOpenInterest,
          };
        }

        acc = {
          CECumulativePrice: acc.CECumulativePrice + curr.lastPrice,
          CECumulativeOpenInterest:
            acc.CECumulativeOpenInterest + curr.openInterest,
          CECumulativeChangeInOpenInterest:
            acc.CECumulativeChangeInOpenInterest + curr.changeinOpenInterest,
          CECumulativePChangeInOpenInterest:
            acc.CECumulativePChangeInOpenInterest + curr.pchangeinOpenInterest,
        };

        return acc;
      }, {});

      //putData
      const additionPutData = filterPutData.reduce((acc, curr) => {
        if (Object.keys(acc).length === 0) {
          return {
            PECumulativePrice: curr.lastPrice,
            PECumulativeOpenInterest: curr.openInterest,
            PECumulativeChangeInOpenInterest: curr.changeinOpenInterest,
            PECumulativePChangeInOpenInterest: curr.pchangeinOpenInterest,
          };
        }

        acc = {
          PECumulativePrice: acc.PECumulativePrice + curr.lastPrice,
          PECumulativeOpenInterest:
            acc.PECumulativeOpenInterest + curr.openInterest,
          PECumulativeChangeInOpenInterest:
            acc.PECumulativeChangeInOpenInterest + curr.changeinOpenInterest,
          PECumulativePChangeInOpenInterest:
            acc.PECumulativePChangeInOpenInterest + curr.pchangeinOpenInterest,
        };

        return acc;
      }, {});

      let storeObject = {
        currentExpiry,
        stringTimestamp: timestamp,
        timestamp: new Date(timestamp),
        underlyingValue: Math.round(data?.records?.underlyingValue),
        totCEOI: filtered?.CE?.totOI,
        totPEOI: filtered?.PE?.totOI,
        data: filtered?.data,
        tolPCROI: round(filtered?.PE?.totOI / filtered?.CE?.totOI),
        tolVOLOI: round(filtered?.PE?.totVol / filtered?.CE?.totVol),
        CumulativePCROI: round(
          additionPutData?.PECumulativeOpenInterest /
            additionCallData?.CECumulativeOpenInterest
        ),
        CECumulativePrice: Math.round(additionCallData?.CECumulativePrice),
        CECumulativeOpenInterest: additionCallData?.CECumulativeOpenInterest,
        CECumulativeChangeInOpenInterest:
          additionCallData?.CECumulativeChangeInOpenInterest,
        CECumulativePChangeInOpenInterest: Math.round(
          additionCallData?.CECumulativePChangeInOpenInterest
        ),
        PECumulativePrice: Math.round(additionPutData?.PECumulativePrice),
        PECumulativeOpenInterest: additionPutData?.PECumulativeOpenInterest,
        PECumulativeChangeInOpenInterest:
          additionPutData?.PECumulativeChangeInOpenInterest,
        PECumulativePChangeInOpenInterest: Math.round(
          additionPutData?.PECumulativePChangeInOpenInterest
        ),
        // filterCallData,
        // filterPutData,
        createdAt: new Date(),
        DiffCumulativeOpenInterest:
          additionPutData?.PECumulativeOpenInterest -
          additionCallData?.CECumulativeOpenInterest,
        DiffCumulativeChangeInOpenInterest:
          additionPutData?.PECumulativeChangeInOpenInterest -
          additionCallData?.CECumulativeChangeInOpenInterest,
        DiffTotOI: filtered?.PE?.totOI - filtered?.CE?.totOI,
      };

      try {
        const record = await NiftyOptionChainModel.find({
          stringTimestamp: timestamp,
        });
        if (!record.length) {
          await NiftyOptionChainModel.create(storeObject);
          console.log(
            "getNiftyOptionChainData =====> NiftyOptionChainModel.create ======> Data addded successfully"
          );
        }
      } catch (error) {
        console.log(
          "getNiftyOptionChainData =====> NiftyOptionChainModel.create ======> error"
        );
      }
    } else {
      // await getCookies();
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log("getNiftyOptionChainData =========> error.status === 401");
      if (!cookie) {
        console.log("getNiftyOptionChainData =========> cookie not found");
        // await getCookies();
      }
      // await getNiftyOptionChainData();
    } else {
      console.log("getNiftyOptionChainData =========> error", error);
    }
  }
};

export { getNiftyOptionChainData, niftyStrikePricesArray };
