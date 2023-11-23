const subs = require('../subSearch.js');
// import fingerprints
const esbuild = require('../Fingerprints/esbuild.js');
const browserify = require('../Fingerprints/browserify.js');
const parcel = require('../Fingerprints/parcel.js');
const rollup = require('../Fingerprints/rollup.js');
const webpack = require('../Fingerprints/Webpack.js');
const parser = require("acorn");
let keywords = ["require", "exports"];
const args = require('yargs').argv;

// const DetectionFPS = [webpack.FP, esbuild.FP, browserify.FP, parcel.FP, rollup.FP]
const DetectionFPS = [webpack.FP]

function detect(files){
    // try to match fingerprints from fingerprints.json
    let report = {};
    // report["bundles"] = []; // list of bundles just for some naming statistics and debugging.
    for (const [fileName,file] of files.entries()) {
        let bigAst;
        let currentFile = file;
        try {
            bigAst = parser.parse(currentFile.toString(), {ecmaVersion:2020}).body
        } catch (e) {
            // console.log(fileName, " raised following exception: ", e)
            continue;
        }
        if(bigAst === undefined){
            continue;
        }
        // apply detection fingerprints to one file
        let already_detected = false;
        for (const FP of DetectionFPS) {
            if(already_detected) break;
            // let properties = [];
            for (let f of FP.detection) {
                let smallAst = parser.parse(f.fingerprint, {ecmaVersion:2020}).body;
                if (subs.subStringSearcher(smallAst, bigAst, keywords)){
                    // in each file we find something, we add it to the properties
                    if(!(FP.name in report)){
                        report[FP.name] = [];
                    };
                    report[FP.name].push(fileName);
                    // report["bundles"].push(fileName);
                    already_detected = true;
                    break;
                    // properties = properties.concat(f.implies);
                    // console.log(`${key} --> ${FP.name}:Matching fingerprint:"${f.name}" suggests presence of ${f.implies}`);
                }
            }

        }

    }
    return report;
}

module.exports = {detect}