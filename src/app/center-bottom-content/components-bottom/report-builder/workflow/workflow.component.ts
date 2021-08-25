import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { crossFieldValidator, forbiddenTextValidator } from 'src/app/shared/directives/validators.directive';
import { Steps } from 'src/app/shared/interfaces/workflow/steps';
import { Workflow } from 'src/app/shared/interfaces/workflow/workflow';
import { WorkflowFormData } from 'src/app/shared/interfaces/workflow/workflowformdata';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {
  // component communication between center bottom and workflow component 
  @Input() workflow!: Workflow;

  //public workflowForm: FormGroup;
  public workflowForm: FormGroup = this._fb.group({});
  public registrationForm: FormGroup;
  public testForm: FormGroup;

  // registrationForm = new FormGroup({
  //   userName: new FormControl(),
  //   password: new FormControl(),
  //   confirmPassword: new FormControl(),
  //   address: new FormGroup({
  //     city: new FormControl(),
  //     state: new FormControl(),
  //     zip: new FormControl()
  //   })
  // })

  constructor(private _fb: FormBuilder) {
    this.registrationForm = this._fb.group({
      userName: [null, [ Validators.required, forbiddenTextValidator(/admin/)] ],
      email: [],
      subscribe: [false],
      password: [null, [ Validators.required, Validators.minLength(3)] ],
      confirmPassword: [],
      address: this._fb.group({
        city: [],
        state: [],
        zip: []
      }),
      alternateEmails: this._fb.array([])
    }, 
    {
      validator: crossFieldValidator
    });

    this.testForm = this._fb.group({
      steps: this._fb.array([this._fb.control('')]),
      output: this._fb.array([])
    })

    // this.workflowForm = this._fb.group({
    //   steps: this._fb.group({
    //     label: [this.workflow.steps],
    //     name: [],
    //     value: [],
    //     type: [],
    //     options: []
    //   })
    // })

    // this.workflowForm.addControl(this.workflow.steps, this._fb.array([]))

   }



  ngOnInit(): void {

    // this.registrationForm.get('subscribe')?.valueChanges.subscribe(checkedValue => {
    //   const email = this.registrationForm.get('email');
    //   if (checkedValue) {
    //     email?.setValidators(Validators.required);
    //   } else {
    //     email?.clearValidators();
    //   }
    //   email?.updateValueAndValidity();
    // });

    this.createWorkflowForm(this.workflow.steps)


  }

  // loadData() {
  //   this.registrationForm.patchValue({
  //     userName: 'bruce',
  //     password: 'test',
  //     confirmPassword: 'test'
  //   });
  // }


  // TODO - use this for multiple selection points??

  // get alternateEmails() {
  //   return this.registrationForm.get('alternateEmails') as FormArray;
  // }

  get steps() {
    return this.testForm.get('steps') as FormArray;
  }
  addSteps(array: Steps[]) {
    for (let step of array) {
      //this.steps.push(step)
    }
    //this.steps.push(this.workflow.steps);
  }
  addVariable() {
    const control = <FormArray>this.testForm.get('steps');
    control.push(this._fb.group({
      label: [],
      name: [],
      value: [],
      type: [],
      options: [],
    }));
}

  // addAlternateEmail() {
  //   this.alternateEmails.push(this._fb.control(''));
  // }

  createWorkflowForm(controls: Steps[]) {
    for (const control of controls) {
      this.workflowForm.addControl(control.name, this._fb.control(''))
    }
    console.log(this.workflowForm)
    console.log(this.workflow.steps[0].options)
  }


}
