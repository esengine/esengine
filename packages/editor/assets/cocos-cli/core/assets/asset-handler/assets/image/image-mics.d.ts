export declare function convertTGA(data: Buffer): Promise<{
    extName: string;
    data: Buffer;
}>;
export declare function convertImageToHDR(file: string, uuid: string, temp: string): Promise<{
    extName: string;
    source: string;
}>;
export declare function convertPSD(data: Buffer): Promise<{
    extName: string;
    data: Buffer;
}>;
export declare function convertTIFF(file: string): Promise<{
    extName: string;
    data: Buffer;
}>;
export declare function convertHDROrEXR(extName: string, source: string, uuid: string, temp: string): Promise<{
    extName: string;
    source: string;
} | undefined>;
export declare function convertHDR(source: string, uuid: string, temp: string): Promise<{
    extName: string;
    source: string;
}>;
export declare function convertWithCmft(file: string, dist: string, version?: string): Promise<{
    extName: string;
    source: string;
}>;
