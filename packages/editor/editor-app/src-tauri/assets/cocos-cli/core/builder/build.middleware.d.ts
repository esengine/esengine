import type { IMiddlewareContribution } from '../../server/interfaces';
export declare function registerBuildPath(platform: string, name: string, dest: string): void;
export declare function getBuildPath(platform: string, name: string): string;
export declare function getBuildUrlPath(dest: string): string;
declare const _default: IMiddlewareContribution;
export default _default;
