const { Cluster } = require('puppeteer-cluster');
const esprima = require( 'esprima' )
const walk = require( 'esprima-walk' );
const path = require("path");
const urlLists = require("./wordlists");
const {wordLists} = require("./wordlists");

// add stealth plugin and use defaults (all evasion techniques)
// const {detect} = require("./applyFingerPrints");
const {analyseBundle} = require("./webpack/analyseWebpack");
const fs = require("fs");
const {detect} = require("./applyFingerPrints");
const {sourceMapFinder} = require("./sourcemaps/sourcemaps");


(async function run(wordlistDir, targetBaseDir){
    const b = await fs.promises.readFile(wordlistDir);
    // get filename
    let tmp = wordlistDir.split("/");
    let filename = tmp[tmp.length - 1];
    let shortFilename = filename.replace("_recrawl.json", "")
    const obj = JSON.parse(b.toString());
    let trimmed_lines = Object.keys(obj);
    // make output directories
    let targetDir = path.join(targetBaseDir, "perDomain", shortFilename);
    try {
        await fs.promises.mkdir(targetDir);
    } catch (e) {
        console.log(e);
    }
    // await setUp(targetDir);
    let unsuccessful = 0;



    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_BROWSER,
        maxConcurrency: 1,
        monitor: true,
        puppeteerOptions: {
            ignoreHTTPSErrors:true,
        },
    });
    cluster.on('taskerror', (err, data) => {
        console.log(`Error crawling ${data}: ${err.message}`);
    });
    let unresposiveSites = 0;

    await cluster.task(async ({page, data: url}) => {
        unresposiveSites += await crawlDomain(page, url, targetDir);
    });

    for (const url of trimmed_lines) {
        await cluster.queue(url);
    }

    await cluster.idle();
    await fs.promises.writeFile(targetBaseDir + trimmed_lines[0]  + "_unsuccessful.txt", unresposiveSites.toString())

    await cluster.close();
})(process.argv[2], process.argv[3]);

async function crawlDomain(page, url, topPath) {
    const blockedResourceType = [
        'image',
        'media',
    ];
    let scripts = new Map();

    page.on('request', async (request) => {
        let rt = await request.resourceType();
        if (rt in blockedResourceType) {
            await request.abort();
        } else {
            await request.continue();
        }
    })
    page.on('response', async (resp) => {
        // if response body contains js script in body save as value for the respective request.
        try {
            if (resp !== undefined && resp.status() === 200) {
                let response = await resp.text();
                let req_url = resp.url();
                let contentHeader = (await resp.headers())['content-type'];
                if (contentHeader !== undefined) {
                    if (contentHeader.includes("application/javascript") || contentHeader.includes("text/javascript")) {
                        // here goes all the tests
                        scripts.set(req_url, response);
                    }
                }
            }
        } catch (error) {

        }
    });

    await page.setRequestInterception(true);

    // await page1.setRequestInterception(true);
    let fullUrl = "https://" + url;
    let urlPath = path.join(topPath, urlToDomainPath(url));
    await fs.promises.mkdir(urlPath);
    console.log("Visiting:", fullUrl)
    try {
        await page.goto(fullUrl,{timeout:30000});
    } catch (e) {
        console.log(e)
    }
    if(scripts.size === 0){
        return 1;
    }
    let bundlerPath = "";
    let detectedBundles = {};
    detectedBundles = detect(scripts);
    let bundleObject = {};
    let promises = [];
    for (const [bundler, list] of Object.entries(detectedBundles)) {
        for (const bundle of list) {
            let filename = urlToFileName(bundle).slice(0,45);
            bundlerPath = topPath + bundler + "/";
            bundleObject["filename"] = bundle;
            let sourceCode = scripts.get(bundle);
            let sourcemaps = await sourceMapFinder(sourceCode, bundle);
            let data = `<<<123FileNameStart456>>>${bundle}<<<123FileNameEnd!56>>>\n\n<<<123FileSourceStart!56>>>${sourceCode}<<<123FileSourceEnd!56>>>`
            if(sourcemaps[1]){
                data += `\n\n<<<123SourceMapStart!56>>>${JSON.stringify(sourcemaps[0])}<<<123SourceMapEnd!56>>>`
            }
            filename = `${filename}_${bundler}`;
            // promises.push(fs.promises.writeFile(`${bundlerPath}${filename}`, data));
            promises.push(fs.promises.writeFile(`${urlPath}/${filename}`, data));
        }
    }
    await Promise.allSettled(promises);
    scripts.clear();
    return 0;
}


function urlToDomainPath(url) {
    let withoutProtocol = url.replace(/http[s]?:\/\//g,"");
    let withoutPath = withoutProtocol.split("/")[0];
    return withoutPath;
}

function urlToFileName(url) {
    let reg = /\//g
    let cutProtocol = url.replace(/http[s]?:\/\//g,"");
    let replaceSlashes = cutProtocol.replace(reg, "\_");
    let cutParams = replaceSlashes.split("?", 1)[0];
    return cutParams;
}

async function setUp(dir){
    const parent = dir;
    const dirnames  = ['browserify', 'webpack', 'rollup', 'parcel', 'esbuild', 'perDomain'];

    await Promise.all(
        dirnames.map(dirname => fs.promises.mkdir(`${parent}${dirname}`).catch(console.error))
    );
}
