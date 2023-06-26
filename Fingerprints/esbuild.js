const extPkgFull = `var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  });

  var __reExport = (target, module2, desc) => {
    if (module2 && typeof module2 === "object" || typeof module2 === "function") {
      for (let key of __getOwnPropNames(module2))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
    }
    return target;
  };

  var __toModule = (module2) => {
    return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
  };`

const extPkgP1 = `var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });`

const extPkgP2 = `var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  });`

const extPkgP3 = `var __reExport = (target, module2, desc) => {
    if (module2 && typeof module2 === "object" || typeof module2 === "function") {
      for (let key of __getOwnPropNames(module2))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
    }
    return target;
  };

  var __toModule = (module2) => {
    return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
  };`

const extPkgMinFull = `var qj = Object.create;
    var Is = Object.defineProperty;
    var Hj = Object.getOwnPropertyDescriptor;
    var Kj = Object.getOwnPropertyNames;
    var Vj = Object.getPrototypeOf,
        Yj = Object.prototype.hasOwnProperty;
    var Xj = r => Is(r, "__esModule", {
        value: !0
    });

    var $j = (r => typeof require != "undefined" ? require : typeof Proxy != "undefined" ? new Proxy(r, {
        get: (e, t) => (typeof require != "undefined" ? require : e)[t]
    }) : r)(function (r) {
        if (typeof require != "undefined") return require.apply(this, arguments);
        throw new Error('Dynamic require of "' + r + '" is not supported')
    });

    var Zj = (r, e, t) => {
            if (e && typeof e == "object" || typeof e == "function")
                for (let o of Kj(e)) !Yj.call(r, o) && o !== "default" && Is(r, o, {
                    get: () => e[o],
                    enumerable: !(t = Hj(e, o)) || t.enumerable
                });
            return r
        },
        Jj = r => Zj(Xj(Is(r != null ? qj(Vj(r)) : {}, "default", r && r.__esModule && "default" in r ? {
            get: () => r.default,
            enumerable: !0
        } : {
            value: r,
            enumerable: !0
        })), r);`

const extPkgMinP1 = `var qj = Object.create;
    var Is = Object.defineProperty;
    var Hj = Object.getOwnPropertyDescriptor;
    var Kj = Object.getOwnPropertyNames;
    var Vj = Object.getPrototypeOf,
        Yj = Object.prototype.hasOwnProperty;
    var Xj = r => Is(r, "__esModule", {
        value: !0
    });`
const extPkgMinP2 = `var $j = (r => typeof require != "undefined" ? require : typeof Proxy != "undefined" ? new Proxy(r, {
        get: (e, t) => (typeof require != "undefined" ? require : e)[t]
    }) : r)(function (r) {
        if (typeof require != "undefined") return require.apply(this, arguments);
        throw new Error('Dynamic require of "' + r + '" is not supported')
    });`

const extPkgMinP3 = `var Zj = (r, e, t) => {
            if (e && typeof e == "object" || typeof e == "function")
                for (let o of Kj(e)) !Yj.call(r, o) && o !== "default" && Is(r, o, {
                    get: () => e[o],
                    enumerable: !(t = Hj(e, o)) || t.enumerable
                });
            return r
        },
        Jj = r => Zj(Xj(Is(r != null ? qj(Vj(r)) : {}, "default", r && r.__esModule && "default" in r ? {
            get: () => r.default,
            enumerable: !0
        } : {
            value: r,
            enumerable: !0
        })), r);`

const cjsRequireFull = `var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };`

const cjsRequireFullMinified = `var n = (r, e) => () => (e || r((e = {
        exports: {}
    }).exports, e), e.exports);`

const es6RequiredPart1 = `var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};`

const es6RequiredPart2 = `var __export = (target, all) => {
    __markAsModule(target);
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };`

const es6RequireMinPart1 = `var lr = Object.defineProperty;
var St = r => lr(r, "__esModule", {
    value: !0
});
var y = (r, t) => () => (r && (t = r(r = 0)), t);`

const es6RequireMinPart2 = `Tt = (r, t) => {
            St(r);
            for (var e in t) 
                lr(r, e, { get: t[e], enumerable: !0
            })
        };`

const es6Comments = ``

const FP = {
    name:"esbuild",
    detection: [
        {
            name: "ext pkg prefix full",
            fingerprint: extPkgFull,
            implies: ["external package"]
        }, {
            name: "ext pkg prefix part1",
            fingerprint: extPkgP1,
            implies: ["external package"]
        },
        {
            name: "ext pkg prefix part2",
            fingerprint: extPkgP2,
            implies: ["external package"]
        },
        {
            name: "ext pkg prefix part3",
            fingerprint: extPkgP3,
            implies: ["external package"]
        },
        {
            name: "ext pkg prefix minified part1",
            fingerprint: extPkgMinP1,
            implies: ["external package, minified"]
        },
        {
            name: "ext pkg prefix minified part2",
            fingerprint: extPkgMinP2,
            implies: ["external package, minified"]
        },
        {
            name: "ext pkg prefix minified part3",
            fingerprint: extPkgMinP3,
            implies: ["external package, minified"]
        },
        {
            name: "ext pkg prefix minified full",
            fingerprint: extPkgMinFull,
            implies: ["external package, minified"]
        },
        {
            name: "cjs require full",
            fingerprint: cjsRequireFull,
            implies: ["cjs"]
        },
        {
            name: "cjs require full minified",
            fingerprint: cjsRequireFullMinified,
            implies: ["cjs, minified"]
        },
        {
            name: "es6 require part 1",
            fingerprint: es6RequiredPart1,
            implies: ["es6"]
        },
        {
            name: "es6 require part 2",
            fingerprint: es6RequiredPart2,
            implies: ["es6"]
        },
        {
            name: "es6 require part 1 minified",
            fingerprint: es6RequireMinPart1,
            implies: ["es6"]
        },
        {
            name: "es6 require part 2 minified",
            fingerprint: es6RequireMinPart2,
            implies: ["es6"]
        }
    ]

}

module.exports = {FP};