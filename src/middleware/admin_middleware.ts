import { Request, Response, NextFunction } from "express";

import ServerResponse from "../utils/response";
import WorkSpace from "../model/workspace";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspace = await WorkSpace.findById(req.body.workspace);
    const is_admin = workspace.admins.find(
      (admin) => admin.toString() === req.id
    );
    if (!is_admin)
      return new ServerResponse(
        "You do not have permission to access this route"
      )
        .statusCode(400)
        .success(false)
        .respond(res);

    req.is_admin = true;
    next();
  } catch (err) {
    next(err);
  }
};
