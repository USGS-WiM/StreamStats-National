// Interface for the externally referenced config file holding URLs

export interface Config {
    workflowsURL: string;
    nldiBaseURL: string;
    nldiSplitCatchmentURL: string;
    GageStatsServices: string;
    NSSServices: string;
    GridQueryService: string;
    baseLayers: [{
        name: string,
        url: string,
        attribution:string,
        visible: boolean,
        maxZoom: number
    }];
    workflowLayers: [];
    overlays: [];
    parameters: [{
        fcpg_parameter: string,
        description: string,
        multiplier: number,
        units: string,
        value: number
    }]
}