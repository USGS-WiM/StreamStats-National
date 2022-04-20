import { NestedSteps } from "./nestedsteps";

export interface Options {
    text: string;
    selected: boolean;
    nestedSteps?: Array<NestedSteps>;
}