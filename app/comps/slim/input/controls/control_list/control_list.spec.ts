import { inject, addProviders } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { ControlList, SchemaControlList } from './control_list';

describe('ControlList', () => {
  let a, fact;

  beforeEach(() => {
    fact = () => new FormControl(1);
    a = new ControlList().seed(fact);
  });

  // it('should test', () => {
  //   throw 'works'
  // })

  it('should support pushing', () => {
    a.add();
    expect(a.length).toEqual(1);
    expect(a.at(0).value).toEqual(1);  //can't use object equality for new instances
  });

});

describe('SchemaControlList', () => {
  let a;

  beforeEach(() => {
    let schema = { type: 'array', items: { type: 'integer', default: 1 } };
    a = new SchemaControlList(schema).init();
  });

  it('should support pushing', () => {
    a.add();
    expect(a.length).toEqual(1);
    expect(a.at(0).value).toEqual(1);
  });

});
