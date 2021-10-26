import { Request, Response, NextFunction } from "express";

import Student, { IStudent, StudentDocument } from "../model/student";
import Token from "../model/token";
import CustomError from "../utils/custom_error";
import ServerResponse from "../utils/response";
import generate_otp from "../utils/generate_otp";
import send_otp_sms from "../utils/send_otp_sms";

const sign_up = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student_data: IStudent = req.body;
    const new_student = new Student({
      ...student_data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    const student = await new_student.save();
    if (!student) throw new CustomError("Could not create new entry.", 400);
    new ServerResponse("Student created successfully.")
      .data(student)
      .respond(res);
  } catch (err) {
    next(err);
  }
};

const request_otp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id: string = req.body.id;
    const student = (await Student.findById(id))!;
    if (!student)
      return new ServerResponse("User entry deleted. Please create user again.")
        .statusCode(400)
        .success(false)
        .respond(res);
    const token = await Token.findOne({ student_id: student._id });
    if (token) await token.deleteOne();
    const otp = generate_otp();
    await new Token({
      student_id: student._id,
      token: otp,
      createdAt: Date.now(),
    }).save();
    if (process.env.NODE_ENV === "PROD" || process.env.NODE_ENV === "DEV") {
      send_otp_sms(process.env.PLATFORM!, student.phone, otp)
        .then(async () => {
          new ServerResponse("OTP sent successfully.").respond(res);
        })
        .catch((e) => {
          new ServerResponse("Failed to send otp.")
            .statusCode(500)
            .success(false)
            .respond(res);
        });
    } else if (process.env.NODE_ENV === "TEST") {
      new ServerResponse("OTP sent successfully.").respond(res);
    }
  } catch (err) {
    next(err);
  }
};

const verify_otp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { otp, id } = req.body;
    const student = (await Student.findById(id))!;
    if (!student)
      return new ServerResponse("User entry deleted. Please create user again.")
        .statusCode(400)
        .success(false)
        .respond(res);
    const token = await Token.findOne({ student_id: student._id });
    if (!token)
      return new ServerResponse("No token formerly requested.")
        .statusCode(400)
        .success(false)
        .respond(res);
    if (!(await token.verify(otp.toString()))) {
      new ServerResponse("Wrong otp provided. Please try again.")
        .statusCode(400)
        .success(false)
        .respond(res);
      return token.deleteOne();
    } else if (await token.verify(otp.toString())) {
      new ServerResponse("Account verified.").respond(res);
      return token.deleteOne();
    }
    student.createdAt = student.updatedAt;
    await student.save();
    const auth_token = await student.generateToken();
    res.cookie("auth_token", auth_token, { httpOnly: true, maxAge: 6000 });
    new ServerResponse("Number verified.").respond(res);
  } catch (err) {
    next(err);
  }
};

const forgot_password = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone } = req.body;
    let student = await Student.findOne({ phone });
    if (!student) {
      return new ServerResponse("Account not found.")
        .statusCode(400)
        .success(false)
        .respond(res);
    }
    const token = await Token.findOne({ student_id: student._id });
    if (token) token!.deleteOne();
    const otp = generate_otp();
    await new Token({
      student_id: student._id,
      token: otp,
      createdAt: Date.now(),
    }).save();
    if (process.env.NODE_ENV === "PROD" || process.env.NODE_ENV === "DEV") {
      send_otp_sms(process.env.PLATFORM!, student.phone, otp)
        .then(async () => {
          await student!.save();
          new ServerResponse("OTP sent successfully.").respond(res);
        })
        .catch((e) => {
          new ServerResponse("Failed to send otp.")
            .statusCode(500)
            .success(false)
            .respond(res);
        });
    } else if (process.env.NODE_ENV === "TEST") {
      await student.save();
      new ServerResponse("OTP sent successfully.").data({ otp }).respond(res);
    }
  } catch (err) {
    next(err);
  }
};

export default {
  sign_up,
  request_otp,
  verify_otp,
  forgot_password,
};
