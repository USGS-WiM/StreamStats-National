import { Options } from './options';

export interface Steps {
    label: string;
    name: string;
    value: string;
    type: string;
    validators?: any;
    options?: Array<Options>;
    //required?: boolean;
}