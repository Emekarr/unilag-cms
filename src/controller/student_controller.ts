import { Request, Response, NextFunction } from "express";

import Student, { IStudent } from "../model/student";
import CustomError from "../utils/custom_error.js";
import ServerResponse from "../utils/response.js";

const sign_up = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student_data: IStudent = req.body;
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

export default {
  sign_up,
};
