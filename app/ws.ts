var Phoenix = require('phoenix-js-derp');
import { Subject, Observable, Subscriber, Subscription } from '@reactivex/rxjs';
import { notify } from './rx_helpers';

// class Request {
//   constructor(
//     url = "/urls", body: string, headers = {}
//   ) {}
// }

export class WS {
  requests: {};
  id: number;
  ws: any;  //Phoenix.Socket
  chan: any;  //Phoenix.Channel
  _out: Observable<any>;

  constructor() {
  //constructor(url = "ws://127.0.0.1:8080/socket", chan_name = "rooms:lobby") {
    // url = "ws://127.0.0.1:8080/socket", chan_name = "rooms:lobby"
    // temporarily taking these out of the constructor as a temp workaround to TypeScript error NoAnnotationError...
    // why am I even getting this while the default values already imply the types?
    // http://www.typescriptlang.org/Handbook#functions-optional-and-default-parameters
    let url = "ws://127.0.0.1:8080/socket";
    let chan_name = "rooms:lobby";
    this.requests = {};
    this.id = 0;
    let logger = ((kind, msg, data) => { console.log(`${kind}: ${msg}`, data) });
    this.ws = new Phoenix.Socket(url, {logger: logger});
    this.ws.connect({});
    this.chan = this.ws.channel(chan_name, {user: "tycho"});
    this.chan.join();
    //this.chan.on("msg", this.handle_stored);
  }

  // taken from https://github.com/robwormald/aim/, example at TickerService.ts (also exposed `in` Observer).
  // should soon be made into a RxJS 5 compatible Subject at https://github.com/blesh/RxSocketSubject/
  get out(): Observable<any> {
    if(!this._out) {
      this._out = Observable.create(sub => {
        let chan = this.chan;
        chan.onClose(() => sub.complete());
        chan.onError(e => sub.error(e));
		    chan.on("msg", e => sub.next(e));
        //return () => {
        //  chan.leave();
        //  this._out = null;
        //};
      }).share();
    }
    return this._out;
  }

  ask_many = (url: string, pars: {}) => {
    let id = this.id++;
    this.chan.push(url, {body: pars, id: id});
    return this.out
      .filter(_ => _.id == id)
      .map(e => e['body']);
  }
  // ^ the server doesn't currently send complete events. Rx operators definitely affected by this:
  // Last, SkipLast, TakeLast, To(Array/Map/Set), Sum, Reduce, Min, Max, Count, Concat, IgnoreElements
  // Average, SequenceEqual, DefaultIfEmpty, (Contains), All, (Using), (TimeInterval), Do
  // solution: use one of the below overrides which use pre-existing question-answer knowledge to complete.
  // (trying this server-sided would suck too due to having to guarantee order of client reception.)

  // like ask, but able to complete in the knowledge there will be only one item.
  ask = (url: string, pars: {}, name = "dummy") => {
    return this.ask_n(1, url, pars, name);
  }

  // like ask, but able to complete in the knowledge there will be only n items.
  ask_n = (n, url: string, pars: {}, name = "dummy") => { //Function.caller
    let obs = this.ask_many(url, pars).take(n);
    notify(obs, name);
    return obs;
  }

}

export default WS