import mongoose from "mongoose";

const Schema = mongoose.Schema;

// https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY
const NiftyFutureSchema = new Schema({}, { strict: false });
// const NiftyFutureSchema = new Schema({ any: Schema.Types.Mixed });

const NiftyFutureModel = mongoose.model(
  "NIFTYFUTURE",
  NiftyFutureSchema
);
export default NiftyFutureModel;
