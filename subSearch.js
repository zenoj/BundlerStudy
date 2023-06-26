let parser = require("esprima");
const {esbuildFP} = require("./Fingerprints/esbuild");
const {areEqual} = require("./searchTemplate");

function subStringSearcher(fingerprint, code, keywords){
    let subAst = fingerprint;
    let topAst = code;
    // initially test if fingerprint == code, in that case we are finished
    // else split subast and add children of topast
    if (areEqual(subAst, topAst, keywords)){
        return true;
    }
    // make sure subast is an array for convenience
    let startInd = 0;
    let endInd = subAst.length;
    let matcher = subAst[startInd];
    let queue = [];
    // add object to queue
    let ch = getChildren(topAst);
    queue.push(ch);
    let top, entry, typ;
    // main for loop going through the queue
    while (queue.length > 0) {
        // pop the top element off the queue
        top = queue.pop()
        // go through the children. Check if they are equal to the phrase.
        // if yes check the next in statement
        // in both ways add the children of the child as an object to the queue
        for (const ind in top){
            let child = top[ind];
            if(areEqual(matcher,child, keywords)){
                startInd++;
                if(startInd === endInd){
                    return true
                }
            } else {
                startInd = 0;
            }
            ch = getChildren(child);
            if(ch.length === 0){continue}
            queue.push(ch);
            matcher = subAst[startInd]
        }
    }
    return false;
}

function getChildren(node){
    let children = [];
    for (const key in node) {
        if(key === "arguments" || key === "params"){continue}
        let child = node[key]
        if(child instanceof Object){
            if(child instanceof Array){
                children = children.concat(child);
            } else {
                children.push(child);
            }
        }
    }
    return children
}

module.exports = {subStringSearcher}