let _ = require('lodash/fp');
import { Input, forwardRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ControlPolyable } from '../controls/control_polyable';
import { InputValueComp } from '../value/input-value';
import { BaseInputComp } from '../base_input_comp';
import { ExtComp } from '../../../lib/annotations';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';

type Ctrl = SchemaControlPolyable;

@ExtComp({
  selector: 'input-polyable',
  template: require('./input-polyable.pug'),
  directives: [
    forwardRef(() => InputValueComp),
  ],
})
export class InputPolyableComp extends BaseInputComp {
  @Input() path: Front.Path = [];
  @Input() schema: Front.Schema;
  @Input() @BooleanFieldValue() named: boolean = false;
  @Input() ctrl: Ctrl;

  // @ViewChild('single') single: InputValueComp;
  // @ViewChild('multi') multi: InputValueComp;

  rand_id: string = 'polyable_' + Math.floor(Math.random() * 100000);
}
