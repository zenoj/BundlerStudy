// This function finds all the helper functions of webpack
// All helper functions are bundled in the code after the webpack require function

let test1 = `n.m = t, n.c = e, n.d = function (t, e, i) {
        n.o(t, e) || Object.defineProperty(t, e, {
            enumerable: !0,
            get: i
        })
    }, n.r = function (t) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
            value: "Module"
        }), Object.defineProperty(t, "__esModule", {
            value: !0
        })
    }, n.t = function (t, e) {
        if (1 & e && (t = n(t)), 8 & e) return t;
        if (4 & e && "object" == typeof t && t && t.__esModule) return t;
        var i = Object.create(null);
        if (n.r(i), Object.defineProperty(i, "default", {
                enumerable: !0,
                value: t
            }), 2 & e && "string" != typeof t)
            for (var o in t) n.d(i, o, function (e) {
                return t[e]
            }.bind(null, o));
        return i
    }, n.n = function (t) {
        var e = t && t.__esModule ? function () {
            return t.default
        } : function () {
            return t
        };
        return n.d(e, "a", e), e
    }, n.o = function (t, e) {
        return Object.prototype.hasOwnProperty.call(t, e)
    }, n.p = "", n(n.s = 66)`

let test2 = `
(e, t, n) => {
                n.r(t), n.d(t, {
                    createAddon: () => v
                });
                var r = n(276),
                    i = n(3735),
                    o = n(2751),
                    s = n(5506),
                    u = n(5090);
                var a = n(5099);
                n(9678);
}`

const {areEqual} = require("../searchTemplate");
const parser = require("acorn");
const walk = require("esprima-walk")
let keywords = ["require", "exports"];


// split part after the
function findInDeclaration(fingerprint, code, keywords){
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
    let matcher = subAst[startInd].expression;
    let queue = [];
    // add object to queue
    let ch = getChildren(topAst);
    queue.push(ch);
    let firstChild;
    let ObjectID = "";
    let PropertyID = "";
    let top;
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
                if (startInd === 1){
                    firstChild = child
                }
                if(startInd === endInd){
                    if(firstChild.type === "AssignmentExpression" && firstChild.left.type === "MemberExpression" && firstChild.right.type === "FunctionExpression"){
                        ObjectID = firstChild.left.object.name
                        PropertyID = firstChild.left.property.name
                    }
                    return [ObjectID, PropertyID]
                }
            } else {
                startInd = 0;

            }
            ch = getChildren(child);
            if(ch.length === 0){continue}
            queue.push(ch);
            matcher = subAst[startInd].expression
        }
    }
    return [ObjectID, PropertyID];
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

let WP4_HelpFuncN_d = `n.d = function (t, e, i) {
        n.o(t, e) || Object.defineProperty(t, e, {
            enumerable: !0,
            get: i
        })
    }`

let WP4_HelpFuncN_r = `
    n.r = function (t) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
            value: "Module"
        }), Object.defineProperty(t, "__esModule", {
            value: !0
        })
    }`



