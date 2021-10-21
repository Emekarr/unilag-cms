import { Response, Request, ErrorRequestHandler, NextFunction } from "express";

import CustomError from "../utils/custom_error";

const err_names = ["CastError", "SyntaxError"];

export default (
  err: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("AN ERROR OCCURED!");
  console.log(`ERROR MESSAGE: ${err.message}\n ERROR_NAME: ${err.name}`);
  console.log(err);
  if (err.name === "CustomError") {
    console.log("custom error");
  } else if (err_names.includes(err.name)) {
    console.log("error 400");
  } else {
    console.log("error 500");
  }
};
