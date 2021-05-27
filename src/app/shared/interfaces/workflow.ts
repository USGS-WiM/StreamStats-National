import { Step } from './step';
import { Output } from './output';

export interface Workflow {
    title: string;
    description: string;
    icon: string;
    steps: Array<Step>;
    output: Array<Output>;
    isSelected?: boolean
}