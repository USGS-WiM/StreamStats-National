import { Options } from './options';

export interface NestedSteps {
    label: string;
    name: string;
    description: string;
    value: string;
    type: string;
    validators?: any;
    options?: Array<Options>;
}