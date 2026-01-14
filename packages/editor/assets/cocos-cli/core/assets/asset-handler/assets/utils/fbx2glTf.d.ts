/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 */
/**
 * Converts an FBX to a GTLF or GLB file.
 * @param string srcFile path to the source file.
 * @param string destFile path to the destination file.
 * This must end in `.glb` or `.gltf` (case matters).
 * @param string[] [opts] options to pass to the converter tool.
 * @return Promise<string> a promise that yields the full path to the converted
 * file, an error on conversion failure.
 */
export declare function convert(srcFile: string, destFile: string, opts?: string[]): Promise<unknown>;
