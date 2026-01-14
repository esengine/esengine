import { MissingReporter } from './missing-reporter';
export declare class MissingClassReporter extends MissingReporter {
    report(): void;
    reportByOwner(): void;
}
export declare const MissingClass: {
    reporter: MissingClassReporter;
    classFinder(id: any, owner?: any, propName?: any): any;
    hasMissingClass: boolean;
    reportMissingClass(asset: any): void;
    reset(): void;
};
