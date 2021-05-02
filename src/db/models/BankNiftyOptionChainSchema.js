import mongoose from "mongoose";

const Schema = mongoose.Schema;

// https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY
const BankNiftyOptionChainSchema = new Schema({}, { strict: false });
// const BankNiftyOptionChainSchema = new Schema({ any: Schema.Types.Mixed });

const BankNiftyOptionChainModel = mongoose.model(
  "BANKNIFTYOPTIONCHAIN",
  BankNiftyOptionChainSchema
);
export default BankNiftyOptionChainModel;
