const {parseBundle} = require("../BundlerStats/QuantifyStats");
const {prepareForStatistic} = require("../webpack/statistik/perBundleStatistics");
const fs = require('fs').promises
async function prepare(filePath){
    let fileContent = (await fs.readFile(filePath)).toString();
    let sourcemapString = parseBundle(fileContent)["srcMaps"];
    let sourcemapObj = JSON.parse(sourcemapString);
    let obj = sumUpThirdParty(sourcemapObj);
    let resultObj = prepareForStatistic(obj);

}

async function prepareFlatBundle(filePath){
    let fileContent = (await fs.readFile(filePath)).toString();
    let sourcemapString = parseBundle(fileContent)["srcMaps"];
    let sourcemapObj = JSON.parse(sourcemapString);
    let obj = flattenRootModules(sourcemapObj);
    let resultObj = prepareForStatistic(obj);
    await fs.writeFile( filePath+ "_FlatBundle.txt", JSON.stringify(resultObj, null, 4))

}


function sumUpThirdParty(obj){
    let thirdParty = obj["ThirdParty"];
    let summedUpThirdParty = {}
    for (const [root, deps] of Object.entries(thirdParty)) {
        summedUpThirdParty[root] = 0;
        for (const [module, size] of Object.entries(deps)) {
            summedUpThirdParty[root] += size;
        }
    }
    summedUpThirdParty["firstParty"] = obj.FirstParty.moduleSize;
    return summedUpThirdParty;
}

function flattenRootModules(moduleObj){
    // go through each root module and add module name and size to list
    let flatmap = {}
    let counter = 1;
    flatmap[0] = moduleObj["FirstParty"]["moduleSize"];
    for (const [root, deps] of Object.entries(moduleObj["ThirdParty"])) {
        for (const [name, size] of Object.entries(deps)) {
            flatmap[counter] = size;
            counter++;
        }
    }
    return flatmap;
}

function flattenRootModulesKeepId(moduleObj){
    // go through each root module and add module name and size to list
    let flatmap = {}
    //let counter = 1;
    // flatmap[0] = moduleObj["FirstParty"]["moduleSize"];
    for (const [root, deps] of Object.entries(moduleObj["ThirdParty"])) {
        for (const [name, size] of Object.entries(deps)) {
            flatmap[name] = size;
            //counter++;
        }
    }
    return flatmap;
}

module.exports = {flattenRootModulesKeepId};