import { Request, Response, NextFunction } from "express";

import ServerResponse from "../utils/response";

export default (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.is_admin)
      return new ServerResponse(
        "You do not have permission to access this route"
      )
        .statusCode(400)
        .success(false)
        .respond(res);

    next();
  } catch (err) {
    next(err);
  }
};
