const subs = require('../subSearch.js');
// import fingerprints
const esbuild = require('../Fingerprints/esbuild.js');
const browserify = require('../Fingerprints/browserify.js');
const parcel = require('../Fingerprints/parcel.js');
const rollup = require('../Fingerprints/rollup.js');
const webpack = require('../Fingerprints/Webpack.js');
const parser = require("acorn");
const yargs = require('yargs');
const fs = require("fs/promises");

let keywords = ["require", "exports"];

// const DetectionFPS = [webpack.FP, esbuild.FP, browserify.FP, parcel.FP, rollup.FP]
const DetectionFPS = [webpack.FP]

async function detect(filecontent){
    let bigAst;
    let currentFile = file;
    try {
        bigAst = parser.parse(currentFile.toString(), {ecmaVersion:2020}).body
    } catch (e) {
        console.log("\nAn error occured during parsing the file: ", e);
        return [false, "", ""];
    }
    if(bigAst === undefined){
        console.log("\nFile is empty or parsing failed");
        return [false, "", ""];
    }
    // apply detection fingerprints to one file
    for (const FP of DetectionFPS) {
        // let properties = [];
        for (let f of FP.detection) {
            let smallAst = parser.parse(f.fingerprint, {ecmaVersion:2020}).body;
            if (subs.subStringSearcher(smallAst, bigAst, keywords)){
                return [true, FP.name, f.name]
            }
        }
    }
    return [false, "", ""]
}


(async () => {
    var args = yargs(process.argv.slice(2))
    .usage('Usage: $0 -f filepath [options]')
    .example('$0 -f bundle.js', 'detect if a js file is a bundle.')
    .alias('f', 'file')
    .array('f')
    .describe('f', 'read bundle from file')
    .demandOption(['f'])
    .alias('b', 'bundlers')
    .array('b')
    .default('b', ['webpack', 'parcel', 'rollup', 'esbuild', 'browserify'])
    .describe('b', 'list of bundlers to check for. Specified in fingerprints file')
    .alias('fp', 'fingerprint filepath')
    .default('fp', '../Fingerprints')
    .describe('fp', 'path to custom fingerprints file')
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2023')
    .argv;

    // read files one by one and run detect on them
    let filepaths = args.f;
    for (const file of filepaths) {
        let b = await fs.readFile()
        let res = await detect(b);
        if(res[0]){
            console.log(`File:${file} matches with ${res[2]} fingerprint which indicates bundler:${res[1]}`)
        }
        console.log(`No fingerprint matched file: ${file}`)
    }
})()

module.exports = {detect}