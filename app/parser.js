// let jsonPath = require('JSONPath');
let _ = require('lodash');
let tv4 = require('tv4');
// let tv4 = require('tycho01/tv4');
let $ = jQuery = require('jquery');
let marked = require('marked');
let jade = require('jade');
import { arrToSet } from './rx_helpers';  //, elemToArr, arrToArr, elemToSet, setToSet, loggers, notify

Array.prototype.last = function() {
  return this[this.length-1];
}
Array.prototype.has = function(k) {
  return this.indexOf(k) >= 0;
}
Array.prototype.clean = function() {
  return this.filter((el, idx, arr) => el);
}
//let truthy = (el, idx, arr) => el;
Array.prototype.flatten = function() {
  return this.reduce((a, b) => a.concat(b), []);
}
// ^ alt: _.flatten(arr, bool deep)
// create an element from an HTML string (for now with a single root element)
let elFromHtml = (html) => {
  try {
    return jQuery(html).toArray()[0] || elFromText(html)
  }
  catch (e) {
    return elFromText(html)
  }
}
// create an element from a text string (can also do some HTML but not dependent elements like td)
let elFromText = (s) => {
  let div = document.createElement('div');
  div.innerHTML = s;
  return div.firstChild;  //multiple: .childNodes
}
// immutable `appendChild`
// Element.prototype.add = function(el) {
//   let tmp = this.cloneNode(true);
//   tmp.appendChild(el);
//   return tmp;
// }
//let nuller = () => null;
let nuller = (a, b, c, d, e) => {
  console.log("ERROR: no handler found", a, b, c, d, e);
  return null;
};
//let cloneOf = o => JSON.parse(JSON.stringify(o));
// http://codereview.stackexchange.com/questions/84951/invert-a-javascript-object-hash-whose-values-are-arrays-to-produce-a-new-objec
// function arrayAwareInvert(o) {
//   let merge = (res, vals, k) => _.merge(res, _.mapValues(_.object(vals), (v) => k))
//   return _.reduce(o, merge, {});
// }
// let make_map = (arr, fn) => _.zipObject(arr, arr.map(fn))
Object.filter = (obj, pred) => _.zipObject(Object.keys(obj).filter(k => pred(obj[k])).map(k => [k, obj[k]]))
Element.prototype.child = function(i) {
  return this.children.item(i)
}
Element.prototype.appendChildren = function(html_coll) {
  while(html_coll.length > 0) {
    this.appendChild(html_coll.item(0))
  }
  return this;
}

// let Kinds = { FIXED: 1, PATTERN: 2, ADDITIONAL: 3 }
// var SymbolEnum = require('symbol-enum')
// var Kinds = new SymbolEnum('FIXED', 'PATTERN', 'ADDITIONAL')  //Kinds.FIXED
let SCALARS = ["boolean", "integer", "number", "string", "null", "scalar"];
let Templates = _.mapValues({
  card_object: require('!raw!./jade/card_object.jade'), //-
  card_table: require('!raw!./jade/card_table.jade'), //- {k, id, cols: [{k, id}], rows: [{id, cells: [{id, val}]}]}
    ul_table: require('!raw!./jade/ul_table.jade'), //- {k, id, rows: [{id, val}]}
    dl_table: require('!raw!./jade/dl_table.jade'), //- {rows: [{k, id, val}]}
    dl      : require('!raw!./jade/dl.jade'),       //- {rows: [{k, id, val}]}
}, t => jade.compile(t, {}))

let infer_type = (v) => Array.isArray(v) ? "array" : _.isObject(v) ? "object" : "scalar"

// let try_schema = (val, swag) => infer_type(val)
// let try_schema = (val, swag) => _.find(
//   swag.oneOf || swag.anyOf || swag.allOf || [],
//   (schema, idx, arr) => tv4.validate(val, schema)
// ) || infer_type(val)
let try_schema = (val, swag) => {
  let options = _.get(swag, ['oneOf']) || _.get(swag, ['anyOf']) || _.get(swag, ['allOf']) || []
  let tp = _.find(options, (schema, idx, arr) => tv4.validate(val, schema, false, false, false))
  return _.get(tp,['type']) ? tp :
    _.any(['oneOf','anyOf','allOf'], x => _.get(tp,[x])) ?
    try_schema(val, tp) : null //infer_type(val)
}

function getHandler(type, map) {
  let key = (SCALARS.has(type)) ? "scalar" : type;
  return map[key] || nuller;  // not actually nothing! just means I don't have sufficient info to infer the type...
}

