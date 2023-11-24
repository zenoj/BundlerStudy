let webpackFPs = require("./webpack");

let browserifyFPs = require("./browserify");

let rollupFPs = require("./rollup");

let parcelFPs = require("./parcel");

let esbuildFPs = require("./esbuild");

const FP = {
    webpack: {
        name: "webpack",
        detection: [
            {
                name: "cjs require function",
                fingerprint: webpackFPs.CJSRequireFunction,
                implies: ["non minified", "cjs"],
            },
            {
                name: "webpack4 require function original",
                fingerprint: webpackFPs.Webpack4RequireOriginal,
                implies: ["minified", "WP4"],
            },
            {
                name: "webpack4 require function shuffled",
                fingerprint: webpackFPs.Webpack4RequireShuffled,
                implies: ["minified", "WP4"],
            },
            {
                name: "cjs require function minified",
                fingerprint: webpackFPs.CJSRequireFunction_Minified,
                implies: ["minified", "cjs"],
            },
            {
                name: "cjs require runtime global",
                fingerprint: webpackFPs.RequireRuntimeGlobal,
                implies: ["non minified", "cjs"],
            },
            {
                name: "require runtime global minified",
                fingerprint: webpackFPs.RequireRuntimeGlobal_Minified,
                implies: ["minified", "cjs"],
            },
            {
                name: "ES6 Runtime define",
                fingerprint: webpackFPs.ES6RuntimeDefine,
                implies: ["non minified", "es6"],
            },
            {
                name: "ES6 Runtime define minified",
                fingerprint: webpackFPs.ES6RuntimeDefine_Minified,
                implies: ["minified", "es6"],
            },
            {
                name: "ES6 runtime make",
                fingerprint: webpackFPs.ES6RuntimeMake,
                implies: ["non minified", "es6"],
            },
            {
                name: "ES6 runtime make minified",
                fingerprint: webpackFPs.ES6RuntimeMake_Minified,
                implies: ["minified", "es6"],
            },
            {
                name: "ES6 runtime HasOwnProperty",
                fingerprint: webpackFPs.ES6RuntimeHasOwnProperty,
                implies: ["non minified", "es6"],
            },
            {
                name: "ES6 runtime full minified",
                fingerprint: webpackFPs.ES6RuntimeFullMinified,
                implies: ["minified", "es6"],
            },
        ],
    },
    browserify: {
        name: "browserify",
        detection: [
            // {
            //     name:"full require function",
            //     fingerprint: RequireFull,
            //     implies: "CJM"
            // }
            // ,
            {
                name: "half require function",
                fingerprint: browserifyFPs.RequireHalf,
                implies: ["CJM"],
            },
            {
                name: "require function part3",
                fingerprint: browserifyFPs.RequireP3,
                implies: ["CJM"],
            },
        ],
    },
    rollup: {
        name: "rollup",
        detection: [
            {
                name: "require function",
                fingerprint: rollupFPs.RequireFull,
                implies: ["cjm"],
            },
            {
                name: "require function minified",
                fingerprint: rollupFPs.RequireFullMinified,
                implies: ["cjm", "minified"],
            },
            {
                name: "es6 required",
                fingerprint: rollupFPs.ES6Required,
                implies: ["non minified", "es6"],
            },
            {
                name: "require function p3",
                fingerprint: rollupFPs.ES6RequiredMinified,
                implies: ["minified", "es6"],
            },
        ],
    },
    parcel: {
        name: "parcel",
        detection: [
            {
                name: "half require function minified",
                fingerprint: parcelFPs.RequireHalfMinified,
                implies: ["minified"],
            },
            {
                name: "require function part3 minified",
                fingerprint: parcelFPs.RequireP3Minified,
                implies: ["minified"],
            },
            {
                name: "require function half",
                fingerprint: parcelFPs.RequireHalf,
                implies: ["non minified"],
            },
            {
                name: "require function p3",
                fingerprint: parcelFPs.RequireP3,
                implies: ["non minified"],
            },
        ],
    },
    esbuild: {
        name: "esbuild",
        detection: [
            {
                name: "ext pkg prefix full",
                fingerprint: esbuildFPs.extPkgFull,
                implies: ["external package"],
            },
            {
                name: "ext pkg prefix part1",
                fingerprint: esbuildFPs.extPkgP1,
                implies: ["external package"],
            },
            {
                name: "ext pkg prefix part2",
                fingerprint: esbuildFPs.extPkgP2,
                implies: ["external package"],
            },
            {
                name: "ext pkg prefix part3",
                fingerprint: esbuildFPs.extPkgP3,
                implies: ["external package"],
            },
            {
                name: "ext pkg prefix minified part1",
                fingerprint: esbuildFPs.extPkgMinP1,
                implies: ["external package, minified"],
            },
            {
                name: "ext pkg prefix minified part2",
                fingerprint: esbuildFPs.extPkgMinP2,
                implies: ["external package, minified"],
            },
            {
                name: "ext pkg prefix minified part3",
                fingerprint: esbuildFPs.extPkgMinP3,
                implies: ["external package, minified"],
            },
            {
                name: "ext pkg prefix minified full",
                fingerprint: esbuildFPs.extPkgMinFull,
                implies: ["external package, minified"],
            },
            {
                name: "cjs require full",
                fingerprint: esbuildFPs.cjsRequireFull,
                implies: ["cjs"],
            },
            {
                name: "cjs require full minified",
                fingerprint: esbuildFPs.cjsRequireFullMinified,
                implies: ["cjs, minified"],
            },
            {
                name: "es6 require part 1",
                fingerprint: esbuildFPs.es6RequiredPart1,
                implies: ["es6"],
            },
            {
                name: "es6 require part 2",
                fingerprint: esbuildFPs.es6RequiredPart2,
                implies: ["es6"],
            },
            {
                name: "es6 require part 1 minified",
                fingerprint: esbuildFPs.es6RequireMinPart1,
                implies: ["es6"],
            },
            {
                name: "es6 require part 2 minified",
                fingerprint: esbuildFPs.es6RequireMinPart2,
                implies: ["es6"],
            },
        ],
    },
};

module.exports = { FP };
