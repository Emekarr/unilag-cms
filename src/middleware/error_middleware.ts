import { Response, Request, NextFunction } from "express";

import CustomError from "../utils/custom_error.js";
import ServerResponse from "../utils/response.js";

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
    new ServerResponse(err.message).respond(
      res,
      (err as CustomError).error_code
    );
  } else if (err_names.includes(err.name)) {
    new ServerResponse(err.message).respond(res, 400);
  } else {
    new ServerResponse(err.message).respond(res, 500);
  }
};
