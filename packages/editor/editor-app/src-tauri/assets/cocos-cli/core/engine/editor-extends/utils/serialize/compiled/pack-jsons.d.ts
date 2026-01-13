import { deserialize } from 'cc';
import D = deserialize.Internal;
type IFileData = D.IFileData_;
type IPackedFileData = D.IPackedFileData_;
export default function packJSONs(datas: IFileData[]): IPackedFileData;
export {};
