const path = require("path");
const {parseBundle} = require("../BundlerStats/QuantifyStats");
const {analyseBundle} = require("../webpack/analyseWebpack");
const fs = require('fs').promises;

async function runWebpackAnalysis(topPath){
    /*
    report obj:
    bundle_size
    has_sourcemap = boolean
    is_first_Party = boolean
    dependency tree / flat tree in case of wp4
    moduleObj_type = "none" || "dependency_tree" || "MODULE_LIST"
    has_module_ids = boolean

     */

    // go through each package and write bundle report for each bundle
    let domainPath
    for (const domain of await fs.readdir(topPath)) {
        domainPath = path.join(topPath, domain);
        for (const bundle of await fs.readdir(domainPath)) {
            const report = {};
            if(!bundle.endsWith("_webpack")){
                continue;
            }
            let b = await fs.readFile(path.join(domainPath, bundle));
            let pBundle = parseBundle(b.toString())
            // compute filesize
            report["bundleSize"]= Buffer.from(pBundle["srcCode"]).length
            // check if first or third-party
            report["isFirstParty"] = isFirstParty(pBundle["url"], domain);
            // check for sourcemap
            report["hasSourceMap"] = pBundle["srcMaps"] !== "";
            // stop if sourcemap is detected
            if(report["hasSourceMap"]){
                report["moduleObjType"] = "DEPENDENCY_TREE";
                report["hasModuleIds"] = false;
                report["moduleObj"] = JSON.parse(pBundle["srcMaps"]);
                await fs.writeFile(path.join(domainPath, bundle + "_report.json"), JSON.stringify(report));
                continue;
            } 
            // do module obj analysis
            let analysisResult = await analyseBundle(pBundle["url"], pBundle["srcCode"]);
            // analysis successful
            if(analysisResult[1]){
                let obj = analysisResult[0];
                // module ids enabled
                if(Object.keys(obj["groupByFirstAndThirdParty"]).length > 0) {
                    report["moduleObjType"] = "DEPENDENCY_TREE"
                    report["hasModuleIds"] = true;
                    report["moduleObj"] = obj["groupByFirstAndThirdParty"];
                } else{
                    report["hasModuleIds"] = false;
                    // look for SCCs obj
                    if(obj.hasOwnProperty("SCCsToSize")){
                        report["moduleObjType"] = "DEPENDENCY_TREE";
                        report["moduleObj"] = obj["SCCsToSize"];
                    } else {
                        // else we only have a module list
                        report["moduleObjType"] = "MODULE_LIST";
                        report["moduleObj"] = obj["moduleList"];
                    }
                }

            } else {
                // analysis failed
                report["moduleObjType"] = "NONE";
            }
            await fs.writeFile(path.join(domainPath, bundle + "_report.json"), JSON.stringify(report));
        }
    }
}

function isFirstParty(url, domain){
    let fileDomain = urlToDomain(url)
    let d = shortenDomain(domain)
    if (fileDomain === d) {
        return true
    } else {
        return false;
    }
}

function shortenDomain(domain){
    let a = domain.split(".");
    return a[a.length-2];
}

function urlToDomain(url) {
    let withoutProtocol = url.replace(/http[s]?:\/\//g,"");
    let withoutPath = withoutProtocol.split("/")[0];
    let a = withoutPath.split(".");
    return a[a.length-2];
}

const filepath = ""
(async (a) => {
    await runWebpackAnalysis(a)
})(filepath);
