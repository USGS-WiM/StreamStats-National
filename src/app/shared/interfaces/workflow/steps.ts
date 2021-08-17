import { Options } from './options';

export interface Steps {
    stepId: number;
    title: string;
    valueType: string;
    description: string;
    options: Array<Options>;
    value: string;
    required?: boolean;
}