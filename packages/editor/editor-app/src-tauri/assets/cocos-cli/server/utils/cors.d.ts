import { Request, Response, NextFunction } from 'express';
/**
 * 手动设置 CORS 头
 * @param req
 * @param res
 * @param next
 */
export declare function cors(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
