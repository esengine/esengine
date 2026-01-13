/**
 * Project type
 * - '2d': 2D Project
 * - '3d': 3D Project
 */
export type ProjectType = '2d' | '3d';

/**
 * Project creator information
 */
export interface ProjectCreatorInfo {
    /**
     * Version of the tool or engine used to create the project
     */
    version: string;

    /**
     * Dependencies of the project
     * - key: package name
     * - value: version number
     */
    dependencies?: {
        [name: string]: string,
    };

    /**
     * Registry configuration for package management
     */
    registry?: {
        /**
         * Remote repository configuration (e.g., npm, private registry)
         */
        remote?: {};
    };
}

/**
 * Project information
 */
export interface ProjectInfo {
    /**
     * Project name
     */
    name: string;

    /**
     * Project type ('2d' or '3d')
     */
    type: ProjectType;

    /**
     * Project version
     */
    version: string;

    /**
     * Unique identifier (UUID) of the project
     */
    uuid: string;

    /**
     * Information about the creator of the project
     */
    creator: ProjectCreatorInfo;

    /**
     * Other additional properties (flexible extension)
     */
    [key: string]: any;
}