function parseVal(path, api_spec, swagger) {
  let type_map = {
    //array of multiple,
    "array": parseArray,  //uniqueItems: true -> Set
    "object": parseObject,
    "scalar": parseScalar, //for string input consider pattern (regex), format: uri, email, regex
  };
  // let tp = _.get(swagger, ['type'], try_schema(api_spec, swagger))
  // let tp = _.get(swagger, ['type']) || try_schema(api_spec, swagger)
  swagger = _.get(swagger,['type']) ? swagger : try_schema(api_spec, swagger)
  let tp = _.get(swagger, ['type']) || infer_type(api_spec)
  let fn = getHandler(tp, type_map);
  // return fn(path, swagger, k, id);
  return fn(path, api_spec, swagger);
  // return makeTemplate(fn, path, api_spec, swagger);
  //enum: white-listed values (esp. for string) -- in this case make scalars like radioboxes/drop-downs for input, or checkboxes for enum'd string[].
}

function parseArray(path, api_spec, swagger) {
  //type:array, uniqueItems, minItems, maxItems, default, items/anyOf/allOf/oneOf, additionalItems
  //no array of multiple, this'd be listed as anyOf/allOf or additionalItems, both currently unimplemented,
  //number: multipleOf, maximum, exclusiveMaximum, minimum, exclusiveMinimum
  //string: maxLength, minLength, format
  // /*
  let type_map = {
    "array": make_ul_table, //parseNested,
    "object": parseCollection,
    "scalar": make_ul_table, //parseList,
  };
  // let tp = _.get(swagger, ['items','type'], infer_type(api_spec[0]))
  let first = _.get(api_spec,[0])
  swagger = _.get(swagger, ['items', 'type']) ? swagger.items : try_schema(first, _.get(swagger, ['items']))
  let tp = _.get(swagger, ['type']) || infer_type(first)
  let fn = getHandler(tp, type_map);
  //return fn(path.concat("[]"), arr);
  //path.concat("[]")
  return makeTemplate(fn, path, api_spec, swagger);
  // */
  // return makeTemplate(make_ul, path, api_spec, swagger);
  // // ^ temporarily keep this simple to test new structure.
}

// for a given object key get the appropriate swagger spec
let key_spec = (
  k,
  swagger,
  fixed,  // = get_fixed(swagger, api_spec)
  patts = get_patts(swagger)
) => {
  // let kind = Kinds.ADDITIONAL
  let swag = _.get(swagger, ['additionalProperties'])
  if(fixed.has(k)) {
    // kind = Kinds.FIXED
    swag = swagger.properties[k]
  } else {
    patts.forEach(p => {
      if(new RegExp(p).test(k)) {
        // kind = Kinds.PATTERN
        swag = swagger.patternProperties[p]
        // v.patt = p
      }
    })
  }
  return swag;
  // return {kind: kind, swag: swag};
}

let get_fixed = (swag, api) => {
  let keys = Object.keys(api);
  return Object.keys(_.get(swag, ['properties']) || {}).filter(k => keys.has(k));
}

let get_patts = (swag) => Object.keys(_.get(swag, ['patternProperties']) || {})

function parseObject(path, api_spec, swagger) {
  //not
  let {id: id, k: k} = getPaths(path)
  // let Types = { ANY: 0, SCALAR: 1, ARRAY: 2, OBJECT: 3 }
  let keys = Object.keys(api_spec);
  let fixed = get_fixed(swagger, api_spec)
  let patts = get_patts(swagger)
  let coll = _.zipObject(keys.map(k => {
    // let v = {swag: swagger.additionalProperties, pars: null} //Types.ANY, type: "any", kind: Kinds.ADDITIONAL, patt: null
    let swag = key_spec(k, swagger, fixed, patts)
    // let {kind: kind, swag: swag} = key_spec(k, swagger, fixed, patts)
    let path_k = path.concat(k.replace(/[^\w-]+/g, '-').replace(/(^-)|(-$)/g, ''));
    let pars = [path_k, api_spec[k], swag] //v.
    let tp = _.get(swag, ['type']) || infer_type(api_spec[k])
    if(SCALARS.has(tp)) tp = "scalar"
    let v = {pars: pars, type: tp}  //swag: swag, kind: kind,
    return [k, v]
  }).clean())

  let [scalars, arrays, objects] = ['scalar','array','object'].map(x => Object.filter(coll, v => v.type == x))
  // let div = elFromHtml(`<div class="card"><div class="card-content" id="${id}"><span class="card-title">${k}</span></div></div>`)
  // let el = div.child(0)
  // el.appendChild(make_dl_table(path, api_spec, swagger, scalars));
  // Object.keys(objects).forEach(k => el.appendChild(parseObject(...objects[k].pars)));
  // Object.keys(arrays).forEach(k => el.appendChild(parseArray(...arrays[k].pars)));
  // return div;
  let scal = make_dl_table(path, api_spec, swagger, scalars)
  // ES7 Object.values...
  let obj = Object.keys(objects).map(k => parseObject(...objects[k].pars))
  let arr = Object.keys(arrays).map(k => parseArray(...arrays[k].pars))
  return Templates.card_object({k: k, id: id, scal: scal, obj: obj, arr: arr })
}

