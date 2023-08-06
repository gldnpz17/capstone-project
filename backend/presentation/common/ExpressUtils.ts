import { RequestHandler } from "express";

const wrapAsyncHandler = (handle: RequestHandler) => (req: any, res: any, next: any) => {
  return Promise
    .resolve(handle(req, res, next))
    .catch(next);
}

export { wrapAsyncHandler }