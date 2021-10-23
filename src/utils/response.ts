import { Response } from "express";

class ServerResponse {
  private payload: { message: string; data: object | null; success: boolean } =
    { message: "", data: null, success: true };

  constructor(
    public message: string,
    public data: object | null = null,
    public success: boolean = true
  ) {}

  respond(res: Response, status_code: number) {
    this.payload = {
      message: this.message
        .split(" ")
        .map((char) => char.substring(0, 1).toUpperCase() + char.substring(1))
        .join(" "),
      data: this.data || null,
      success: this.success || false,
    };

    res.status(status_code).json(this.payload);
  }
}

export default class ServerResponseBuilder {
  private response: ServerResponse;
  private status_code: number = 200;

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
