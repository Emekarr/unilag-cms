import { Request, Response, NextFunction } from "express";

import WorkSpace, { IWorkSpace } from "../model/workspace";
import CustomError from "../utils/custom_error";
import ServerResponse from "../utils/response";

const create_workspace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspace_details: IWorkSpace = req.body;
    const new_workspace = new WorkSpace({
      ...workspace_details,
      creator: req.id,
    });
    const workspace = await new_workspace.save();
    if (!workspace)
      throw new CustomError(
        "Something went wrong with creating the workspace",
        400
      );
    new ServerResponse("WorkSpace created successfully.")
      .data(workspace)
      .respond(res);
  } catch (err) {
    next(err);
  }
};

export default {
  create_workspace,
};
