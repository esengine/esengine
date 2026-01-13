import type * as babel from '@babel/core';
declare function $({ types }: typeof babel, options: $.Options): babel.PluginObj;
declare namespace $ {
    interface Options {
        name: string;
    }
}
export default $;
