// make a crawler that takes a js file, and tries to match a sourcemapurl.
// it then tries to access the sourcemap
// we distinguish between remote and local sourcemaps
// we start with remote
// sourcemap examples:
// sourceURL=webpack://webpack/./node_modules/lodash/_baseGetTag.js?
// sourceURL=webpack-internal:///./node_modules/jquery/dist/jquery.js\n"
// sourceMappingURL=data:application/json;charset=utf-8;base64,
const https = require("https");
const fs = require("fs");
const axios = require('axios');
const codegen = require("escodegen");


async function sourceMapFinder(sourceFile, url){

    let inlineSourceMapString = "sourceMappingURL=data:application/json;charset=utf-8;base64,";
    let sourceMapReference = "//# sourceMappingURL=";
    // try to parse inline sourcemap
    let sourceMap = "";
    if(sourceFile.includes(inlineSourceMapString)){
        sourceMap = sourceFile.toString().split(inlineSourceMapString)[1];
        sourceMap = sourceMap.trim();
        try {
            sourceMap = atob(sourceMap);
            sourceMap = JSON.parse(sourceMap);
        } catch (e) {
            return [{}, false]
        }
    } else if(sourceFile.includes(sourceMapReference)){
        sourceMap = sourceFile.toString();
        sourceMap = sourceMap.split(sourceMapReference)[1];
        sourceMap = sourceMap.trim();
        // visit url to grab source map
        // find last occurence of "/"
        try{
        if(isRelativePath(sourceMap)){
            if(!url.includes("/")){
                url = url + "/";
            }
            let lastIndex = url.lastIndexOf("/");
            sourceMap = url.substring(0,lastIndex + 1) + sourceMap;
        }
        } catch (e) {
            return [{}, false];
        }

        await axios.get(sourceMap)
            .then(res => {
                if(res.status !== 200){
                    return [{}, false];
                }
                sourceMap = res.data;
            })
            .catch(error => {
                return [{}, false];
            });


    } else{
        return [{}, false];
    }
    if(!sourceMap.hasOwnProperty("sources")){
        return [{}, false];
    }
    let includedModules = sourceMap["sources"];
    // shorten the path
    let shortenedModules = [];
    for(let module of includedModules){
        if(module.includes("webpack://")){
            module = module.split("webpack://")[1]
        }
        shortenedModules.push(module);
    }
    const obj = {};

    let sourcesContent = [];
    if(sourceMap.hasOwnProperty("sourcesContent")){
        sourcesContent = sourceMap["sourcesContent"];
        shortenedModules.forEach((element, index) => {
            obj[element] = sourcesContent[index];
        });
    } else {
        shortenedModules.forEach((element, index) => {
            obj[element] = "";
        })
    }
    return [createSCCsToSizeFromSourceMap(obj), true];
}


function createSCCsToSizeFromSourceMap(obj){
    // split into third and first party
    const byteSize = str => Buffer.byteLength(str);
    let firstParty = {};
    let thirdParty = {};
    for (const [name, code] of Object.entries(obj)) {
        if(name.includes("node_modules")){
            let moduleName = name.split("node_modules/")[1];
            let parentModuleName = moduleName.substring(0,moduleName.indexOf("/"));
            if(!thirdParty.hasOwnProperty(parentModuleName)){
                thirdParty[parentModuleName] = {};
            }
            thirdParty[parentModuleName][moduleName] = byteSize(code);
        } else{
            firstParty[name] = byteSize(code);
        }
    }
    return {"FirstParty": firstParty, "ThirdParty": thirdParty};
}

function isRelativePath(url){
    return !url.includes("/");
}




module.exports = {sourceMapFinder};
