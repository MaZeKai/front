/*
import {Component, ChangeDetectorRef} from 'angular2/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';
//import { Subject, Observable, Subscriber, Subscription } from '@reactivex/rxjs';
//import {Subject, Observable, Subscriber, Subscription} from '@reactivex/rxjs/dist/cjs/Rx';
//var Rx = require('@reactivex/rxjs/dist/cjs/Rx');
//var Rx = require('@reactivex/rxjs');
//global.Rx = Rx;
//import {Promise, ObservableWrapper, Observable, EventEmitter} from 'angular2/src/facade/async';
//, Observable
import {Observable} from 'rxjs/Observable';
//import 'rxjs/add/operators/map';

@Component({
  selector: 'dummy'
  directives: [CORE_DIRECTIVES, FORM_DIRECTIVES],
  //template: '<p>foo</p>'
  //template: require('./table.jade')
  template: require('../ng-output/ul.jade')
})
export default class Dummy {
  rows: any;
  cols: any;
  items: any;
  //constructor() {
  constructor(cdr: ChangeDetectorRef) {
    //let obs = toCurl("curl 'https://detailskip.taobao.com/json/sib.htm?itemId=521372858018&sellerId=1979798612&p=1&rcid=124484008&sts=404492288,1170936092094889988,72057594037960704,4503603924500483&chnl=pc&price=3000&shopId=&vd=1&skil=false&pf=1&al=false&ap=1&ss=0&free=0&defaultCityId=110100&st=1&ct=1&prior=1&ref=' -H 'dnt: 1' -H 'accept-encoding: gzip, deflate, sdch' -H 'accept-language: en-US,en;q=0.8,nl;q=0.6,ja;q=0.4,zh;q=0.2,zh-CN;q=0.2,zh-TW;q=0.2,de;q=0.2' -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2452.0 Safari/537.36' -H 'accept: */*' -H 'cache-control: max-age=0' -H 'cookie: cna=1N2yDDXQjjoCAXbBNqyT5owh; thw=cn; uc3=nk2=F4%2B0H36sEg%3D%3D&id2=VWZ2FrcUdSGe&vt3=F8dASMunk2BSL1gwtQQ%3D&lg2=WqG3DMC9VAQiUQ%3D%3D; hng=CN%7Czh-cn%7CCNY; lgc=tycho01; tracknick=tycho01; _cc_=UIHiLt3xSw%3D%3D; tg=0; ucn=center; v=0; mt=ci=-1_0; cookie2=1c394919b47e6111c6279b7ddadd35c8; t=f47b09a247a1f9d820c2952d24f0aed5; _tb_token_=ebbe336e3b73e; x=e%3D1%26p%3D*%26s%3D0%26c%3D0%26f%3D0%26g%3D0%26t%3D0%26__ll%3D-1%26_ato%3D0; uc1=cookie14=UoWzW98jWt%2F5oQ%3D%3D; isg=766D7D6644BB6A5AE37614EC2842F40F; l=AgQE-yl0rvSAeuw7zpWVQTiNVIz3XiiH' -H 'referer: https://item.taobao.com/item.htm?spm=a230r.1.14.51.VADz4n&id=521372858018&ns=1&abbucket=18' --compressed");
    //this.rows = obs;
    //let obs: Observable<{}> = Observable.create(function (obs) {
    ///*
    //this.rows = Observable.create((o) => {
    //o.next({a: 1, b: 2});
    //this.items = Observable.create((o) => {
    //  o.next("a");
    //  o.next("b");
    //  o.complete();
    //});
    //this.rows = [{a: 1, b: 2}];
    this.cols = ['a','b'];
    //this.items = ['a','b'];
    //this.items = Observable.from(['a','b']);
    this.items = Observable.fromArray(['a','b']);
    //obs.scan((acc, x) => set_add_many(acc, Object.keys(x)), new Set([]));
    setTimeout(() => { cdr.detectChanges(); }, 5000);
  }
}
*/
