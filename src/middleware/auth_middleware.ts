import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";

import ServerResponse from "../utils/response";
import Student from "../model/student";

export default async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const auth_token = req.headers.authorizationauthtoken as string;
    const refresh_token = req.headers.authorizationrefreshtoken as string;
    if (
      !auth_token ||
      auth_token === " " ||
      !refresh_token ||
      refresh_token === " "
    )
      return new ServerResponse("Tokens not provided")
        .statusCode(400)
        .success(false)
        .respond(res);
    const refresh_decoded = jwt.verify(
      refresh_token,
      process.env.JWT_REFRESH_KEY!
    ) as JwtPayload;
    const auth_decoded = jwt.verify(
      auth_token,
      process.env.JWT_AUTH_KEY!,
    ) as JwtPayload;
    if (auth_decoded.refresh_token !== refresh_token)
      return new ServerResponse("Invalid tokens used.")
        .statusCode(400)
        .success(false)
        .respond(res);
    if (refresh_decoded.id !== auth_decoded.id)
      return new ServerResponse("Invalid tokens used.")
        .statusCode(400)
        .success(false)
        .respond(res);
    const student = await Student.findById(refresh_decoded.id);
    if (!student)
      return new ServerResponse("No user was found.")
        .statusCode(400)
        .success(false)
        .respond(res);
    const auth_token_match = student.auth_tokens.find(
      (token) => token.token === auth_token
    );
    if (!auth_token_match)
      return new ServerResponse("Invalid tokens used.")
        .statusCode(400)
        .success(false)
        .respond(res);
    const refresh_token_match = student.refresh_tokens.find(
      (token) => token.token === refresh_token
    );
    if (!refresh_token_match)
      return new ServerResponse("Invalid tokens used.")
        .statusCode(400)
        .success(false)
        .respond(res);
    const ip_address = req.socket.remoteAddress!;
    if (
      ip_address !== auth_token_match.ip_address ||
      ip_address !== refresh_token_match.ip_address
    ) {
      student.auth_tokens = student.auth_tokens.filter(
        (token) => token.token !== auth_token
      );
      student.refresh_tokens = student.refresh_tokens.filter(
        (token) => token.token !== refresh_token
      );
      await student.save();
      return new ServerResponse("token used from unrecognised device.")
        .statusCode(400)
        .success(false)
        .respond(res);
    }
    req.id = student._id;
    req.is_admin = student.admin;
    next();
  } catch (err) {
    next(err);
  }
};
