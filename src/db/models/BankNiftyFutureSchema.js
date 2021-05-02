import mongoose from "mongoose";

const Schema = mongoose.Schema;

// https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY
const BankNiftyFutureSchema = new Schema({}, { strict: false });
// const BankNiftyFutureSchema = new Schema({ any: Schema.Types.Mixed });

const BankNiftyFutureModel = mongoose.model(
  "BANKNIFTYFUTURE",
  BankNiftyFutureSchema
);
export default BankNiftyFutureModel;
