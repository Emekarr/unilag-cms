import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import ServerResponse from "../utils/response";
import Student from "../model/student";
import RefreshToken from "../model/refresh_token";
import AuthToken from "../model/auth_token";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth_token_header = req.headers.authorizationauthtoken as string;
    const refresh_token_header = req.headers
      .authorizationrefreshtoken as string;
    if (
      !auth_token_header ||
      auth_token_header === " " ||
      !refresh_token_header ||
      refresh_token_header === " "
    )
      return new ServerResponse("Tokens not provided")
        .statusCode(400)
        .success(false)
        .respond(res);

    let refresh_decoded: JwtPayload | undefined;
    jwt.verify(
      refresh_token_header,
      process.env.JWT_REFRESH_KEY!,
      function (err, decoded) {
        if (err) {
          if (err.name === "TokenExpiredError") {
            return new ServerResponse(
              "Refresh token expired. Please sign in again."
            )
              .statusCode(400)
              .success(false)
              .respond(res);
          }
        }
        refresh_decoded = decoded;
      }
    );

    if (!refresh_decoded)
      return new ServerResponse("Refresh token expired. Please sign in again.")
        .statusCode(400)
        .success(false)
        .respond(res);

    let auth_decoded: JwtPayload | undefined;
    jwt.verify(
      auth_token_header,
      process.env.JWT_AUTH_KEY!,
      function (err, decoded) {
        if (err) {
          if (err.name === "TokenExpiredError") {
            return new ServerResponse(
              "Auth token expired. Please sign in again."
            )
              .statusCode(400)
              .success(false)
              .respond(res);
          }
        }
        auth_decoded = decoded;
      }
    );

    if (!auth_decoded)
      return new ServerResponse("Auth token expired. Please sign in again.")
        .statusCode(400)
        .success(false)
        .respond(res);

    if (auth_decoded.refresh_token !== refresh_token_header)
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

    const refresh_token = await RefreshToken.findOne({
      owner: auth_decoded.id,
      token: refresh_token_header,
    });
    if (!refresh_token)
      return new ServerResponse("Expired refresh token used.")
        .statusCode(400)
        .success(false)
        .respond(res);

    const auth_token = await AuthToken.findOne({
      owner: auth_decoded.id,
      refresh_token: refresh_token.token,
      token: auth_token_header,
    });
    if (!auth_token)
      return new ServerResponse("Expired auth token used.")
        .statusCode(400)
        .success(false)
        .respond(res);

    const ip_address = req.socket.remoteAddress!;
    if (
      ip_address !== auth_token.ip_address ||
      ip_address !== refresh_token.ip_address
    ) {
      await auth_token.deleteOne();
      await refresh_token.deleteOne();
      return new ServerResponse("token used from unrecognised device.")
        .statusCode(400)
        .success(false)
        .respond(res);
    }
    req.id = student._id;
    next();
  } catch (err) {
    next(err);
  }
};
