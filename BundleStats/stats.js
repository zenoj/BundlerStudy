const fs = require("fs").promises;
const path = require("path");
const {parseBundle} = require( "../BundlerStats/QuantifyStats");

async function runStats(topPath, outPath) {
    let npmModules = {}
    /*
    separate between first and third party
     */
    /*
    report obj:
    bundle_size
    number Bundles
    number ModuleIds

    TotalSize of modules
    number of Modules
    module-Frequency split after sizes

    number of Root Modules
    root module - Frequency split after sizes

    List of npm modules with frequencies

     */
    let tmp = topPath.split("/");
    let outName = tmp[tmp.length -2];
    // starting at TopX, go through each package and write bundle report for each bundle
    let domainPath
    const totalReport = {};
    const firstPartyReport = initReportObj()
    const thirdPartyReport = initReportObj()
    const srcMapReport1p = initSourcemapStats();
    const srcMapReport3p = initSourcemapStats();
    for (const domain of await fs.readdir(topPath)) {
        domainPath = path.join(topPath, domain);
        if(domain === "bundleStats.json"){
            continue;
        }
        for (const bundle of await fs.readdir(domainPath)) {
            if (!bundle.endsWith("_webpack_report.json")) {
                continue;
            }
            let b = await fs.readFile(path.join(domainPath, bundle));
            let jObj;
            try{
                jObj = JSON.parse(b);
            } catch (e) {
                continue;
            }
            let tmpReport
            // split between first and third party
            if(jObj.isFirstParty){
                tmpReport = firstPartyReport;
            } else {
                tmpReport = thirdPartyReport;
            }
            // populate report
            tmpReport["bundleSize"] += jObj["bundleSize"];
            tmpReport["numberBundles"]++;
            if(jObj.moduleObjType === "NONE"){
                continue
            }
            if(jObj.moduleObjType === "MODULE_LIST"){
                tmpReport["numberOfModuleLists"]++;
                tmpReport["numberModules"] += Object.keys(jObj["moduleObj"]).length;
                Object.values(jObj["moduleObj"]).forEach(obj =>{
                    tmpReport["totalSizeModules"] += obj.size;
                });

            } else if(jObj.hasSourceMap){
                let srcMapReport;
                if(jObj.isFirstParty){
                    srcMapReport = srcMapReport1p;
                } else {
                    srcMapReport = srcMapReport3p;
                }
                srcMapReport["numberBundles"]++;
                makeSourcemapStats(jObj, srcMapReport);
            } else if(jObj.hasModuleIds){
                tmpReport["numberModuleIds"]++;
                continue;
            } else if(jObj.moduleObjType === "DEPENDENCY_TREE"){
                tmpReport["numberOfDepTrees"]++;
                makeDepTreeAnalysis(jObj.moduleObj, tmpReport, false);
            }
        }
    }
    let allReport = {
        "firstPartyStats": firstPartyReport,
        "thirdPartyStats": thirdPartyReport,
        "firstPartySourcemaps": srcMapReport1p,
        "thirdPartySourcemaps": srcMapReport3p
    }
    let data = JSON.stringify(allReport, null, 4);
    await fs.writeFile(path.join(outPath, outName+"bundleStats.json"), data);
}


function initReportObj(){
    let report = {
        // all stats
        "numberBundles":0,
        "bundleSize" :0,
        "numberModuleIds": 0,
        // module stats
        "numberOfModuleLists":0,
        "totalSizeModules":0,
        "numberModules":0,
        // only for dependency tree without sourcemap
        // root module stats
        "numberOfDepTrees":0,
        "numberRootModules": 0,
        "subModules":0,
        "totalSubmoduleSize":0,
    }
    return report;
}

// takes care of
/*
        "totalSizeModules":0,
        "numberModules":0,
        "moduleFreq",
        // root module stats
        "numberRootModules",
        "rootModuleFreq"
 */
function makeDepTreeAnalysis(obj, tmpReport, hasSourcemap){
    if(Object.keys(obj).length === 0){
        return
    }
    // number of modules
    let mObj = obj;
    let rootModules = [];
    let modules = new Map();
    for (const [roots, deps] of Object.entries(mObj)) {
        tmpReport["numberRootModules"]++;
        let sizeRootModule = 0;
        for (let [mod, size] of Object.entries(deps)) {
            if(!hasSourcemap){
                size = size["size"];
            }
            modules.set(mod, size);
        }
    }
    for (const [mod,size] of modules.entries()) {
        if(!hasSourcemap){
            tmpReport["subModules"]++;
            tmpReport["totalSubmoduleSize"] += size;
        }
        tmpReport["numberModules"]++;
        tmpReport["totalSizeModules"] += size;
    }
}

function initSourcemapStats(){
    let report = {
        numberBundles:0,
        "firstParty":{
            "numberModules":0,
            "totalSizeModules":0,
            "numberRootModules":0,
        },
        "thirdParty":{
            "numberModules":0,
            "totalSizeModules":0,
            "numberRootModules":0,
        },
        // library stats
        "npmModules":{
            "rootModules":{},
            "modules": {},
        }
    }
    return report;
}

function makeSourcemapStats(jObj, srcMapReport){
    let ThirdParty = jObj["moduleObj"]["ThirdParty"];
    let FirstParty = jObj["moduleObj"]["FirstParty"];

    makeDepTreeAnalysis(ThirdParty, srcMapReport["thirdParty"], true);
    // handle first party list
    // count first party modules, module size and root modules
    // find related modules, module path are only different in the last part of path
    // count root modules
    let relationTree = {}
    for (const [mod, size] of Object.entries(FirstParty)) {
        let parts = mod.split("/");
        if(parts.length < 2){
            relationTree[mod] = size;
            continue;
        }
        let modulePackage = parts[parts.length - 2];
        if(!relationTree.hasOwnProperty(mod)){
            relationTree[modulePackage] = {};
        }
        relationTree[modulePackage][mod] += size;
        srcMapReport["firstParty"]["numberModules"]++;
        srcMapReport["firstParty"]["totalSizeModules"] += size;
    }
    srcMapReport["firstParty"]["numberRootModules"] += Object.keys(relationTree).length
    // lastly library stats
    for (const [root, deps] of Object.entries(ThirdParty)) {
        if(!srcMapReport["npmModules"]["rootModules"].hasOwnProperty(root)){
            srcMapReport["npmModules"]["rootModules"][root] = 0;
        }
        srcMapReport["npmModules"]["rootModules"][root]++;
        for (const [name, size] of Object.entries(deps)) {
            if(!srcMapReport["npmModules"]["modules"].hasOwnProperty(name)){
                srcMapReport["npmModules"]["modules"][name] = 0;
            }
            srcMapReport["npmModules"]["modules"][name]++;
        }
    }
}




(async (perDomainDir, outdir)=>{
   await runStats(perDomainDir, outdir);
})("/home/jay/thesis/analysis/Results/test/perDomain/top10/", "/home/jay/thesis/analysis/Results/test/stats")

 // (async (perDomainDir, outpath)=>{
 //     await runStats(perDomainDir, outpath);
 // })(process.argv[2], process.argv[3])
