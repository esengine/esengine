import { FntData } from '../../../@types/userDatas';
export interface ParsedObj {
    [key: string]: string | number;
}
declare class FntLoader {
    private readonly INFO_EXP;
    private readonly COMMON_EXP;
    private readonly PAGE_EXP;
    private readonly CHAR_EXP;
    private readonly KERNING_EXP;
    private readonly ITEM_EXP;
    private readonly NUM_EXP;
    private _parseStrToObj;
    /**
     * Parse Fnt string.
     * @param fntStr - FNT file content string
     * @returns Parsed font data
     */
    parseFnt(fntStr: string): FntData;
}
declare const _default: FntLoader;
export default _default;
