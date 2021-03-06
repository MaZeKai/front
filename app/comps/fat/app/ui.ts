import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toPromise';
let _ = require('lodash/fp');
import { toast, tryLog, findTables } from '../../lib/js';
import { getSchema } from '../../lib/schema';
// import { elemToArr } from '../../lib/rx_helpers';
let $RefParser = require('json-schema-ref-parser');
import { parse } from '../../lib/parsing';

export let loadUi = tryLog(async function(name: string) {
  this.api = name;

  let api = await (
    this._http
    .get(`./openapi/${name}.json`)
    // .map(x => {
    //     let esc = _.escapeRegExp("http://json-schema.org/draft-04/schema");
    //     return x._body.replace(new RegExp(esc, 'g'), "/openapi/schema.json");
    // })
    .map(x => JSON.parse(x._body))
    .mergeMap((api) => $RefParser.dereference(api))
    // ^ replaces a `$ref`'s host object with the destination, i.e. no merging
    .toPromise()
  )

  let sec_defs = api.securityDefinitions;
  let oauth_sec = _.keys(sec_defs).find((k) => sec_defs[k].type == 'oauth2');
  let oauth_info = sec_defs[oauth_sec];
  let scopes = _.keys(oauth_info.scopes);
  let auth = this.auths[name];

  this.auth_ui_name = name;
  this.auth_ui_scopes = scopes;
  this.auth_ui_have = _.get(['scopes_have'], auth) || [];
  this.auth_ui_oauth_info = oauth_info;

  let token = _.get(['token'])(auth);
  this.input_ui_token = token;
  this.spec = api;
  this.fn_ui_oauth_sec = oauth_sec;
  this.fn_ui_have = _.get(['scopes_have'])(auth);

  global.$('.collapsible#fn-list').collapsible();
  // spawn_n(() => {
  //   global.$('.tooltipped').tooltip({delay: 0});
  // }, 3);

})

// handle emit fn_ui: picked a function, clear json and load fn inputs
export let pickFn = tryLog(function(fn_path: Front.FnPath) {
  this.raw = [];
  // this.input_ui.fn_path = fn_path;
  this.fn_path = fn_path;
  this.path = ['paths', ...fn_path, 'responses', '200'];
});

// handle the meat/schema/Rx/logging boilerplate for submission requests
function submitReq(fn: Front.Submitter): Front.Submitter {
  return tryLog(function(v: any) {
    // if(v instanceof Event) return;
    // toast.info(`request: ${JSON.stringify(v)}`);
    let { obs, start='request', next='response', done='request completed' } = fn.call(this, v);
    toast.info(start);
    this.schema = {};
    // ^ Should trigger inference. What about for APIs? For those I should have specs.
    this.raw = []; // array to concat to
    // ^ forcing everything into an array is great for the purpose of making results combineable,
    // whether they were originally arrays or not, but could make for terrible use of screen space...
    // under what circumstances should I go with this approach? expected responses n > 1.
    // ... distinguish with Promise vs. Observable or something?
    this.meat_opts = null;
    obs.subscribe(
      x => {
        console.log(next, x);
        // toast.info(next);
        if(_.isEmpty(this.schema)) this.schema = getSchema([x]);
        // ^ just x in case I'm not enforcing the array container
        if(!this.meat_opts) {
          this.meat_opts = findTables(this.schema);
          this.meat_str_opts = this.meat_opts.map(y => y.join('.'));
          // window.setTimeout(() => $('select').material_select(), 500);
        }
        if(this.auto_meat && !this.meat.length && this.meat_opts.length == 1) {
          this.meat = this.meat_opts[0];
        }
        // this.raw = x;
        this.addData(x);
      },
      e => {
        toast.error(e);
      },
      () => {
        toast.success(done);
      }
    );
    return obs; // how can I still use this?
  });
}

