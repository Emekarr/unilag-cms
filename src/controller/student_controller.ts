import { Request, Response } from "express";

import Student, { IStudent } from "../model/student";

const sign_up = async (req: Request, res: Response) => {
  try {
    const student_data: IStudent = req.body;
    const new_student = new Student(student_data);
    const student = await new_student.save();
    if (!student) throw new Error("Could not create student.");
    res.send("student created successfully.");
  } catch (e) {}
};

export default {
  sign_up,
};
