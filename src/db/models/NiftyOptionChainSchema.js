import mongoose from "mongoose";

const Schema = mongoose.Schema;

// https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY
const NiftyOptionChainSchema = new Schema({}, { strict: false });
// const NiftyOptionChainSchema = new Schema({ any: Schema.Types.Mixed });


const NiftyOptionChainModel = mongoose.model(
  "NIFTYOPTIONCHAIN",
  NiftyOptionChainSchema
);
export default NiftyOptionChainModel;
