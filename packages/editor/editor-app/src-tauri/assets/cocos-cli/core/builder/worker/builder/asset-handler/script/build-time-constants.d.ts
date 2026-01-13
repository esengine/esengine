import { StatsQuery } from '@cocos/ccbuild';
import ConstantManager = StatsQuery.ConstantManager;
type PlatformType = ConstantManager.PlatformType;
type BuildTimeConstants = ConstantManager.BuildTimeConstants;
type CCEnvConstants = ConstantManager.CCEnvConstants;
type IBuildTimeConstantValue = StatsQuery.ConstantManager.ValueType;
export { BuildTimeConstants, CCEnvConstants };
interface BuildConstantsOption {
    platform: PlatformType | string;
    flags: Record<string, IBuildTimeConstantValue>;
}
export declare function getCCEnvConstants(options: BuildConstantsOption, engineRoot: string): Promise<ConstantManager.CCEnvConstants>;
