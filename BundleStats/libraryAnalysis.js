const fs = require('fs').promises;
const path = require('path');
const puppeteer = require("puppeteer-extra");

async function mergeLibraryStats(topPath){
    let firstPartyBundles = {}
    let thirdPartyBundles = {}
    for (const file of await fs.readdir(topPath)) {
        if(file === "merged"){
            continue;
        }
        let b = await fs.readFile(path.join(topPath, file));
        let obj = JSON.parse(b.toString());
        let firstPartySourcemaps = obj["firstPartySourcemaps"];
        let thirdPartySourcemaps = obj["thirdPartySourcemaps"];
        for (const [name, freq] of Object.entries(thirdPartySourcemaps.npmModules.rootModules)) {
            if(!thirdPartyBundles.hasOwnProperty(name)){
                thirdPartyBundles[name] = 0;
            }
            thirdPartyBundles[name] += freq;
        }
        for (const [name, freq] of Object.entries(firstPartySourcemaps.npmModules.rootModules)) {
            if(!firstPartyBundles.hasOwnProperty(name)){
                firstPartyBundles[name] = 0;
            }
            firstPartyBundles[name] += freq;
        }
    }

    await fs.writeFile(path.join(topPath, "merged", "all.json"), JSON.stringify({firstPartyBundles, thirdPartyBundles}));
}

async function sortLibraries(firstPartyBundles, thirdPartyBundles){
    let libraries1p = firstPartyBundles;
    
    let libraries = libraries1p;
    let freq = [];
    let keysSorted = Object.keys(libraries1p).sort(function(a,b){return libraries[a]-libraries[b]})
    for (const library of keysSorted) {
        freq.push(libraries[library])
    }

    return [keysSorted, freq];
}


async function getRepForNpmPackage(npmPackage, page){
    let npm_api_prefix = "https://api.npms.io/v2/package/";
    let response;
    try{
        response = await (await page.goto(npm_api_prefix + npmPackage)).text();
        await page.waitFor(20);
    } catch (e) {
        response = {}
        console.log(e)
        return [false, {}];
    }

    const parsedResponse = JSON.parse(response);
    if(!response){return [false, {}]};
    if(!parsedResponse.hasOwnProperty('score')){return [false, {}]}
    const final_score = parsedResponse['score']['final'];
    const quality = parsedResponse['score']['detail']['quality'];
    const popularity = parsedResponse['score']['detail']['popularity'];
    const maintenance = parsedResponse['score']['detail']['maintenance'];
    const dependencies = parsedResponse['collected']['metadata']['dependencies'];
    return [true, {"finalScore": final_score, "quality": quality, "popularity": popularity, "maintenance": maintenance}];
}



async function fetchStatsForLibraries(libraries, page1){
    let reputation = {}
    for (const library of libraries) {
        let tmp = await getRepForNpmPackage(encodeURIComponent(library), page1);
        if(tmp[0]){
            reputation[library] = tmp[1];
        } else {
            reputation[library] = {};
        }

    }
    return reputation
}


async function customStats(filename){

    const browser = await puppeteer.launch({
        headless: true
    });
    let npm_api_prefix = "https://api.npms.io/v2/package/";
    const page = await browser.newPage();
    let b = await fs.readFile(filename);
    let libraryObj = JSON.parse(b.toString());
    let libraries = Object.keys(libraryObj);
    let response;
    let resultObj = {}
    for (const library of libraries) {
        let encodedLibrary = encodeURI(library)
        try{
            let r = await page.goto(npm_api_prefix + encodedLibrary);
            if(!r.ok()){
                continue;
            }
            response = await r.text()
            await page.waitFor(20);
        } catch (e) {
            response = {}
            console.log(e)
            return [false, {}];
        }

        const obj = JSON.parse(response);
        if(!obj){return [false, {}]}
        // get last published
        if(!obj["collected"].hasOwnProperty("metadata") || !obj["collected"]["metadata"].hasOwnProperty("date")){
            continue
        }
        let lastPublished = obj["collected"]["metadata"]["date"]
        // get average daily downloads last month
        if(!obj["collected"].hasOwnProperty("npm") || !obj["collected"]["npm"].hasOwnProperty(["downloads"])){
            continue
        }
        let downloads = obj["collected"]["npm"]["downloads"][2]["count"] / 30
        // merge in general stats
        let score = obj["score"]["final"]
        let popularity = obj["score"]["detail"]["popularity"]
        let quality = obj["score"]["detail"]["quality"]
        let maintenance = obj["score"]["detail"]["maintenance"]
        resultObj[library] = {"score":score, "popularity":popularity, "quality":quality, "maintenance":maintenance, "frequency":libraryObj[library], "lastPublished":lastPublished, "downloads":downloads}
    }
    await fs.writeFile("./wrLibsMoreStats.json",
        JSON.stringify(resultObj), null, 4)
    await page.close();
    await browser.close();

}



(async () => {
    await customStats();

})()