import { Request, Response, NextFunction } from "express";

import ServerResponse from "../utils/response";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.class_rep)
      return new ServerResponse("you are not authorised to access this route")
        .statusCode(401)
        .success(false)
        .respond(res);
    next();
  } catch (err) {
    next(err);
  }
};
