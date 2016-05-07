let _ = require('lodash/fp');
import { validate } from './validators';
import { mapBoth } from '../../lib/js';

describe('validators', () => {

  // it('required', () => {
  //   expect(validate({}, { type: 'object', properties: { a: {} }, required: ['a'] })).toEqual(false);
  // })

  for (let k in tests) {
    let { schema, valid, invalid } = tests[k];
    it(k, () => {
      valid.forEach(v => {
        expect(validate(v, schema)).toEqual(true);
      });
      invalid.forEach(v => {
        expect(validate(v, schema)).toEqual(false);
      });
    })
  }

  // it('', () => {
  //   expect().toEqual();
  // })

})

let tests = {
    // required3: {
    //     schema: {
    //         type: "object",
    //         properties: {
    //             required: {
    //                 type: "string",
    //                 required: true
    //             },
    //             notrequired: {
    //                 type: "string",
    //                 required: false
    //             },
    //             defaultrequired: {
    //                 type: "string"
    //             }
    //         }
    //     },
    //     valid: [
    //         {
    //             required: ""
    //         },
    //         {
    //             required: "",
    //             notrequired: "",
    //             defaultrequired: ""
    //         }
    //     ],
    //     invalid: [
    //         {
    //             notrequired: ""
    //         }
    //     ]
    // },
    enum: {
        schema: {
            type: "string",
            enum: ["value1","value2"]
        },
        valid: ["value1","value2"],
        invalid: ["value3"]
    },
    extends: {
        schema: {
            type: "string",
            extends: [
                {
                    minLength: "5"
                },
                {
                    maxLength: "10"
                }
            ]
        },
        valid: ["abcdef","abcdefghij","abcdefgh"],
        invalid: ["abcd","abcdefghijk"]
    },
    allOf: {
        schema: {
            type: "string",
            allOf: [
                {
                    minLength: "5"
                },
                {
                    maxLength: "10"
                }
            ]
        },
        valid: ["abcdef","abcdefghij","abcdefgh"],
        invalid: ["abcd","abcdefghijk"]
    },
    anyOf: {
        schema: {
            type: "string",
            anyOf: [
                {
                    minLength: "5"
                },
                {
                    pattern: '^[0-9]+$'
                }
            ]
        },
        valid: ["abcdef","123","12345"],
        invalid: ["a"]
    },
    oneOf: {
        schema: {
            type: "string",
            oneOf: [
                {
                    minLength: "5"
                },
                {
                    pattern: '^[0-9]+$'
                }
            ]
        },
        valid: ["abcdef","123"],
        invalid: ["a","12345"]
    },
    not: {
        schema: {
            type: "string",
            not: {
                pattern: '^[0-9]+$'
            }
        },
        valid: ["abc"],
        invalid: ["123"]
    },
    type: {
        schema: {
            type: "object",
            properties: {
                string: {
                    type: "string"
                },
                integer: {
                    type: "integer"
                },
                number: {
                    type: "number"
                },
                array: {
                    type: "array"
                },
                object: {
                    type: "object"
                },
                boolean: {
                    type: "boolean"
                },
                null: {
                    type: "null"
                },
                any: {
                    type: "any"
                },
                undefined: {
                },
                stringnumber: {
                    type: ["string","number"]
                },
                schema: {
                    type: [{
                        type: "string",
                        minLength: "5"
                    }]
                }
            }
        },
        valid: [{
            string: "hello",
            number: 1.50,
            integer: 1,
            boolean: true,
            array: [],
            object: {},
            null: null,
            any: "test",
            undefined: "test",
            stringnumber: "a",
            schema: "abcdef"
        },{
            stringnumber: 5
        }],
        invalid: [{
            string: 1
        },{
            number: "test"
        },{
            integer: 1.5
        },{
            integer: "test"
        },{
            boolean: "true"
        },{
            array: {}
        },{
            object: []
        },{
            null: {}
        },{
            stringnumber: true
        },{
            schema: "abc"
        },{
            schema: 5
        }]
    },
    multipleOf: {
        schema: {
            multipleOf: 5
        },
        valid: [5,0,10],
        invalid: [5.5,8,1]
    },
    divisibleBy: {
        schema: {
            divisibleBy: 5
        },
        valid: [5,0,10],
        invalid: [5.5,8,1]
    },
    multipleOfDecimal: {
      schema: {
        multipleOf: .01
      },
      valid: [1,1.14,3.57,56],
      invalid: [1.012]
    },
    minmax: {
        schema: {
            type: "object",
            properties: {
                min: {
                    minimum: 5
                },
                exmin: {
                    minimum: 5,
                    exclusiveMinimum: true
                },
                max: {
                    maximum: 5
                },
                exmax: {
                    maximum: 5,
                    exclusiveMaximum: true
                }
            }
        },
        valid: [{
            min: 5,
            exmin: 6,
            max: 5,
            exmax: 4
        }],
        invalid: [{min: 4},{exmin:5},{max:6},{exmax:5}]
    },
    minmaxLength: {
        schema: {
            type: "object",
            properties: {
                min: {
                    minLength: 5
                },
                max: {
                    maxLength: 5
                }
            }
        },
        valid: [{
            min: "abcde",
            max: "abcde"
        },{
            min: "abcdef",
            max: "abcd"
        }],
        invalid: [{min: "abcd"},{max:"abcdef"}]
    },
    pattern: {
        schema: {
            pattern: "[0-9]"
        },
        valid: ["abc123"],
        invalid: ["abc"]
    },
    items_schema: {
        schema: {
            items: {
                type: "string"
            }
        },
        valid: [
            ["test",""],
            []
        ],
        invalid: [
            ["test",123]
        ]
    },
    items_array: {
        schema: {
            items: [{
                type: "string"
            },{
                type: "number"
            }],
            additionalItems: false
        },
        valid: [
            ["test",123]
        ],
        invalid: [
            ["test",123,123],
            [123,"test"]
        ]
    },
    additionalItems: {
        schema: {
            items: [{
                type: "string"
            }],
            additionalItems: {
                type: "number"
            }
        },
        valid: [
            ["test",1],
            ["test"]
        ],
        invalid: [
            ["test",1,"test"],
            ["test","test2"]
        ]
    },
    minmaxItems: {
        schema: {
            type: "object",
            properties: {
                min: {
                    minItems: 3
                },
                max: {
                    maxItems: 3
                }
            }
        },
        valid: [
            {
                min: [1,2,3],
                max: [1,2,3]
            },
            {
                min: [1,2,3,4],
                max: [1,2]
            }
        ],
        invalid: [
            {
                min: [1,2]
            },
            {
                max: [1,2,3,4]
            }
        ]
    },
    uniqueItems: {
        schema: {
            uniqueItems: true
        },
        valid: [[1,2,3,{a:1},"1","{a:1}"]],
        invalid: [
            [1,1,2],
            [{a: 1},{a: 1}]
        ]
    },
    minmaxProperties: {
        schema: {
            type: "object",
            properties: {
                min: {
                    minProperties: 2
                },
                max: {
                    maxProperties: 2
                }
            }
        },
        valid: [
            {
                min: {
                    a: 1,
                    b: 2
                },
                max: {
                    a: 1,
                    b: 2
                }
            },
            {
                min: {
                    a: 1,
                    b: 2,
                    c: 3
                },
                max: {
                    a: 1
                }
            }
        ],
        invalid: [
            {
                min: {
                    a: 1
                }
            },
            {
                max: {
                    a: 1,
                    b: 2,
                    c: 3
                }
            }
        ]
    },
    required4: {
        schema: {
            type: "object",
            properties: {
                required: {}
            },
            required: ["required"],
            additionalProperties: true
        },
        valid: [{required: true, test: 1}],
        invalid: [
            {}
        ]
    },
    required4_merge: {
        schema: {
            type: "object",
            properties: {
                orig: {},
                other: {}
            },
            required: ["orig"],
            oneOf: [
                {
                    required: ["other"]
                }
            ]
        },
        valid: [
            {
                orig: true,
                other: true
            }
        ],
        invalid: [
            {
                orig: true
            },
            {
                other: true
            }
        ]
    },
    properties: {
        schema: {
            type: "object",
            properties: {
                required: {
                    type: "string"
                }
            },
            additionalProperties: {
                type: "number"
            }
        },
        valid: [{required: "test"},{other: 1}],
        invalid: [
            {other: "test"},
            {required: 1}
        ]
    },
    patternProperties: {
        schema: {
            type: "object",
            patternProperties: {
                "^test": {
                    type: "string"
                }
            },
            additionalProperties: false
        },
        valid: [
            {testing: "test"},
            {}
        ],
        invalid: [
            {testing: 1},
            {other: "five"}
        ]
    },
    dependencies: {
        schema: {
            type: "object",
            dependencies: {
                property: ['property1','property2'],
                schema: {
                    properties: {
                        schema2: {
                            type: "string"
                        }
                    }
                }
            }
        },
        valid: [
            {
                property: "",
                property1: "",
                property2: "",
                schema2: 1
            },
            {
                schema: ""
            },
            {
                schema: "",
                schema2: ""
            }
        ],
        invalid: [
            {
                property: "",
                property1: ""
            },
            {
                schema: "",
                schema2: 2
            }
        ]
    },
    definitions: {
        schema: {
            type: "object",
            properties: {
                storage: {
                    $ref: "#/definitions/diskDevice"
                },
                external: {
                    $ref: "#/definitions/external"
                }
            },
            definitions: {
                diskDevice: {
                    pattern: "^/dev/[^/]+(/[^/]+)*$"
                },
                external: {
                    "$ref": "http://localhost/json-editor/tests/string.json"
                }
            }
        },
        valid: [
            {
                storage: "/dev/test",
                external: "test"
            }
        ],
        invalid: [
            {
                storage: "test"
            },
            {
                external: 1
            }
        ]
    },
    definitions_nested: {
        schema: {
            type: "object",
            properties: {
              id: {
                $ref: "#/definitions/app/definitions/id"
              },
              definitions: {
                type: "number"
              },
              test: {
                $ref: "#/definitions/test"
              }
            },
            definitions: {
                app: {
                    definitions: {
                      id: {
                        type: "string"
                      }
                    }
                },
                test: {
                  properties: {
                    definitions: {
                      type: "number"
                    }
                  }
                }
            }
        },
        valid: [
            {
                id: "test",
                definitions: 3,
                test: {definitions: 3}
            }
        ],
        invalid: [
            {
                id: 1
            },
            {
                definitions: "string"
            },
            {
              test: {definitions: "string"}
            }
        ]
    },
    $ref: {
        schema: {
            type: "object",
            properties: {
                "/": { $ref: 'http://localhost/json-editor/tests/string.json' }
            }
        },
        valid: [
            {
                "/": "test"
            }
        ],
        invalid: [
            {
                "/": 1
            }
        ]
    },
    $ref_recursive: {
        schema: {
            type: "object",
            properties: {
                "recursive": { $ref: 'http://localhost/json-editor/tests/recursive.json' },
                "string": {
                    $ref: "http://localhost/json-editor/tests/string.json"
                }
            }
        },
        valid: [
            {
                "recursive": {
                    "string": "test"
                },
                "string": "test"
            }
        ],
        invalid: [
            {
                "recursive": "test"
            },
            {
                "recursive": {
                    "string": 1
                }
            },
            {
                "string": 1
            }
        ]
    },
    disallow: {
        schema: {
            type: "object",
            properties: {
                union: {
                    disallow: [
                        "string",
                        {
                            type: "number",
                            maximum: 5
                        }
                    ]
                },
                simple: {
                    disallow: "number"
                }
            }
        },
        valid: [
            {
                union: 7,
                simple: "test"
            },
            {
                union: [],
                simple: {}
            }
        ],
        invalid: [
            {
                union: 4
            },
            {
                union: "test"
            },
            {
                simple: 3
            }
        ]
    },
    custom_validation: {
        schema: {
            type: "string",
            format: "date"
        },
        valid: ["1999-01-01"],
        invalid: ["1999","abc","abc 1999-01-01","1999-01-01 abc"]
    }
};
