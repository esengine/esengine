import { MissingReporter } from './missing-reporter';
export declare class MissingObjectReporter extends MissingReporter {
    doReport(obj: any, value: any, parsedObjects: any, rootUrl: any, inRootBriefLocation: any): void;
    report(): void;
    reportByOwner(): void;
}
