import { Option } from './option';

export interface Steps {
    title: string;
    valueType: string;
    options: Array<Option>;
    value: string;
    required?: boolean;
}