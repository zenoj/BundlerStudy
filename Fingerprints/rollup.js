let rollupFPs = {
    RequireFull: `var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};`,

    RequireFullMinified: `var r = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {};`,

    ES6Required: `function getAugmentedNamespace(n) {
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
        }`,

    ES6RequiredMinified: `function t(r) {
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
        }`,
};

module.exports = { rollupFPs };
