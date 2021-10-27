import { Request, Response, NextFunction } from "express";

import WorkSpace, { IWorkSpace } from "../model/workspace";
import Student from "../model/student";
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

const join_workspace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspace_name } = req.body;
    const student = await Student.findById(req.id);
    if (!student) throw new CustomError("Student ID not valid", 404);
    const workspace = await WorkSpace.findOne({ name: workspace_name });
    if (!workspace)
      throw new CustomError(
        `Workspace "${workspace_name}" does not exist.`,
        404
      );
    const already_a_member = student.workspaces.find(
      (ws) => ws.workspace_name === workspace_name
    );
    if (already_a_member) 
    new ServerResponse("You are already a member of this workspace.").respond(res);
    student.workspaces.push({ workspace_name });
    await student.save();
    new ServerResponse("Joined workspace successfully.").respond(res);
  } catch (err) {
    next(err);
  }
};

export default {
  create_workspace,
  join_workspace,
};
