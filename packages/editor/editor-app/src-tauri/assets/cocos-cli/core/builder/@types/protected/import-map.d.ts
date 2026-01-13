export interface ImportMap {
    imports?: Record<string, string>;
    scopes?: Record<string, Record<string, string>>;
}
export type ImportMapWithImports = ImportMap & {
    imports: NonNullable<ImportMap['imports']>;
};
