import { Request, Response, NextFunction } from "express";

import ServerResponse from "../utils/response";
import WorkSpace from "../model/workspace";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.class_rep) next();
    const workspace = await WorkSpace.findById(req.query.id);
    if (!workspace)
      return new ServerResponse("workspace not found")
        .statusCode(404)
        .success(false)
        .respond(res);
    const is_admin = workspace.admins.find(
      (admin) => admin.toString() === req.id.toString()
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
