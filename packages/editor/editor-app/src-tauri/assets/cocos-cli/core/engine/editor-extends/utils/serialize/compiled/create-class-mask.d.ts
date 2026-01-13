import { deserialize } from 'cc';
import D = deserialize.Internal;
type IClass = D.IClass_;
type IMask = D.IMask_;
import { ClassNode, CustomClassNode } from './types';
export default function (classNodes: (ClassNode | CustomClassNode)[]): {
    sharedClasses: (IClass | string)[];
    sharedMasks: IMask[];
};
export {};
