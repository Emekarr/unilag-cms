import { Response } from "express";

export default class ServerResponse {
  readonly payload: { message: string; data: object; success: boolean };

  constructor(message: string, data: object, success: boolean) {
    this.payload = {
      message: message
        .split(" ")
        .map((char) => char.substring(0, 1).toUpperCase() + char.substring(1))
        .join(" "),
      data: data || null,
      success: success || false,
    };
  }

  respond(res: Response, status_code: number) {
    res.status(status_code).json(this.payload);
  }
}
