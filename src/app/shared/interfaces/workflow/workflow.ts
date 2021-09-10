import { Output } from './output';
import { Steps } from './steps';

export interface Workflow {
    title: string;
    description: string;
    functionality: string;
    icon: string;
    steps: Steps[];
    output: Array<Output>;
    isSelected?: boolean
}