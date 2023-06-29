const fs = require("fs");
const parser = require("acorn");
const wp5Finder = require("../../bundleAnalysis/extractModuleObject");

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

function extractModuleCodeWP5FromCustomFormat() {
    let filepath = process.argv[2];
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
    if (res[1] && res[0].length > 0) {
        console.log("success");
    }
}

extractModuleCodeWP5FromCustomFormat();
