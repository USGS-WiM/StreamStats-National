// Interface for the externally referenced config file holding URLs

export interface Config {
    workflowsURL: string;
    nldiBaseURL: string;
    nldiSplitCatchmentURL: string;
    GageStatsServices: string;
    GageStatsServicesBounds: string;
    baseLayers: [];
}