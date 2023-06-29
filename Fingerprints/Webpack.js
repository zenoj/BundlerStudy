const Webpack4RequireShuffled = `
  function t(n) {
    if (i[n]) return i[n].exports;
    var r = i[n] = {
      exports: {},
      id: n,
      loaded: !1
    };
    return e[n].call(r.exports, r, r.exports, t), r.loaded = !0, r.exports
  }`

const Webpack4RequireOriginal = `
function n(e) {
        if (t[e]) return t[e].exports;
        var i = t[e] = {
            i: e,
            l: !1,
            exports: {}
        };
        return r[e].call(i.exports, i, i.exports, n), i.l = !0, i.exports
    }
`

const CJSRequireFunction = `
function __webpack_require__(moduleId) {
    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
        return cachedModule.exports;
    }
    var module = __webpack_module_cache__[moduleId] = {
    exports: {}
    };
    t__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
    return module.exports;
 }`

const CJSRequireFunction_Minified = `function n(e) {
    var o = r[e];
    if (void 0 !== o) return o.exports;
    var u = r[e] = {
      exports: {}
    };
    return t[e](u, u.exports, n), u.exports
  }`

const RequireRuntimeGlobal = `
(() => {
__webpack_require__.g = (function() {
    if (typeof globalThis === 'object') return globalThis;
        try {
            return this || new Function('return this')();
        } catch (e) {
            if (typeof window === 'object') return window;
        }
    })();
})();
`

const RequireRuntimeGlobal_Minified = `
n.g = function () {
    if ("object" == typeof globalThis) return globalThis;
    try {
      return this || new Function("return this")()
    } catch (t) {
      if ("object" == typeof window) return window
    }
  }()
`


const ES6RuntimeDefine = `
(() => {
    __webpack_require__.d = (exports, definition) => {
        for(var key in definition) {
            if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
                Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
            }
        }
    };
    })();
`

const ES6RuntimeDefine_Minified = `
for (var e in r) t.o(r, e) && !t.o(n, e) && Object.defineProperty(n, e, {
    enumerable: !0,
    get: r[e]
})
`

const ES6RuntimeMake = `
(() => {
    __webpack_require__.r = (exports) => {
            if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
                Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
            }
            Object.defineProperty(exports, '__esModule', { value: true });
    };
})();`

const ES6RuntimeMake_Minified = `
"undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
                    value: "Module"
                }), Object.defineProperty(t, "__esModule", {
                    value: !0
                })
`

const ES6RuntimeHasOwnProperty = `
(() => {
    __webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
})();
`

const ES6RuntimeFullMinified = `
var t = {
            d: (n, r) => {
                for (var e in r) t.o(r, e) && !t.o(n, e) && Object.defineProperty(n, e, {
                    enumerable: !0,
                    get: r[e]
                })
            },
            o: (t, n) => Object.prototype.hasOwnProperty.call(t, n),
            r: t => {
                "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
                    value: "Module"
                }), Object.defineProperty(t, "__esModule", {
                    value: !0
                })
            }
        },
        n = {};
`

const FP = {
    name:"webpack",
    detection: [
        {
            name:"cjs require function",
            fingerprint: CJSRequireFunction,
            implies: ["non minified", "cjs"]
        },
        {
            name:"webpack4 require function original",
            fingerprint: Webpack4RequireOriginal,
            implies: ["minified", "WP4"]
        },
        {
            name:"webpack4 require function shuffled",
            fingerprint: Webpack4RequireShuffled,
            implies: ["minified", "WP4"]
        },
        {
            name:"cjs require function minified",
            fingerprint: CJSRequireFunction_Minified,
            implies: ["minified", "cjs"]
        },
        {
            name:"cjs require runtime global",
            fingerprint: RequireRuntimeGlobal,
            implies: ["non minified", "cjs"]
        },
        {
            name:"require runtime global minified",
            fingerprint: RequireRuntimeGlobal_Minified,
            implies: ["minified", "cjs"]
        },
        {
            name:"ES6 Runtime define",
            fingerprint: ES6RuntimeDefine,
            implies: ["non minified", "es6"]
        },
        {
            name:"ES6 Runtime define minified",
            fingerprint: ES6RuntimeDefine_Minified,
            implies: ["minified", "es6"]
        },
        {
            name:"ES6 runtime make",
            fingerprint: ES6RuntimeMake,
            implies: ["non minified", "es6"]
        },
        {
            name:"ES6 runtime make minified",
            fingerprint: ES6RuntimeMake_Minified,
            implies: ["minified", "es6"]
        },
        {
            name:"ES6 runtime HasOwnProperty",
            fingerprint: ES6RuntimeHasOwnProperty,
            implies: ["non minified", "es6"]
        },
        {
            name:"ES6 runtime full minified",
            fingerprint: ES6RuntimeFullMinified,
            implies: ["minified", "es6"]
        }
    ],
}

module.exports = {FP}