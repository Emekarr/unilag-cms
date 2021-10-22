import { Response, Request, NextFunction } from "express";

import CustomError from "../utils/custom_error";
import ServerResponse from "../utils/response";

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
    new ServerResponse(err.message)
      .success(false)
      .statusCode((err as CustomError).error_code)
      .respond(res);
  } else if (err_names.includes(err.name)) {
    new ServerResponse(err.message).success(false).statusCode(400).respond(res);
  } else {
    new ServerResponse(err.message).success(false).statusCode(500).respond(res);
  }
};
