import { Request, Response, NextFunction } from "express";

import Channel, { IChannel, ChannelDocument } from "../model/channels";
import WorkSpace from "../model/workspace";
import Student from "../model/student";
import ServerResponse from "../utils/response";
import CustomError from "../utils/custom_error";

const create_channel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const channel_data: IChannel = req.body;
    if (!channel_data.name || !channel_data.workspace)
      return new ServerResponse(
        "Please provide the info needed to create a new channel"
      )
        .success(false)
        .statusCode(400)
        .respond(res);
    if (!channel_data.compulsory) channel_data.compulsory = false;
    const workspace = await WorkSpace.findById(channel_data.workspace);
    if (!workspace) throw new CustomError("The workspace does not exist", 401);
    if (workspace.creator.toString() !== req.id.toString() || !req.is_admin)
      throw new CustomError(
        "You do not have permission to create a channel for this workspace",
        401
      );
    const new_channel = new Channel({ ...channel_data, creator: req.id });
    const channel = await new_channel.save();
    if (!channel)
      throw new CustomError(
        "Something went wrong with creating the workspace",
        400
      );

    new ServerResponse("Channel created successfully")
      .data(channel)
      .respond(res);
  } catch (err) {
    next(err);
  }
};

const channel_details = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.body;
    if (!id)
      return new ServerResponse(
        "Please provide either a channel name or id"
      ).respond(res);
    let channel = await Channel.findById(id);
    if (!channel) throw new CustomError("Channel not found", 404);
    const student = await Student.findById(req.id);
    if (channel.compulsory) {
      const is_member = student.workspaces.find((ws) => {
        ws.toString() === channel.workspace.toString();
      });
      if (!is_member) throw new CustomError("You cannot access this data", 401);
    } else {
      const is_member = student.electives.find(
        (channel) => channel === channel._id
      );
      if (!is_member) throw new CustomError("You cannot access this data", 401);
    }
    new ServerResponse("Channel found").data(channel).respond(res);
  } catch (err) {
    next(err);
  }
};

export default {
  create_channel,
  channel_details,
};