let getPaths = (path) => {
  let k = path.last();
  let id = path.join('-');  // /^[a-zA-Z][\w:.-]*$/
  let model = path.join('?.');  //ng2 elvis operator to prevent crashing if some element is missing
  // return [k, id, model]
  return {k: k, id: id, model: model}
}

function makeTemplate(fn, path, api_spec, swagger) {
  // let [k, id, model] = getPaths(path)
  let {k: k, id: id, model: model} = getPaths(path)
  return fn(path, api_spec, swagger, k, id, model);
}

// let tooltip = o => o.description ? ` class="tooltipped" data-position="bottom" data-delay="50" data-tooltip="${o.description}"` : '';

function make_ul_table(path, api_spec, swagger, k, id, model) {
  let rows = (api_spec || []).map((v, idx) => {
    let path_k = path.concat(idx)
    let val = parseVal(path_k, v, _.get(swagger, ['items']))
    return Object.assign(getPaths(path_k), {val: val})
  });
  return Templates.ul_table({k: k, id: id, rows: rows})
}

function make_dl_table(path, api_spec, swagger, scalar_coll) {
  // return `<dl id="${id}"><div *ng-for="#item of ${model}"><dt>{{item}}</dt><dd>{{item}}</dd></div></dl>\r\n`;
  let rows = Object.keys(scalar_coll).map(k => {
    let val = parseVal(...scalar_coll[k].pars)
    return Object.assign(getPaths(path.concat(k)), {val: val})
  });
  return Templates.dl_table({rows: rows})
}

function parseCollection(path, api_spec, swagger, k, id, model) {
  let fixed = get_fixed(swagger, api_spec)
  let patts = get_patts(swagger)
  let col_keys = Array.from(api_spec
    .map(x => Object.keys(x))
    .reduce(arrToSet, new Set)
  )
  let cols = col_keys.map(k => getPaths(path.concat(k)))
  let rows = api_spec.map((rw, idx) => {
    // let [_k, id, model] = getPaths(path.concat(idx))
    let {k: k, id: id, model: model} = getPaths(path.concat(idx))
    let cells = col_keys.map(col => {
      let k_path = path.concat([idx, col])
      let val = parseVal(k_path, rw[col], key_spec(col, swagger, fixed, patts))
      return Object.assign(getPaths(k_path), {val: val})
    })
    return {id: id, cells: cells}
  });
  return Templates.card_table({k: k, id: id, cols: cols, rows: rows})
}

// meant to use without makeTemplate
function parseScalar(path, api_spec, swagger) {
  let val = `${api_spec}`
  if(path.last() == "description") {
    console.log("gonna transform", val)
    val = `<span class="markdown">${marked(val)}</span>`  // swagger MD descs, wrapped to ensure 1 node
    console.log("transformed", val)
  }
  switch (_.get(swagger, ['format'])) {
    case "uri": val = `<a href="${val}">${val}</a>`; break;
    case "email": val = `<a href="mailto:${val}">${val}</a>`; break;
    // default:
  }
  // return elFromHtml(val);
  console.log("done", val)
  return val;
}

// ng1 material components: https://github.com/Textalk/angular-schema-form-material/tree/develop/src
// accompanying logic + type mapping: https://github.com/Textalk/angular-schema-form/blob/development/src/services/schema-form.js#L233
// swagger editor ng1 html: https://github.com/swagger-api/swagger-editor/blob/master/app/templates/operation.html
// json editor: functional [elements](https://github.com/flibbertigibbet/json-editor/blob/develop/src/theme.js), [overrides](https://github.com/flibbertigibbet/json-editor/blob/develop/src/themes/bootstrap3.js)

export { parseVal };