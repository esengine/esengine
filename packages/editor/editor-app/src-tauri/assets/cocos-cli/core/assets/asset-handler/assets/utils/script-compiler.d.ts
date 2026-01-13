export declare function transformPluginScript(code: string, options: transformPluginScript.Options): Promise<{
    code: string;
}>;
export declare namespace transformPluginScript {
    interface Options {
        simulateGlobals: string[];
        hideCommonJs: boolean;
        hideAmd: boolean;
    }
}
