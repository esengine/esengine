export declare class ObjectWalkerBehavior {
    walk(obj: Record<string, any>, key: string, val: any): void;
    root: any;
    constructor(root: any);
    parseObject(val: any): void;
    parseCCClass(val: any, klass: any, props: any): void;
    forIn(val: any): void;
    forEach(val: any): void;
}
export declare class ObjectWalker extends ObjectWalkerBehavior {
    iteratee: any;
    parsedObjects: any;
    parsedKeys: any;
    ignoreParent: any;
    ignoreSubPrefabHelper: any;
    walked: Set<unknown>;
    constructor(root: any, iteratee: any, options?: any);
    walk(obj: any, key: any, val: any): void;
}
/**
 * Traverse all objects recursively
 * @param {Object} root
 * @param {Function} iteratee
 * @param {Object} iteratee.object
 * @param {String} iteratee.property
 * @param {Object} iteratee.value - per object will be navigated ONLY once in this parameter
 * @param {Object[]} iteratee.parsedObjects - parsed object path, NOT contains the "object" parameter
 */
export declare function walk(root: any, iteratee: any): void;
/**
 * Traverse all object's properties recursively
 * @param {Object}   root
 * @param {Function} iteratee
 * @param {Object}     iteratee.object
 * @param {String}     iteratee.property - per object property will be navigated ONLY once in this parameter
 * @param {Object}     iteratee.value - per object may be navigated MORE than once in this parameter
 * @param {Object[]}   iteratee.parsedObjects - parsed object path, NOT contains the "object" parameter
 * @param {Object}   [options]
 * @param {Boolean}    [options.dontSkipNull = false]
 */
export declare function walkProperties(root: any, iteratee: any, options: any): void;
export declare function getNextProperty(parsedObjects: any, parsingObject: any, object: any): string;
