const path = require('path');
const fs = require('fs').promises
async function extractSourcemapBundles(webpackDir, sourceMapDir){
    let src;
    let filePath;
    for (const filename of await fs.readdir(webpackDir)) {
        filePath = path.join(webpackDir, filename);
        src = (await fs.readFile(filePath)).toString();
        if(src.includes("<<<123SourceMapStart!56>>>")){
            await fs.writeFile(path.join(sourceMapDir, filename),src);
        }
    }
}
(async (webpackDir, sourceMapDir) => {
    await extractSourcemapBundles(webpackDir, sourceMapDir);
})(process.argv[2], process.argv[3]);