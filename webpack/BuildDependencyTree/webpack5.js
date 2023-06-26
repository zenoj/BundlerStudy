// to find the actual root domains we need to find the modules that are not imported by any other modules
const Queue = require("@supercharge/queue-datastructure");
const walk = require("esprima-walk");


function BuildSCC(modObj){
    let tree = buildDependencyTree(modObj);
    let rootModules = findNotImportedModules(tree);
    // Build SCC as a new graph

    let SCCs = new Map();
    for (const rootModule of rootModules) {
        // console.log("populating root module:", rootModule)
        let g = new Set();
        SCCs.set(rootModule, g);
        // go through graph starting from a rootModule and add everything to its own graph
        let q = new Queue(rootModule);
        g.add(rootModule);
        let visited = new Set();
        while(q.isNotEmpty()){
            let elem = q.dequeue();
            let node = tree.nodes.get(elem);
            visited.add(node.id);
            for (const e of node.getAdjacents()) {
                if(!tree.hasNode(e) || visited.has(e)){
                    continue;
                }
                g.add(e);
                q.enqueue(e);
            }
        }
    }
    return SCCs;
}



function getResultObjectGroupedBySCCs(resultObj, SCCs){
    let resultObjectGroupedBySCC = {};
    for (const [root,set] of SCCs.entries()) {
        resultObjectGroupedBySCC[root] = {}
        for (const key of set) {
            resultObjectGroupedBySCC[root][key] = {size: resultObj[key].size};
        }
    }
    return resultObjectGroupedBySCC;
}


function findNotImportedModules(graph){
    let keyList = new Set(graph.nodes.keys());
    // remove all elements that are imported somewhere
    for (const [key,value] of graph.nodes.entries()) {
        let imports = value.adjacents
        for (const i of imports) {
            keyList.delete(i);
        }
    }
    return keyList;
}

function findAllImportsFromModule(moduleValue){
    // identify webpack require parameter
    let webpackRequireName = "";
    if(moduleValue.params.length === 3){
        webpackRequireName = moduleValue.params[2].name;
    } else{
        return [];
    }

    let Imports = [];
    walk.walk(moduleValue, (node) => {
        try{
            if(node.type === "CallExpression" && node.callee.name === webpackRequireName && node.arguments.length === 1 && node.arguments[0].type === "Literal") {
                let importedFunction = node.arguments[0].raw
                if (importedFunction) {
                    Imports.push(importedFunction);
                }
            }
        } catch (e) {
            // console.error(e)
        }
    })
    return Imports;
}

function buildDependencyTree(modObj){
    // find webpack require function
    if(Object.keys(modObj).length === 0){
        return new Graph();
    }
    // build dependency tree
    let g = new Graph();
    for (const modObjElement of modObj) {
        let code = modObjElement.value;
        let key = modObjElement.key.raw;
        let v = new Node(key);
        v.adjacents = v.adjacents.concat(findAllImportsFromModule(code))
        g.nodes.set(key,v);
    }
    return g;
}

function makeNodeObjValueObj(modObj){
    let res = {}
    for (const modElem of modObj) {
        let code = modElem.value
        let k = modElem.key.raw
        res[k] = code
    }
    return res
}





class Node {
    constructor(value) {
        this.id = value;
        this.adjacents = []; // adjacency list
    }

    addAdjacent(node) {
        this.adjacents.push(node);
    }

    removeAdjacent(node) {
        const index = this.adjacents.indexOf(node);
        if(index > -1) {
            this.adjacents.splice(index, 1);
            return node;
        }
    }

    getAdjacents() {
        return this.adjacents;
    }

    isAdjacent(node) {
        return this.adjacents.indexOf(node) > -1;
    }
}

class Graph {
    constructor() {
        this.nodes = new Map();

    }

    removeNode(id) {
        const current = this.nodes.get(id);
        if(current) {
            for (const node of this.nodes.values()) {
                node.removeAdjacent(current);
            }
        }
        return this.nodes.delete(id);
    }
    hasNode(id){
        if(this.nodes.get(id)){
            return true;
        }
        return false;
    }

}

module.exports = {BuildSCC, getResultObjectGroupedBySCCs}