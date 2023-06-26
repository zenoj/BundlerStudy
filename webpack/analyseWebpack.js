const fs = require("fs");
const parser = require("acorn");
const codegen = require("escodegen");
const extractMO4 = require("./extractModuleObjectWP4");
const extractMO5 = require("./extractModuleObject");
const {find_r_d_Usages} = require("./ExtractHelperFuncs");
const {showQuantityInCategories, buildCategories, writeQuantityToFile} = require("./statistik/prepareStatistics");
const aggregateQuantityInCategory = require("./statistik/averageStatistiks");
const {perBundleSpacePerCategory, sumUpSCCsSizes, prepareSCCsForStatistic, divideSCCsIntoThirdParty, combineFirstParty,
    combineSecondParty
} = require("./statistik/perBundleStatistics");
const {findWebpackRequireFunction} = require("./ExtractHelperFuncs");
const {BuildSCC, getResultObjectGroupedBySCCs} = require("./BuildDependencyTree/webpack5");
const {sourceMapGrabber} = require("../sourcemaps/sourcemaps");
const {buildSCCFromModulePaths} = require("./BuildDependencyTree/webpack4");

async function analyseBundle(url, file) {
    let oldQuantity = {small: 0, medium: 0, big: 0};
    let bundleReport = {};
    let data;
    let ast;
    try {
        ast = parser.parse(file, {ecmaVersion: 2020});
    } catch (e) {
        // console.log(file, "could not be parsed");
        return bundleReport;
    }
    let moduleObject = extractMO5(ast);
    // start further analysis
    // what to return? map with => module_name:module_size
    if (moduleObject[1]) {
        let modObj = moduleObject[0];
        bundleReport["moduleObject"] = "webpack5";

        let resultObject = calculateModuleToSizeWP5(modObj);
        bundleReport["moduleList"] = resultObject;
        // detect if the module names are preserved.
        bundleReport["moduleNamesPreserved"] = detectModuleNamesWP5(modObj);
        let SCCs = BuildSCC(modObj);
        let SCCsToSize = getResultObjectGroupedBySCCs(resultObject, SCCs);
        bundleReport["SCCsToSize"] = SCCsToSize;

        // when module Ids are enabled, we further split the bundle into first and third party libraries
        let summedUpSizesSCCs = sumUpSCCsSizes(SCCsToSize);
        if (bundleReport["moduleNamesPreserved"]) {
            let divided = divideSCCsIntoThirdParty(summedUpSizesSCCs);
            let firstPartyCombined = combineFirstParty(divided);
            bundleReport["groupByFirstAndThirdParty"] = combineSecondParty(firstPartyCombined);
        } else {
            bundleReport["groupByFirstAndThirdParty"] = {};
        }
        return [bundleReport, true];
    } else {
        // try to find module object following webpack 4 syntax
        moduleObject = extractMO4.FindModuleObjectWebpack4(ast);
        if (moduleObject[1]) {
            let modObj = moduleObject[0];
            bundleReport["moduleObject"] = "webpack4";
            if (moduleObject[2] === "Array") {
                modObj = makeArrayToObject(modObj);
            }
            bundleReport["moduleList"] = calculateModuleToSizeWP5(modObj);
            // look for sourcemaps

            // in case of an object try to detect preserved module Ids and construct compartments
            bundleReport["moduleNamesPreserved"] = detectModuleNamesWP5(modObj);
            if (bundleReport["moduleNamesPreserved"]) {
                bundleReport["groupByFirstAndThirdParty"] = buildSCCFromModulePaths(modObj)
            } else {
                bundleReport["groupByFirstAndThirdParty"] = {};
            }
            return [bundleReport, true];
        } else {
            // console.log(file, " :analysis failed");
            return [{}, false];
        }
    }
}

function detectModuleNamesWP5(obj){
    for (const objElement of obj) {
        if(objElement.key.raw.includes("/modules/")) {
            return true;
        }
    }
    return false;
}



function calculateModuleToSizeWP5(modObj){
    const byteSize = str => Buffer.byteLength(str)
    let resultObj = {};
    let moduleName, moduleCode;
    for (const modObjElement of modObj) {
        moduleName = modObjElement.key.raw;
        moduleCode = modObjElement.value;
        if(!moduleCode){}
        let scriptString = codegen.generate(moduleCode);
        resultObj[moduleName] = {size:byteSize(scriptString)};
    }
    return resultObj;
}


function make_r_d_AnalaysisObj(modObj, moduleToSizeMapping, file){
    let foundNamedExports = false;
    for (const modObjElem of modObj) {
        const key = modObjElem.key;
        const code = modObjElem.value;
        let resultMapping = find_r_d_Usages(code);
        if(Object.keys(resultMapping).length !== 0){
            foundNamedExports = true;
        }
        moduleToSizeMapping[key.raw]["functionMapping"] = resultMapping;
    }
    return foundNamedExports;
}

function makeArrayToObject(array){
    let resultArray = [];
    let counter = 0;
    for (const arrayElement of array) {
        if(!arrayElement){
            continue
        }
        let element = {key:{raw:counter.toString()},value:arrayElement}
        resultArray.push(element)
        counter++;
    }
    return resultArray;
}

function regenerateCode(ast){
    return codegen.generate(ast)
}

module.exports = {analyseBundle, regenerateCode}