// run addUrls (fetch, optionally transform)
function doAddUrls(meta: Front.ReqMeta, transformer = y => y): Front.ObsInfo {
  let { urls } = meta;
  urls = urls.split('\n').filter(y => y);
  meta.urls = urls;
  // let meta_ = _.update('urls', s => s.split('\n').filter(y => y))(fetch_form);
  let obs = this.fetcher.addUrls(meta).map(transformer);
  return urlObsInfo(obs, urls);
}

// run addReqs (fetch, optionally transform)
function doAddReqs(metas: Front.ReqMeta[], transformer = y => y): Front.ObsInfo {
  let urls = metas.map(y => y.urls);
  let obs = this.fetcher.addReqs(metas).map(transformer);
  return urlObsInfo(obs, urls);
}

function urlObsInfo(obs: Observable, urls: string[]): Front.ObsInfo {
  return {
    obs,
    start: `starting fetch request`,
    next: `GET ${urls}`,
    done: `got ${urls}`,
  };
}

// convert a parselet from the form format to its intended format
function processParselet(prslt: Front.Parselet): Front.RealParselet {
  const TYPE_MAP = {
    // { selector, parselet, type, attribute }
    text: ([k, o]) => [k, o.selector],
    attribute: ([k, o]) => [k, o.selector + '@' + o.attribute ],
    'inner html': ([k, o]) => [k, o.selector + '@'],
    'outer html': ([k, o]) => [k, o.selector + '@@'],
    array: ([k, o]) => {
      return [`${k}(${o.selector})`, [processParselet(o.parselet)]];
    },
  };
  return _.flow([
    _.toPairs,
    _.map(([k,o]) => TYPE_MAP[o.type]([k,o])),
    _.fromPairs,
    s => JSON.stringify(s),
  ])(prslt);
}

// run parsley (fetch with parselet)
function doParsley(meta: Front.ReqMeta, parselet: Front.Parselet): Front.ObsInfo {
  let { urls } = meta;
  meta.parselet = processParselet(parselet);
  return {
    obs: this.fetcher.addUrls(meta),
    start: `starting HTML extraction request`,
    next: `GET ${urls} with extractors: ${json}`,
    done: `got ${urls}`,
  };
}

// handle emit api input_ui
export let reqUrl: Front.Submitter = submitReq(function(v: Front.ReqMeta[]) {
  return doAddReqs.call(this, v, x => JSON.parse(x));
  // ^ assume JSON API
});

// handle fetch form submit
export let doFetch: Front.Submitter = submitReq(function(
  fetch_form: Front.FetchForm,
  // { processor, parselet, transformer }: Front.ProcessForm,
  // ^ haven't managed to pass this in yet
) {
  // return processor == 'parselet' ? doParsley.call(this, urls, parselet) : doAddUrls.call(this, fetch_form);  //, fn
  return doAddUrls.call(this, fetch_form);
});

// handle process form submit
export function doProcess(
  // $raw: Observable<string>,
  { processor, parselet, transformer }: Front.ProcessForm,
  fetch_form: Front.FetchForm,
): void { // Observable<any>
  // return processor == 'parselet' ? doParsley.call(this, urls, parselet) : doAddUrls.call(this, fetch_form, fn);
  const fn_map = {
    transformer: eval(transformer),
    parselet: parse(processParselet(parselet)),
  };
  let fn = fn_map[processor] || (y => y);
  // return $raw.map(fn);
  this.extractor = fn;
  if(!_.size(this.raw)) {
    this.doFetch({ processor, parselet, transformer }, fetch_form);
  }
});

// handle curl form submit
export let doCurl: Front.Submitter = submitReq(function(v: any) {
  let { curl } = v;
  return {
    obs: this.fetcher.toCurl(curl),
    start: `CURL command`, //: ${curl}`
    next: `CURL reply received`,
    done: `CURL request finished`,
  };
});

// mime types: http://camendesign.com/code/uth4_mime-type/mime-types.php
// http status codes: https://rawgit.com/postmanlabs/postman-chrome-extension-legacy/master/chrome/js/httpstatuscodes.js
