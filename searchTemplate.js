 
 let parser = require("acorn");
 let estraverse = require("estraverse");
 let fs = require("fs");
 const {esbuildFP} = require("./Fingerprints/esbuild");
 
 // the AST of the code in which the fragment should be searched
 let bigAST = parser.parse(`let ses = require("ses");lockdown();let c = new Compartment({});console.log(eval("(new Function('return this'))().process"))`).body;
 // the AST of the code to be searched for
 let subAST = parser.parse("{let c = new Compartment({});var a = Object.getOwnPropertyDescriptor;}").body[0];
 let subAST2 = parser.parse("let a = new a({});").body[0];
 let subAST3 = parser.parse(`var y = (r, t) => () => (r && (t = r(r = 0)), t);`).body[0];
 const test = parser.parse("{var Hj = Object.getOwnPropertyDescriptor;}\n", {ecmaVersion:2020}).body[0]

 let keywords = ["require", "exports"];
 // searches the first argument into the second one. If at any location the subtree is found, the function returns true
 function isSubTree(subAST, bigAST) {
     // traverse the big AST using BFS with a queue
     let queue = [bigAST];
     while (queue.length > 0) {       
         let currNode = queue.shift();
         // try to match the AST at this position
         if (areEqual(subAST, currNode, keywords))
             return true;
         if (currNode instanceof Object) {
             // add all the children of the node in the queue for traversal
             for (key in currNode) {               
                 child = currNode[key];
                 if (child && typeof child.type === 'string') {
                     queue.push(child)
                 }
                 // if (child instanceof Object){
                 //     queue.push(child)
                 // }
             }
         }
     }
     return false;
 }
 
 function areEqual(firstAST, secondAST, keywords) {
     if(!(firstAST && secondAST && firstAST.type && secondAST.type))
         return false;
     if(firstAST.type !== secondAST.type){return false}
     let queue = [{first: firstAST, second: secondAST}];
     while (queue.length > 0) {   
         let currNode = queue.shift();
         let firstNode = currNode.first;
         let secondNode = currNode.second;
         let key;
         if (firstNode instanceof Object) {
             // go through all keys of subtree node
             for (key in firstNode) {
                 let currentKey = key
                 // skip code location properties. You can also add other nodes to be skipped here, e.g., identifier names, to relax this strict equality checked in this function             
                 // skip identifier names
                 if (key === "name" && !(keywords.includes(firstNode[key]) || keywords.includes(secondNode[key]))) {
                     var a = 10;
                     continue;
                 }
                 if (key === "start" || key === "end")
                     continue;
                 // see if key is not undefined, save value in child
                 let child;
                 if (key)
                    child = firstNode[key];
                 // if it has a value, try to find that key in the bigtree. If it also has it,
                 // add both children to compare next. That way we recursively compare all the children.
                 if (child) {
                     if (!secondNode[key])
                         return false
                     queue.push({first: child, second: secondNode[key]});
                 }
             }
         } else if (firstNode !== secondNode) {                       
             return false;
         }
     }
     return true;
 }

 module.exports = {areEqual};
 // // console.log(isSubTree(subAST, bigAST));
 // console.log(isSubTree(subAST3, subAST2))
 // console.log(isSubTree(subAST3, subAST))
 // console.log(isSubTree(subAST, bigAST))
 // console.log(isSubTree(subAST2, bigAST))
 // console.log(isSubTree(subAST3, bigAST))
 // console.log(isSubTree(subAST4, bigAST))
