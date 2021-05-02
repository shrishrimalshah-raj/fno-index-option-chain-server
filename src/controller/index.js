import express from "express";

import { BookRouter } from "./Book";
import { NiftyRouter } from "./Nifty";

// import { DerivativesRouter } from "./Derivatives";
// import { PcrRouter } from "./Pcr";

const router = express.Router();

// BOOK ROUTES
// router.use("/book", BookRouter);
router.use("/nifty", NiftyRouter);

// FNO ROUTES
// router.use("/derivatives", DerivativesRouter);
// router.use("/pcr", PcrRouter);

export default router;
