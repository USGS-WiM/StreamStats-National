// Interface for the externally referenced config file holding URLs

import { StringMap } from "@angular/compiler/src/compiler_facade_interface";

export interface Config {
    workflowsURL: string;
    nldiBaseURL: string;
    nldiSplitCatchmentURL: string;
    GageStatsServices: string;
    GageStatsServicesBounds: string;
    baseLayers: [{
        name: string,
        url: string,
        attribution:string,
        visible: boolean,
        maxZoom: number
    }];
    workflowLayers: [];
    overlays: [];
}