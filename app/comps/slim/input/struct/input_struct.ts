let _ = require('lodash/fp');
import { Input, forwardRef, ChangeDetectorRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { FieldComp } from '../field/input_field';
import { InputValueComp } from '../value/input_value';
import { arr2obj, findIndexSet, tryLog } from '../../../lib/js';
import { try_log, fallback, getter, setter } from '../../../lib/decorators';
import { inputControl, getOptsNameSchemas, mapSchema, setRequired } from '../input';
import { SchemaControlStruct } from '../controls';
import { BaseInputComp } from '../base_input_comp';
import { ExtComp } from '../../../lib/annotations';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';
import { DynamicAttrs, AppliesDirective } from '../../../lib/directives';
import { GlobalsService } from '../../../services';
import { valErrors, VAL_MSG_KEYS, relevantValidators } from '../validators';

type Ctrl = SchemaControlStruct;

@ExtComp({
  selector: 'input-struct',
  template: require('./input_struct.pug'),
  directives: [
    forwardRef(() => FieldComp),
    forwardRef(() => InputValueComp),
    DynamicAttrs,
    AppliesDirective,
  ],
})
export class InputStructComp extends BaseInputComp {
  @Input() @BooleanFieldValue() named: boolean = false;
  @Input() ctrl: Ctrl;
  @Input() schema: Front.Schema;
  option = null;
  // keys = ['name', 'val'];
  nameSchemaFixed: Front.Schema;
  nameSchemaFixedFiltered: Front.Schema = {};
  isOneOf: boolean;
  hasFixed: boolean;
  hasPatts: boolean;
  hasAdd: boolean;
  nameCtrlFixed: AbstractControl;

  constructor(
    // BaseComp
    public cdr: ChangeDetectorRef,
    public g: GlobalsService,
  ) {
    super();
  }

  @try_log()
  setSchema(x: Front.Schema): void {
    let schema = this._schema = setRequired(x);
    let { properties: props = {}, patternProperties: patts = {}, additionalProperties: add } = schema;  //, required: req = []
    this.isOneOf = _.has(['oneOf'], add);
    [this.hasFixed, this.hasPatts, this.hasAdd] = [props, patts, add].map(_.size);
    // { addSugg: this.addSugg, pattSugg: this.pattSugg, addEnum: this.addEnum, pattEnum: this.pattEnum, nameSchemaFixed: this.nameSchemaFixed, nameSchemaPatt: this.nameSchemaPatt, nameSchemaAdd: this.nameSchemaAdd } = getOptsNameSchemas(x);
    // Object.assign(this, getOptsNameSchemas(schema));
    _.forEach((v, k) => { this[k] = v; })(getOptsNameSchemas(schema));
    this.nameCtrlFixed = inputControl(this.nameSchemaFixed, this.ctrl.path.concat('nameCtrlFixed'));
    this.updateFixedList();
    this.validator_keys = relevantValidators(schema, VAL_MSG_KEYS).concat('uniqueKeys');
    this.validator_msgs = arr2obj(this.validator_keys, k => valErrors[k](schema[k]));
  }

  @fallback({})
  schemaFixed(item: string): Front.Schema {
    return _.set(['name'], item)(this.schema.properties[item]);
  }

  @fallback({})
  schemaPatt(patt: string, i: number): Front.Schema {
    let name = this.ctrl.patternProperties.controls[patt].at(i).controls.name.value;
    return _.set(['name'], name)(this.schema.patternProperties[patt]);
  }

  @fallback({})
  schemaAdd(i: number): Front.Schema {
    let name = this.ctrl.controls.additionalProperties.at(i).controls.name.value;
    let add = this.schema.additionalProperties;
    return this.isOneOf ? add.oneOf[this.option] : add;
  }

  @try_log()
  addProperty(k: string): void {
    if(this.nameSchemaFixedFiltered.enum.includes(k)) {
      this.ctrl.addProperty(k);
      // if no intentions to add reordering I could've just iterated over `_.keys(this.ctrl.controls.properties.controls)`
      this.nameCtrlFixed.updateValue('');
      this.updateFixedList();
    } else {
      console.warn(`invalid property: ${k}`);
    }
  }

  @try_log()
  removeProperty(k: string): void {
    this.ctrl.removeProperty(k);
    this.updateFixedList();
  }

  // update the list of keys to pick new fixed properties from
  @try_log()
  updateFixedList(): void {
    this.nameSchemaFixedFiltered = _.update('enum',
      arr => _.difference(arr, Array.from(this.ctrl.indices.properties))
    )(this.nameSchemaFixed);
  }

  @try_log()
  addPatternProperty(patt: string, k = ''): void {
    this.ctrl.addPatternProperty(patt, k);
  }

  @try_log()
  removePatternProperty(patt: string, item: string): void {
    this.ctrl.removePatternPropertyByName(patt, item);
  }

  @try_log()
  addAdditionalProperty(k = ''): void {
    this.ctrl.addAdditionalProperty(k);
  }

  @try_log()
  removeAdditionalProperty(item: string): void {
    this.ctrl.removeAdditionalPropertyByName(item);
  }

  // customTrackBy(index: number, item: any): any {
  //   console.log('customTrackBy', index, item);
  //   return index;
  // }

}
