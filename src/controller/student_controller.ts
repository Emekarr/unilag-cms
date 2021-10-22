import { Request, Response, NextFunction } from "express";

import Student, { IStudent } from "../model/student";
import CustomError from "../utils/custom_error";
import ServerResponse from "../utils/response";
import generate_otp from "../utils/generate_otp";
import send_otp_sms from "../utils/send_otp_sms";

const sign_up = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student_data: IStudent = req.body;
    console.log(student_data)
    const new_student = new Student(student_data);
    const student = await new_student.save();
    if (!student) throw new CustomError("Could not create new entry.", 400);
    new ServerResponse("Student created successfully.")
      .data(student)
      .statusCode(200)
      .respond(res);
  } catch (err) {
    next(err);
  }
};

const request_otp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.body;
    const student = (await Student.findById(id))!;
    if(!student) 
          new ServerResponse("User entry deleted. Please create user again.")
            .statusCode(400)
            .success(false)
            .respond(res);
    const otp = generate_otp();
    student.otp = otp;
    if (process.env.NODE_ENV === "PROD" || process.env.NODE_ENV === "DEV") {
      send_otp_sms(process.env.PLATFORM!, student.phone, otp)
        .then(async () => {
          await student.save();
          new ServerResponse("OTP sent successfully.")
            .statusCode(200)
            .respond(res);
        })
        .catch((e) => {
          new ServerResponse("Failed to send otp.")
            .statusCode(500)
            .success(false)
            .respond(res);
        });
    } else if (process.env.NODE_ENV === "TEST") {
      await student.save();
      new ServerResponse("OTP sent successfully.").statusCode(200).respond(res);
    }
  } catch (err) {
    next(err);
  }
};

export default {
    sign_up,
    request_otp
};
