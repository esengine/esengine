
export interface Vec2 {
    x: number;
    y: number;
}

export interface Vec3 {
    x: number;
    y: number;
    z: number;
}

export interface Vec4 {
    x: number;
    y: number;
    z: number;
    w: number;
}

export interface Mat4 {
    m00: number;
    m01: number;
    m02: number;
    m03: number;

    m04: number;
    m05: number;
    m06: number;
    m07: number;

    m08: number;
    m09: number;
    m10: number;
    m11: number;

    m12: number;
    m13: number;
    m14: number;
    m15: number;
}

export type IPropertyValueType = IProperty | IProperty[] | null | undefined | number | boolean | string | Vec4 | Vec3 | Vec2 | Mat4 | any | Array<unknown>

export interface IProperty {
    value: { [key: string]: IPropertyValueType } | IPropertyValueType;
    type?: string;
    readonly?: boolean;
    name?: string;
    path?: string; // 数据的搜索路径，这个是由使用方填充的
    isArray?: boolean;
    userData?: { [key: string]: any }; // 用户透传的数据
}