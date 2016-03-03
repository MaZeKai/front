let _ = require('lodash/fp');
import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from 'angular2/core';
import { mapComb, notify } from '../rx_helpers';
import { getPaths, arr2obj } from '../js';
import { Templates } from '../jade';
import { ValueComp } from './value';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';

let inputs = ['path$', 'val$', 'schema$', 'named'];

@Component({
  selector: 'myul',
  inputs: inputs,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: Templates.ng_ul_table,
  directives: [
    forwardRef(() => ValueComp),
  ]
})
export class ULComp implements OnInit {
  // @Input() named: boolean;
  // k: Observable<string>;
  // id: Observable<string>;
  // rows: Array<any>; //[{id, path, val, schema}]

  constructor(cdr: ChangeDetectorRef) {
    this.cdr = cdr;
  }

  ngOnDestroy() {
    this.cdr.detach();
  }

  ngOnInit() {
    let props = this.path$.map(p => getPaths(p));
    ['k', 'id'].forEach(x => this[x] = props.map(v => v[x]));  //, 'model'  //.pluck(x)
    //this.rows =
    mapComb(inputs.slice(0,3).map(k => this[k]),        //[this.path$, this.val$, this.schema$]
      (path, val, spec) => (_.isArray(val) ? val : []).map((v, idx) => {
        let path_k = path.concat(idx)
        let obj = { path: path_k, val: v, schema: _.get(['items'], spec) };
        // return obj;
        return _.mapValues(x => new BehaviorSubject(x), obj);
      })
    )
    .subscribe(x => {
      this.rows = x;
      this.cdr.markForCheck();
    });
  };

}

ULComp.parameters = [
  [ChangeDetectorRef],
]