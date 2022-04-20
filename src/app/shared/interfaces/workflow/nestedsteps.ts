import { Options } from './options';

export interface NestedSteps {
    label: string;
    name: string;
    value: string;
    type: string;
    validators?: any;
    options?: Array<Options>;
}