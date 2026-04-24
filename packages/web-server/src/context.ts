import type { Request, Response } from "express";

export interface Context {
  req: Request;
  res: Response;
}

export function createContext({ req, res }: { req: Request; res: Response }): Context {
  return { req, res };
}
