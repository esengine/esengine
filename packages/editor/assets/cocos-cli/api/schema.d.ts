import { z } from 'zod';
export declare const SchemaProjectPath: z.ZodString;
export type TProjectPath = z.infer<typeof SchemaProjectPath>;
export declare const SchemaPort: z.ZodOptional<z.ZodNumber>;
export type TPort = z.infer<typeof SchemaPort>;
export declare const SchemaProjectType: z.ZodEnum<["2d", "3d"]>;
export type TProjectType = z.infer<typeof SchemaProjectType>;
