import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";

import { niftyStrikePricesArray } from "./cronjob/niftyOptionChain";
import { bankNiftyStrikePricesArray } from "./cronjob/bankniftyOptionChain";

const app = require("express")();
const httpServer = require("http").createServer(app);

import routes from "./controller";
import {
  getNiftyOptionChainData,
  getBankNiftyOptionChainData,
} from "./socketIoResponses";

import { times } from "lodash";
import {
  NiftyOptionChainModel,
  BankNiftyOptionChainModel,
  NiftyFutureModel,
  BankNiftyFutureModel,
} from "./db/models";

const options = {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"],
  upgrade: false,
};
const io = require("socket.io")(httpServer, options);

//bankNiftyRoom
let bankNiftyRoom = io.of("/bankNiftyRoom");
let niftyRoom = io.of("/niftyRoom");

// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

app.set("socketio", io);

app.use(cors()); //

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
// morgan
app.use(morgan("tiny"));

app.use("/api", routes); // tells the server to use the routes in routes.

app.get("/", (req, res) => {
  res.send("Hello Babel");
});

io.on("connection", (socket) => {
  console.log(`${socket.id} is connected`);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const getApiAndEmit = async (socket, timestamp) => {
  try {
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
      ? JSON.parse(JSON.stringify(niftyFutureData[niftyFutureData.length - 1]))
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

    socket.emit("FromAPI", {
      niftyOptionChainData,
      niftyFutureData,
      niftyStrikePricesData,
    });
  } catch (error) {
    console.error(`Error: ${error.code}`, error);
  }
};

const getBankNiftyDataEmit = async (socket, timestamp) => {
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

    socket.emit("BANKNIFTY", {
      bankNiftyOptionChainData,
      bankNiftyFutureData,
      bankNiftyStrikePricesData,
    });
  } catch (error) {
    console.error(`Error: ${error.code}`, error);
  }
};

let interval;
let interval1;

io.on("connection", (socket) => {
  console.log("New client connected");
  let timestamp =
    // socket.handshake.query["timestamp"] || new Date("2021-04-04T18:32:14.301Z");
    socket.handshake.query["timestamp"] || new Date();

  if (interval) {
    clearInterval(interval);
  }
  // if (interval1) {
  //   clearInterval(interval1);
  // }
  // interval = setInterval(() => {
  //   getApiAndEmit(socket, timestamp);
  //   getBankNiftyDataEmit(socket, timestamp);
  // }, 8000);

  // interval1 = setInterval(() => {
  //   getBankNiftyDataEmit(socket, timestamp);
  // }, 5000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

//BANKNIFTY ROOM
bankNiftyRoom.on("connection", function (socket) {
  let timestamp = socket.handshake.query["timestamp"] || new Date();
  // let timestamp =  socket.handshake.query["timestamp"] || new Date("2021-04-07T10:00:00.000Z");
  if (interval1) {
    clearInterval(interval1);
  }

  interval1 = setInterval(() => {
    // getApiAndEmit(socket, timestamp);
    getBankNiftyDataEmit(socket, timestamp);
  }, 8000);
});

//NIFTY ROOM
niftyRoom.on("connection", function (socket) {
  let timestamp = socket.handshake.query["timestamp"] || new Date();
  // let timestamp =  socket.handshake.query["timestamp"] || new Date("2021-04-07T10:00:00.000Z");
  if (interval) {
    clearInterval(interval);
  }

  interval = setInterval(() => {
    getApiAndEmit(socket, timestamp);
    // getBankNiftyDataEmit(socket, timestamp);
  }, 6000);
});

// io.on("connection", async (socket) => {
//   console.log(`${socket.id} is connected`);
//   let timestamp = socket.handshake.query["timestamp"] || new Date();

//   if (interval) {
//     clearInterval(interval);
//   }

//   async function getApiAndEmit(socket, timestamp) {
//     socket.emit("FromAPI", { message: "HI getApiAndEmit", timestamp });
//     let start = new Date(timestamp);
//     start.setHours(0, 0, 0, 0);
//     let end = new Date(timestamp);
//     end.setHours(23, 59, 59, 999);
//     let niftyLastPrice = null;
//     let niftyStrikePricesData = {};

//     let niftyOptionChainData = await NiftyOptionChainModel.find({
//       timestamp: { $gte: start, $lt: end },
//     }).sort({ timestamp: 1 });

//     NiftyOptionChainModel.find({
//       timestamp: { $gte: start, $lt: end },
//     })
//       .lean()
//       .exec(function (err, users) {
//         socket.broadcast.emit("FromAPI", {
//           message: "HI AFTER",
//           users: JSON.parse(JSON.stringify(users)),
//         });

//         // return res.end(JSON.stringify(users));
//       });

//     socket.broadcast.emit("FromAPI", { message: "HI AFTER" });

//     // MONGOOSE PARSE ARRAY AS JSON
//     niftyOptionChainData = JSON.parse(JSON.stringify(niftyOptionChainData));

//     getNiftyOptionChainData(socket, timestamp, niftyOptionChainData);
//     // const {
//     //   niftyOptionChainData,
//     //   niftyFutureData,
//     //   niftyStrikePricesData,
//     // } = await getNiftyOptionChainData(socket, timestamp);

//     // console.log(niftyOptionChainData.length);

//     // socket.emit("FromAPI", {
//     //   niftyOptionChainData,
//     //   niftyFutureData,
//     //   niftyStrikePricesData,
//     // });

//     // socket.emit("niftyOptionChainData", {
//     //   niftyOptionChainData,
//     //   niftyFutureData,
//     //   niftyStrikePricesData,
//     // });
//     // getBankNiftyOptionChainData(socket, timestamp);
//   }

//   // async function getApiAndEmit(socket, timestamp) {
//   //   await getNiftyOptionChainData(socket, timestamp);
//   //   getBankNiftyOptionChainData(socket, timestamp);
//   // }

//   function sleep(ms) {
//     return new Promise((resolve) => {
//       setTimeout(resolve, ms);
//     });
//   }

//   interval = setInterval(() => getApiAndEmit(socket, timestamp), 1000);

//   // interval = setInterval(async () => {
//   //   // await getNiftyOptionChainData(socket, timestamp);
//   //   // await getBankNiftyOptionChainData(socket, timestamp);

//   //   await new Promise((resolve) => setTimeout(resolve, 5000));
//   // }, 1000);

//   // interval = setInterval(async () => {
//   //   // await getNiftyOptionChainData(socket, timestamp);
//   //   // await getBankNiftyOptionChainData(socket, timestamp);

//   //   await new Promise((resolve) => setTimeout(resolve, 5000));
//   // }, 3000);

//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//   });
// });

export default httpServer;
