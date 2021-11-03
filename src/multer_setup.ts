import multer from "multer";

import CustomError from "./utils/custom_error";

export default multer({
  limits: {
    fieldSize: 5000000,
  },
  fileFilter(req, file, cb) {
    try {
      if (
        !file.originalname.endsWith(".jpg") &&
        !file.originalname.endsWith(".png")
      ) {
        cb(new CustomError("Unsupported file fomart passed", 400));
      }

      cb(undefined, true);
    } catch (err) {
      console.log(err);
    }
  },
});
