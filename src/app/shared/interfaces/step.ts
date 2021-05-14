import { Option } from './option';

export interface Step {
    title: string;
    valueType: string;
    options: Array<Option>;
    value: string;
    required?: boolean;
}