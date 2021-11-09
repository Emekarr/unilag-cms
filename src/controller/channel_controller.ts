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
    if (workspace.creator.toString() !== req.id.toString() || !req.class_rep)
      throw new CustomError(
        "You do not have permission to create a channel for this workspace",
        401
      );
    const new_channel = new Channel({ ...channel_data, creator: req.id });
    let channel: ChannelDocument | undefined | null;
    if (new_channel.compulsory) {
      channel = await new_channel.save();
    } else {
      const student = await Student.findById(req.id);
      student.electives.push({ elective: new_channel._id });
      new_channel.subscribers.push(student._id);
      await student.save();
      channel = await new_channel.save();
    }
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
      return new ServerResponse("Please provide a channe id").respond(res);
    let channel = await Channel.findById(id);
    if (!channel) throw new CustomError("Channel not found", 404);
    const student = await Student.findById(req.id);
    if (channel.compulsory) {
      const is_member = student.workspaces.find(
        (ws) => ws.workspace.toString() === channel.workspace.toString()
      );
      if (!is_member) throw new CustomError("You cannot access this data", 401);
    } else {
      const is_member = student.electives.find(
        (el) => el.elective.toString() === channel._id.toString()
      );
      if (!is_member) throw new CustomError("You cannot access this data", 401);
    }
    new ServerResponse("Channel found").data(channel).respond(res);
  } catch (err) {
    next(err);
  }
};

const join_channel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.body;
    if (!id)
      return new ServerResponse("Please provide a channel id")
        .success(false)
        .statusCode(400)
        .respond(res);
    let channel = await Channel.findById(id);
    if (!channel) throw new CustomError("Channel not found", 404);
    const student = await Student.findById(req.id);
    if (channel.compulsory) {
      const is_member = student.workspaces.find((ws) => {
        ws.workspace.toString() === channel.workspace.toString();
      });
      if (!is_member) {
        throw new CustomError("You cannot access this data", 401);
      } else {
        throw new CustomError("You are already a member of this channel", 401);
      }
    } else {
      const is_member = student.electives.find(
        (el) => el.elective.toString() === channel._id.toString()
      );
      if (is_member) {
        throw new CustomError("You are already a member of this channel", 401);
      } else {
        student.electives.push({ elective: channel._id });
        channel.subscribers.push(student._id);
        await student.save();
        await channel.save();
      }
    }
    new ServerResponse("Channel joined").data(channel).respond(res);
  } catch (err) {
    next(err);
  }
};

const get_all_user_channels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.query;
    if (!id)
      return new ServerResponse("Please provide a workspace id")
        .success(false)
        .statusCode(400)
        .respond(res);
    const user = await Student.findById(req.id);
    const is_member = user.workspaces.find(
      (ws) => ws.workspace.toString() === id.toString()
    );
    if (!is_member)
      throw new CustomError(
        "You are not a member of thsis workspace and cannot access its channels.",
        400
      );
    const workspace = await WorkSpace.findById(id);
    const channels = await workspace.getChannelList();
    const compulsory = channels.filter((ch) => ch.compulsory === true);
    const elective = channels.filter((ch) =>
      ch.subscribers.find((sub) => sub.toString() === req.id)
    );
    new ServerResponse("Channels list returned")
      .data({ channels: [...compulsory, ...elective] })
      .respond(res);
  } catch (err) {
    next(err);
  }
};

export default {
  create_channel,
  channel_details,
  join_channel,
  get_all_user_channels,
};
