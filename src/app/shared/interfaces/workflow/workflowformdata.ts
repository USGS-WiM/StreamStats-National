interface WorkflowFormValidators {
    min?: number;
    max?: number;
    required?: boolean;
    requiredTrue?: boolean;
    email?: boolean;
    minLength?: boolean;
    maxLength?: boolean;
    pattern?: string;
    nullValidator?: boolean;
  }
  interface WorkflowFormControlOptions {
    min?: string;
    max?: string;
    step?: string;
    icon?: string;
  }
  interface WorkflowFormControls {
    name: string;
    label: string;
    value: string;
    type: string;
    options?: WorkflowFormControlOptions;
    required: boolean;
    validators: WorkflowFormValidators;
  }
  export interface WorkflowFormData {
    controls: WorkflowFormControls[];
  }