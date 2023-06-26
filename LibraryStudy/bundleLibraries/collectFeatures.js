const { dir } = require("console");
const fs = require("fs");
const path = require("path");
const extract = require("./extract");
const parser = require("acorn");

function traverseModules(dirPath, fileNamePattern, mapFunction) {
    dirs = [dirPath];
    arrayOfFiles = [];
    while (dirs.length !== 0) {
        let dir = dirs.pop();
        let files = fs.readdirSync(dir);
        for (const file of files) {
            let filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                dirs.push(filePath);
            } else {
                if (fileNamePattern(file)) mapFunction(filePath);
            }
        }
    }
}

function writeFeatures(filePath) {
    let buf = fs.readFileSync(filePath);
    let bundleStr = buf.toString();
    try {
        ast = parser.parse(bundleStr, { ecmaVersion: 2020 });
    } catch (e) {
        // console.log(file, "could not be parsed");
        return [{}, false];
    }
    let features = extract(ast);
    let featureStr = JSON.stringify(features, null, 4);
    fs.writeFileSync(filePath + "features", featureStr);
}

function isBundle(file) {
    return file === "bundle.js";
}

function collectFeatures() {
    traverseModules(process.argv[2], isBundle, writeFeatures);
}

collectFeatures();
