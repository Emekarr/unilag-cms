declare namespace Express {
  interface Request {
    id: string;
    is_admin: boolean;
    file: any;
  }
}
