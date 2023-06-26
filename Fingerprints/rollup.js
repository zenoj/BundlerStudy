const RequireFull = `var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};
`
const RequireFullMinified = `var r = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {};
`
const ES6Required = `function getAugmentedNamespace(n) {
    if (n.__esModule) return n;
    var a = Object.defineProperty({}, '__esModule', {
        value: true
    });
    Object.keys(n).forEach(function (k) {
        var d = Object.getOwnPropertyDescriptor(n, k);
        Object.defineProperty(a, k, d.get ? d : {
           enumerable: true,
           get: function () {
               return n[k];
           }
        });
    });
    return a;
    }`

const ES6RequiredMinified = `function t(r) {
        if (r.__esModule) return r;
        var t = Object.defineProperty({}, "__esModule", {
            value: !0
        });
        return Object.keys(r).forEach((function (n) {
            var e = Object.getOwnPropertyDescriptor(r, n);
            Object.defineProperty(t, n, e.get ? e : {
                enumerable: !0,
                get: function () {
                    return r[n]
                }
            })
        })), t
    }`

const FP = {
    name:"rollup",
    detection: [
        {
            name:"require function",
            fingerprint: RequireFull,
            implies: ["cjm"]
        },
        {
            name:"require function minified",
            fingerprint: RequireFullMinified,
            implies: ["cjm","minified"]
        },
        {
            name:"es6 required",
            fingerprint: ES6Required,
            implies: ["non minified", "es6"]
        },
        {
            name:"require function p3",
            fingerprint: ES6RequiredMinified,
            implies: ["minified", "es6"]
        },
    ],
}

module.exports = {FP}