import { Response } from "express";

class ServerResponse {
  readonly payload: { message: string; data: object; success: boolean };

  constructor(
    public message: string,
    public data: object = null,
    public success: boolean = true
  ) {
    this.payload = {
      message: message
        .split(" ")
        .map((char) => char.substring(0, 1).toUpperCase() + char.substring(1))
        .join(" "),
      data,
      success,
    };
  }

  respond(res: Response, status_code: number) {
    res.status(status_code).json(this.payload);
  }
}

export default class ServerResponseBuilder {
  private response: ServerResponse;
  private status_code: number;

  constructor(private message: string) {
    this.response = new ServerResponse(message);
  }

  data(data: object) {
    this.response.data = data;
    return this;
  }

  success(success: boolean) {
    this.response.success = success;
    return this;
  }

  statusCode(status_code: number) {
    this.status_code = status_code;
    return this;
  }

  respond(res: Response) {
    this.response.respond(res, this.status_code);
  }
}
