/**
 * bin package格式说明.
|PACK_BIN_TYPE - 4bytes|
|VERSION - 4bytes|
|FILES_COUNT - 4bytes|
|FILE_1_OFFSET - 4bytes|
|FILE_1_SIZE - 4bytes|
|FILE_2_OFFSET - 4bytes|
|FILE_2_SIZE - 4bytes|
...
|FILE_N_OFFSET - 4bytes|
|FILE_N_SIZE - 4bytes|
|PACKED_BIN|
 */
export declare function binPackagePack(arrayBuffers: ArrayBuffer[]): ArrayBuffer;
