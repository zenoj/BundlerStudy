const parser = require("acorn");
const fs = require("fs");
const {
    BuildSCC,
} = require("/home/jay/thesis/BT/webpack/BuildDependencyTree/webpack5");
const wp5Finder = require("./extractModuleObject");
const { regenerateCode } = require("../../BT/webpack/analyseWebpack");

function extractModuleCodeWP5FromCustomFormat(filepath) {
    let ast;
    let buf = fs.readFileSync(filepath);
    let bundleStr = parseBundle(buf.toString())["srcCode"];
    try {
        ast = parser.parse(bundleStr, { ecmaVersion: 2020 });
    } catch (e) {
        // console.log(file, "could not be parsed");
        return [{}, false];
    }
    // try to parse moduleObj with webpack4 and webpack5 fingerprints
    let res = wp5Finder(ast);
    let obj = res[0];
    let ok = res[1];
    if (ok) {
        let SCCs = BuildSCC(obj);
        let code = collectCode(SCCs, obj);
        return [code, true];
    } else {
        return [{}, false];
    }
}

function orderSCCs(positions, SCCs) {
    function compareModules(modA, modB) {
        return positions[modA] - positions[modB];
    }
    let orderedSCCsObj = {};
    for ([key, value] of SCCs.entries()) {
        let moduleArray = Array.from(value);
        orderedSCCsObj[key] = moduleArray.sort(compareModules);
    }
    return orderedSCCsObj;
}

function extractModuleCodeWP5(filepath) {
    let ast;
    let buf = fs.readFileSync(filepath);
    let bundleStr = buf.toString();
    try {
        ast = parser.parse(bundleStr, { ecmaVersion: 2020 });
    } catch (e) {
        // console.log(file, "could not be parsed");
        return [{}, false];
    }
    // try to parse moduleObj with webpack4 and webpack5 fingerprints
    let res = wp5Finder(ast);
    let obj = res[0];
    // map modules to position in bundle
    let positions = {};
    for (let i = 0; i < obj.length; i++) {
        positions[obj[i].key.raw] = i;
    }
    let ok = res[1];

    if (ok) {
        let SCCs = BuildSCC(obj);
        let orderedSCCs = orderSCCs(positions, SCCs);
        let code = collectCode(orderedSCCs, obj);
        return [code, true];
    } else {
        return [{}, false];
    }
}

function parseBundle(src) {
    let url = src
        .split("<<123FileNameStart456>>>")[1]
        .split("<<<123FileNameEnd!56>>>")[0];
    let srcCode = src
        .split("<<<123FileSourceStart!56>>>")[1]
        .split("<<<123FileSourceEnd!56>>>")[0];
    let srcMaps = "";
    if (src.includes("<<<123SourceMapStart!56>>>")) {
        srcMaps = src
            .split("<<<123SourceMapStart!56>>>")[1]
            .split("<<<123SourceMapEnd!56>>>")[0];
    }
    return { url: url, srcCode: srcCode, srcMaps: srcMaps };
}

function makeNodeObjValueObj(modObj) {
    let res = {};
    for (const modElem of modObj) {
        let code = modElem.value;
        let k = modElem.key.raw;
        res[k] = code;
    }
    return res;
}

function collectCode(SCC, modObj) {
    let obj = makeNodeObjValueObj(modObj);
    const SCCsCode = {};
    for ([scc, v] of SCC.entries()) {
        SCCsCode[scc] = {};
        for (n of v) {
            SCCsCode[scc][n] = obj[n];
        }
    }
    return SCCsCode;
}

// function TestExtraction(dir){
//     for (file of fs.readdirSync(dir)){
//         let res = extractModuleCodeWP5(dir + file)

//     }
// }

// TestExtraction("/home/jay/github/LibraryDetection/someBundles/sourcemapBundles/")

module.exports = { extractModuleCodeWP5, extractModuleCodeWP5FromCustomFormat };
