const codegen = require("escodegen");

function buildSCCFromModulePaths(modObj){
    // split into third and first party
    const byteSize = str => Buffer.byteLength(str)
    let firstParty = {};
    firstParty["numberOfModules"] = 0;
    firstParty["moduleSize"] = 0;
    let thirdParty = {};
    for (const [name, code] of Object.entries(modObj)) {
        if(name.includes("node_modules")){
            let moduleName = name.split("node_modules/")[1];
            let parentModuleName = moduleName.substring(0,moduleName.indexOf("/"));
            if(!thirdParty.hasOwnProperty(parentModuleName)){
                thirdParty[parentModuleName] = {};
            }
            thirdParty[parentModuleName][moduleName] = byteSize(codegen.generate(code));
        } else{
            firstParty["numberOfModules"]++;
            firstParty["moduleSize"] += byteSize(codegen.generate(code));
        }
    }
    return {"FirstParty": firstParty, "ThirdParty": thirdParty};
}

module.exports = {buildSCCFromModulePaths}