// this function will be called on each module in the map
function find_r_d_Usages(ast) {
    let r_Function = parser.parse(WP4_HelpFuncN_r, {ecmaVersion:2020}).body
    let d_Function = parser.parse(WP4_HelpFuncN_d, {ecmaVersion:2020}).body
    let r_FunctionName = findInDeclaration(r_Function, test, keywords)[1]
    let d_result = findInDeclaration(d_Function, test, keywords)
    let d_FunctionName = d_result[1]
    let webpackFunctionsObj = d_result[0]
    // console.log("found Object:",webpackFunctionsObj,".",r_FunctionName, ",", webpackFunctionsObj, ".", d_FunctionName)

    let resultMapping = {}
    walk.walk(ast, (node) => {
        try{
            if(node.type === "SequenceExpression" && node.expressions.length >= 2){
                let exp1 = node.expressions[0]
                let exp2 = node.expressions[1]
                let objArgument = exp1.arguments[0].name
                let hasSameArgument = exp2.arguments[0].name === objArgument;
                // we are looking for a function call of n.r() followed by a function call of n.d()
                let is_r_Function = exp1.type === "CallExpression" && exp1.callee.object.name === webpackFunctionsObj && exp1.callee.property.name === r_FunctionName;
                let is_d_Function = exp2.type === "CallExpression" && exp2.callee.object.name === webpackFunctionsObj && exp2.callee.property.name === d_FunctionName;
                if(is_r_Function && is_d_Function && hasSameArgument){
                    // distinguish two different mapping types:
                    // 1. n.d(t, {
                    //      load: () => l,
                    //      PrebidAddon: () => d
                    //    });
                    // 2. n.d(t, "version", function () {
                    //         return B
                    //     })

                    // try first type
                    let secondArgument = exp2.arguments[1];
                    if(secondArgument.type === "ObjectExpression") {
                        let obj = exp2.arguments[1].properties;
                        for (const objElem of obj) {
                            resultMapping[objElem.key.name] = objElem.value.body.name;
                        }
                    } else if(secondArgument.type === "Literal"){
                        // try second type
                        for(const objElem of node.expressions.slice(1)){
                            let RealFunctionName = objElem.arguments[1].raw;
                            let minifiedFunctionName = objElem.arguments[2].body.body[0].argument.name
                            resultMapping[RealFunctionName] = minifiedFunctionName
                        }
                    }




                }
            }
        } catch (e) {
            // console.error(e)
        }
    })
    return resultMapping
}

function findWebpackRequireFunction(ast){
    let b;
    let webpackRequireId = "";
    walk.walk(ast, (node) => {
        try{
            if(node.type === "FunctionDeclaration" && node.params.length === 1){
                b = node.body.body;
                // distinguish between two different versions of the require function, a/b
                // starting with type a
                if(b.length === 4){
                    let firstType = b[0].type === "VariableDeclaration" && b[0].declarations[0].init.type === "MemberExpression" && node.params[0].name === b[0].declarations[0].init.property.name;
                    let secondType = b[1].type === "IfStatement" && b[1].consequent.type === "ReturnStatement" && b[1].consequent.argument.object.name === b[0].declarations[0].id.name && b[1].consequent.argument.property.name === "exports";
                    let thirdType = b[2].type === "VariableDeclaration" && b[2].declarations[0].init.left.property.name === node.params[0].name && b[2].declarations[0].init.right.properties[0].key.name === "exports";
                    let fourthType = b[3].type === "ReturnStatement";
                    if(firstType && secondType && thirdType && fourthType){
                        webpackRequireId = node.id.name;
                    }
                } else if(b.length === 3){
                    // type b
                    let argument = node.params[0].name;
                    let object = b[0].test.object.name
                    let firstType = b[0].type === "IfStatement" && argument === b[0].test.property.name && object === b[0].consequent.argument.object.object.name;
                    let secondType = b[1].type === "VariableDeclaration" && object === b[1].declarations[0].init.left.object.name && argument === b[1].declarations[0].init.left.property.name;
                    let secondTypeAdd = b[1].declarations[0].init.right === "ObjectExpression" && b[1].declarations[0].init.right.properties.length === 3;
                    let b2Expressions = b[2].argument.expressions[0];
                    let firstProperty = b2Expressions.arguments[0].object.name;
                    let firstPropertyCheck = b[2].type === "ReturnStatement" && b2Expressions.callee.object.property.name === argument && firstProperty === b2Expressions.arguments[1].name && b2Expressions.arguments[2].object.name === firstProperty;
                    let functionName = b2Expressions.arguments[3] === node.id.name;
                    let moreFirstProperty = b[2].argument.expressions[1].left.object.name === firstProperty && b[2].argument.expressions[2].object.name === firstProperty && b[2].argument.expressions[2].property.name === "exports"
                    if(firstType && secondType && secondTypeAdd && firstPropertyCheck && functionName && moreFirstProperty){
                        return node.id.name;
                    }
                }
            }
        } catch (e) {
            // console.error(e)
        }
    })
    return webpackRequireId;
}



let test = parser.parse(test1, {ecmaVersion:2020}).body
let parsedTest2 = parser.parse(test2, {ecmaVersion:2020}).body


let resultMapping_r_d_Usages = find_r_d_Usages(parsedTest2)

module.exports = {find_r_d_Usages, findWebpackRequireFunction};