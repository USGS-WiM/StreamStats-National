import { Option } from './option';

export interface Steps {
    label: string;
    name: string;
    value: string;
    type: string;
    validators?: any;
    options: Array<Option>;
    //required?: boolean;
}