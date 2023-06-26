const parser = require("acorn");
const walk = require("esprima-walk")
const fs = require("fs");
const codegen = require("escodegen")

function findModuleObjectWebpack5(ast){
    // find beginning of bundle
    let start = (findBeginningOfBundle(ast))
    if(!start[1]){
        return [{}, false]
    }
    let startObj = start[0]
    try{
        startObj = startObj.callee.body.body
        if(startObj[0].type === "VariableDeclaration"){
            let moduleObject = startObj[0].declarations[0].init
            if(moduleObject.type === "ObjectExpression" && isModuleObjectWebpack5(moduleObject.properties)){
                return [moduleObject.properties, true]
            }
        } else {
            if(startObj[1].type === "VariableDeclaration") {
                let moduleObject = startObj[1].declarations[0].init
                if(moduleObject.type === "ObjectExpression" && isModuleObjectWebpack5(moduleObject.properties)){
                    return [moduleObject.properties, true]
                }
            }
        }

    } catch (e) {
        // console.error(e);
    }
    return [{}, false]
}

function findBeginningOfBundle(ast){
    // expression.callee.body.body
    try {
        let start = ast.body[0].expression
        if(start.type === "UnaryExpression"){
            start = start.argument
        }
        return [start, true];
    } catch (e) {
        return [{},false]
    }
}

function isModuleObjectWebpack5(object){
    if(Object.keys(object).length === 0){
        return false;
    }
    for (const item of object){
        if(item.key.type !== "Literal" || !(item.value.type === "ArrowFunctionExpression" || item.value.type === "FunctionExpression")){
            return false;
        }
    }
    return true
}


module.exports = findModuleObjectWebpack5;

