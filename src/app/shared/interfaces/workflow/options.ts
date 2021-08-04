import { Output } from "./output";
import { Steps } from "./steps";

export interface Options {
    title: string;
    description: string;
    icon: string;
    steps: Array<Steps>;
    output: Array<Output>;
}