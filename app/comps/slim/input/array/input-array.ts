let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES } from '@angular/common';
import { FieldComp } from '../field/input-field';
import { getPaths } from '../../slim';


@Component({
  selector: 'input-array',
  inputs: ['named', 'path', 'spec', 'ctrl'],  //ctrl is expected to be a ControlList seeded with a Control
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: require('./input-array.jade'),
  directives: [
    COMMON_DIRECTIVES, FORM_DIRECTIVES,
    forwardRef(() => FieldComp),
  ]
})
export class InputArrayComp {
  option = null;
  k: string;
  id: string;
  counter = 0;
  items = new Set([]);

  ngOnInit() {
    let props = getPaths(this.path);
    ['k', 'id'].forEach(x => this[x] = props[x]);
    // FieldComp's
    // I could ditch this whole items/counter crap and just iterate over ctrl.controls if I no longer insist id's with unique paths
    // reason I'm not just passing the index instead is that I don't wanna trigger change detection every time item 1 is deleted and all the indices shift.
  }

  get spec() {
    return this._spec;
  }
  set spec(x) {
    if(_.isUndefined(x)) return;
    this._spec = x;
    this.indexBased = _.isArray(_.get(['items'], x));
    this.inAdditional = _.has(['additionalItems', 'oneOf'], x);
    this.isOneOf = this.inAdditional || _.has(['items', 'oneOf'], x);
    // window.setTimeout(() => $('select').material_select(), 300);
  }

  getSpec(idx) {
    let spec = this.spec;
    return this.indexBased ? (_.get(['items', idx], spec) || spec.additionalItems) : _.get(['items'], spec);
  }

  resolveSpec(idx) {
    let opt = this.option;
    let spec = this.getSpec(idx);
    return !this.isOneOf ? spec : spec.oneOf[opt];
  }

  add() {
    this.items.add(this.counter++);
    this.ctrl.add();
  }

  remove(item, i) {
    let idx = _.findIndex(y => y == item)(Array.from(this.items));
    this.ctrl.removeAt(idx);
    this.items.delete(item);
  }

}