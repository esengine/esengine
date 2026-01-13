import { IBuildTaskOption, IBuildSceneItem } from '../public';
export interface IExportBuildOptions extends IBuildTaskOption {
    __version__: string;
}
export interface IInternalBuildSceneItem extends IBuildSceneItem {
    bundle: string;
    missing?: boolean;
}
