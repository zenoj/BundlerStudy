const extractModules = require("../../bundleAnalysis/extractModules");
const extractFeatures = require("../../bundleLibraries/extract.js");
const fs = require("fs");
const glob = require("glob");
const { argv } = require("process");

function intersection(setA, setB) {
    return new Set([...setA].filter((x) => setB.has(x)));
}

var getFeatureFiles = function (src) {
    return glob.globSync(src + "/**/bundle.jsfeatures", handleErrors);
};

function mergeFeatures(obj1, obj2) {
    let obj3 = {};
    for ([key, value] of Object.entries(obj1)) {
        if (key === "thisUsages") {
            obj3[key] = value;
            obj3[key] = obj3[key] + obj2[key];
            continue;
        }
        obj3[key] = value;
        obj3[key] = obj3[key].concat(obj2[key]);
    }
    return obj3;
}

function handleErrors(err, res) {
    if (err) {
        console.log("Error", err);
    } else {
        console.log(res);
    }
}

function writeFeaturesOfModules() {
    isCustomBundleFormat = true;
    filePath = argv[2];
    outPath = argv[3];
    // extract code
    let name = filePath.split("/")[filePath.split("/").length - 1];
    fs.mkdirSync(`${outPath}/${name}`, { recursive: true });
    let code;
    if (isCustomBundleFormat) {
        code = extractModules.extractModuleCodeWP5FromCustomFormat(filePath);
    }
    rootModules = {};
    if (!code[1]) {
        return;
    }
    // extract features of each root module
    for (const [rootModKey, rootMod] of Object.entries(code[0])) {
        // extract and merge features of each module belonging to the root module
        rootModFeatures = {
            stringLiterals: [],
            numbers: [],
            instanceofInst: [],
            methodnames: [],
            classAttributesThis: [],
            thisUsages: 0,
        };
        for (const [modKey, module] of Object.entries(rootMod)) {
            let res = extractFeatures(module);
            rootModFeatures = mergeFeatures(rootModFeatures, res);
        }
        let obj = JSON.stringify(rootModFeatures);
        fs.writeFileSync(`${outPath}/${name}/${rootModKey}_features.json`, obj);
    }
}

writeFeaturesOfModules();
