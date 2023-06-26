const fs = require("fs").promises;
const path = require("path");
const {parseBundle} = require("../BundlerStats/QuantifyStats");
// collect all evil files to compare to


async function collect(topPath, outPath){
    let resultObj = {}
    let b = await fs.readFile("/home/jay/BT/vulnLibraries/merged.json")
    let file = JSON.parse(b.toString())
    let vulnLibraries = Object.keys(file);
    let domainPath;
    let domainsToRecrawl = {};
    for (const domain of await fs.readdir(topPath)) {
        if(domain === "bundleStats.json"){
            continue
        }
        let domainPath = path.join(topPath, domain);
        for (const filename of await fs.readdir(domainPath)) {
            if (!filename.endsWith("_webpack_report.json")) {
                continue;
            }
            let buffer = await fs.readFile(path.join(domainPath, filename));
            let bundle = JSON.parse(buffer.toString());

            if(bundle["hasSourceMap"]){
                let ThirdParty = bundle["moduleObj"].ThirdParty;
                if(Object.keys(ThirdParty).length === 0){
                    continue;
                }
                let contained = Object.keys(ThirdParty)
                for (const library of contained) {
                    if(vulnLibraries.includes(library)){
                        resultObj[domain] = {"bundleName":filename, "domain": domain, "library":library}
                    }
                }
            }
        }
    }
    let tmp = topPath.split("/");
    let filename = tmp[tmp.length - 2];
    let outFilePath = path.join(outPath, filename + "_vulnDomains.json");
    await fs.writeFile(outFilePath, JSON.stringify(resultObj, null, 4));
}

 (async (perDomainPath, outPath)=>{
     await collect(perDomainPath, outPath);
})(process.argv[2], process.argv[3]);
// (async (perDomainPath, outPath)=>{
   //  await collect(perDomainPath, outPath);
// })("/home/jay/thesis/analysis/Results/test/perDomain/top10", "/home/jay/thesis/analysis/Results/test/perDomain/wordlists");

// test
