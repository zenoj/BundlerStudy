const {parseBundle} = require("../BundlerStats/QuantifyStats");
const {prepareForStatistic} = require("../webpack/statistik/perBundleStatistics");
const fs = require('fs').promises
async function prepare(filePath){
    let fileContent = (await fs.readFile(filePath)).toString();
    let sourcemapString = parseBundle(fileContent)["srcMaps"];
    let sourcemapObj = JSON.parse(sourcemapString);
    let obj = sumUpThirdParty(sourcemapObj);
    let resultObj = prepareForStatistic(obj);

    // await fs.writeFile( filePath+ "_SCCsSummedUpSize.txt", JSON.stringify(resultObj, null, 4))
}

async function prepareFlatBundle(filePath){
    let fileContent = (await fs.readFile(filePath)).toString();
    let sourcemapString = parseBundle(fileContent)["srcMaps"];
    let sourcemapObj = JSON.parse(sourcemapString);
    let obj = flattenRootModules(sourcemapObj);
    let resultObj = prepareForStatistic(obj);
    await fs.writeFile( filePath+ "_FlatBundle.txt", JSON.stringify(resultObj, null, 4))

}

(async (filePath)=>{
    let files = [
        "/home/jay/WebstormProjects/scraper/sweetBundles/www.obo.de_out_obo_src_js_app.bundle.js_webpack",
        "/home/jay/WebstormProjects/scraper/sweetBundles/www.purefishing.jp_common_js_bundle.js_webpack",
        "/home/jay/WebstormProjects/scraper/sweetBundles/www.queenslandballet.com.au_dist_bundle.js_webpack",
        "/home/jay/WebstormProjects/scraper/sweetBundles/www.r-g.de_resources_js_bundle.js_webpack",
        "/home/jay/WebstormProjects/scraper/sweetBundles/www.readshop.nl_client_4.30.0_bundle.js_webpack",
        "/home/jay/WebstormProjects/scraper/sweetBundles/www.sharedcount.com_js_bundle.js_webpack",
        "/home/jay/WebstormProjects/scraper/sweetBundles/www.she.com_assets-2021_js_bundle.js_webpack"
    ]
    for (const file of files) {
        await prepareFlatBundle(file);
    }
})("/home/jay/WebstormProjects/scraper/sweetBundles/www.mywot.com_scripts_misc.bundle.js_webpack")

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