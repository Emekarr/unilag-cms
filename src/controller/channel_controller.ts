import { Request, Response, NextFunction } from "express";

import Channel, { IChannel } from "../model/channels";
import WorkSpace from "../model/workspace";
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
      ).respond(res);
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

export default {
  create_channel,
};
