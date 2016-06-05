let _ = require('lodash/fp');
import { ControlGroup, Validators, AbstractControl } from '@angular/common';
import { ValidatorFn } from '@angular/common/src/forms/directives/validators';
import { ControlObject } from './control_object';
import { uniqueKeys, inputControl, getOptsNameSchemas } from '../input';
import { mapBoth, editValsLambda } from '../../../lib/js';

// can curry but meh
let lens = (fn_obj, fn_grp) => (ctrl) => {
  let { properties: prop, patternProperties: patt, additionalProperties: add } = ctrl.controls;
  return _.flatten([
    fn_grp(prop.value),
    Object.values(patt.controls).map(y => y.controls.map(fn_obj)),
    add.controls.map(fn_obj),
  ]);
};

export class ControlStruct extends ControlGroup {
  factStruct: Front.IObjectSchema<number>;
  mapping: {[key: string]: AbstractControl};
  initialized: boolean;

  constructor(vldtr: ValidatorFn = null) {
    // factStruct: { properties: { foo: fact }, patternProperties: { patt: fact }, additionalProperties: fact }
    // KvPair: ControlGroup<k,v>
    // this: ControlGroup< properties: ControlGroup<v>, patternProperties: ControlGroup<ControlObject<KvPair>>, additionalProperties: ControlObject<KvPair> >

    let validator = Validators.compose([
      uniqueKeys(lens(y => y.value.name, _.keys)),
      vldtr,
    ]);

    let controls = {
      properties: new ControlGroup({}),
      patternProperties: new ControlGroup({}),
      additionalProperties: new ControlObject(),
    };
    super(controls, {}, validator);
    this.mapping = {};
    this.initialized = false;
  }

  init(
    factStruct: Front.IObjectSchema<Front.CtrlFactory>,
    required: string[] = [],
  ): ControlStruct {
    if(this.initialized) throw 'ControlStruct already initialized!';

    // could also make post-add names uneditable, in which case replace `ControlObject<kv>` with `ControlGroup`
    let { nameSchemaPatt, nameSchemaAdd } = getOptsNameSchemas(factStruct);
    // nameSchema actually depends too, see input-object.
    let kvFactory = (nameSchema, ctrlFactory) => () => new ControlGroup({
      name: inputControl(nameSchema),
      val: ctrlFactory(),
    });

    let controls = editValsLambda({
      properties: v => new ControlGroup(_.mapValues(y => y())(v)),  //_.pick(required)(v)
      patternProperties: v => new ControlGroup(mapBoth(v || {},
        (fact, patt) => new ControlObject().init(kvFactory(nameSchemaPatt[patt], fact))
      )),
      additionalProperties: v => new ControlObject().init(kvFactory(nameSchemaAdd, v)),
    })(factStruct);

    _.each((ctrl, k) => {
      this.removeControl(k);
      this.addControl(k, ctrl);
    })(controls);

    this._updateValue();
    this.factStruct = factStruct;
    this.mapping = _.clone(controls.properties.controls);
    this.initialized = true;
    return this;
  }

  _updateValue(): void {
    let { properties: prop, patternProperties: patt, additionalProperties: add } = this.controls;
    // this._value = _.assign(prop.value, ...Object.values(patt.value), add.value); // FP only does two args
    this._value = Object.assign({}, prop.value, ...Object.values(patt.value), add.value);
  }

  addProperty(k: string): void {
    let ctrl = this.factStruct.properties[k]();
    this.controls.properties.addControl(k, ctrl);
    this.controls.properties._updateValue();
    this._updateValue();
    this.add(k, ctrl);
  }

  removeProperty(k: string): void {
    this.controls.properties.removeControl(k);
    this.controls.properties._updateValue();
    this._updateValue();
    this.remove(k);
  }

  addPatternProperty(patt: string, k: string): void {
    let ctrl = this.controls.patternProperties.controls[patt].add();
    ctrl.controls.name.updateValue(k);
    this.add(k, ctrl.controls.val);
  }

  removePatternProperty(patt: string, i: number): void {
    let pattCtrl = this.controls.patternProperties.controls[patt];
    let name = pattCtrl.at(i).controls.name.value;
    pattCtrl.removeAt(i);
    this.remove(name);
  }

  addAdditionalProperty(k: string): void {
    let ctrl = this.controls.additionalProperties.add();
    ctrl.controls.name.updateValue(k);
    this.add(k, ctrl.controls.val);
  }

  removeAdditionalProperty(i: number): void {
    let addCtrl = this.controls.additionalProperties;
    let name = addCtrl.at(i).controls.name.value;
    addCtrl.removeAt(i);
    this.remove(name);
  }

  add(k: string, v: any): void {
    this.mapping = _.set([k], v)(this.mapping);
  }

  remove(k: string): void {
    this.mapping = _.omit([k])(this.mapping);
  }

  byName(k: string): AbstractControl {
    return this.mapping[k];
  }

}
