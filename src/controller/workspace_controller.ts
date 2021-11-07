import { Request, Response, NextFunction } from "express";

import WorkSpace, { IWorkSpace, WorkSpaceDocument } from "../model/workspace";
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
      admins: [req.id],
    });
    const workspace = await new_workspace.save();
    if (!workspace)
      throw new CustomError(
        "Something went wrong with creating the workspace",
        400
      );
    const student = await Student.findById(req.id);
    student.workspaces.push({ workspace: workspace._id });
    await student.save();
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
      (ws) => ws.workspace.toString() === workspace._id.toString()
    );
    if (already_a_member)
      return new ServerResponse(
        "You are already a member of this workspace."
      ).respond(res);

    student.workspaces.push({ workspace: workspace._id });
    await student.save();
    new ServerResponse("Joined workspace successfully.").respond(res);
  } catch (err) {
    next(err);
  }
};

const get_info = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workspace_name, workspace_id } = req.body;
    if (!workspace_id && !workspace_name) {
      throw new CustomError(
        "Please provide a workspace id or name to work with.",
        400
      );
    }

    let workspace: WorkSpaceDocument | null | undefined;
    if (workspace_name) {
      workspace = await WorkSpace.findOne({ name: workspace_name });
      if (!workspace)
        return new ServerResponse("No workspace exists with such name")
          .statusCode(404)
          .success(false)
          .respond(res);
    } else if (workspace_id) {
      workspace = await WorkSpace.findById(workspace_id);
      if (!workspace)
        return new ServerResponse("No workspace exists with such name")
          .statusCode(404)
          .success(false)
          .respond(res);
    }
    const student = await Student.findById(req.id);
    const is_member = student.workspaces.find(
      (ws) => ws.workspace.toString() === workspace._id.toString()
    );
    if (!is_member)
      return new ServerResponse(
        "You are not a member of this workspace so you cannot access this information."
      )
        .statusCode(404)
        .success(false)
        .respond(res);

    new ServerResponse("WorkSpace data found and returned.")
      .data(workspace)
      .respond(res);
  } catch (err) {
    next(err);
  }
};

const get_members_count = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.body;
    const workspace = await WorkSpace.findById(id);
    if (!workspace)
      return new ServerResponse("No workspace exists with such id")
        .statusCode(404)
        .success(false)
        .respond(res);
    const count = await workspace.getMembersCount();
    new ServerResponse("Members count returned")
      .data({ count: count })
      .respond(res);
  } catch (err) {
    next(err);
  }
};

const set_timetable = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.query;
    const workspace = await WorkSpace.findById(id);
    if (!workspace)
      return new ServerResponse("No workspace exists with such id")
        .success(false)
        .statusCode(404)
        .respond(res);
    if (req.file) {
      workspace.timetable = req.file.buffer;
    } else {
      workspace.timetable = null;
    }
    await workspace.save();
    new ServerResponse("Timetable updated").data(workspace).respond(res);
  } catch (err) {
    next(err);
  }
};

export default {
  create_workspace,
  join_workspace,
  get_members_count,
  get_info,
  set_timetable,
};
