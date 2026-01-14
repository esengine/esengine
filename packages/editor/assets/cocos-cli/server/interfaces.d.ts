import { Request, Response, NextFunction } from 'express';
export interface IGetPostConfig {
    url: string | RegExp;
    handler: (req: Request, res: Response, next?: NextFunction) => Promise<void>;
}
export interface IStaticFileConfig {
    url: string;
    path: string;
}
export interface ISocketConfig {
    connection: (socket: any) => void;
    disconnect: (socket: any) => void;
}
export interface IMiddlewareContribution {
    get?: IGetPostConfig[];
    post?: IGetPostConfig[];
    staticFiles?: IStaticFileConfig[];
    socket?: ISocketConfig;
}
