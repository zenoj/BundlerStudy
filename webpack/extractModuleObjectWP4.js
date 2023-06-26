/*
Finding the module object in webpack4
 */
function FindModuleObjectWebpack4(ast){
    let beginning = findBeginningOfBundle(ast)
    if(!beginning[1]){
        return [{}, false, "none"]
    }
    let moduleObject = beginning[0]
    try {
        moduleObject = moduleObject.arguments[0]
        if(moduleObject.type === "ArrayExpression"){
            moduleObject = moduleObject.elements
            if(!moduleObject){
                return [{}, false, "none"];
            }
            if(isModuleObjectWebpack4(moduleObject)) {
                return [moduleObject, true, "Array"]
            }
        } else if(moduleObject.type === "ObjectExpression"){
            moduleObject = moduleObject.properties
            if(!moduleObject){
                return [{}, false, "none"];
            }
            if(isModuleObjectWebpack5(moduleObject)) {

                return [moduleObject, true, "Object"]
            }
        }
    } catch (e) {
        return [{}, false, "none"]
    }

    return [{}, false, "none"]
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


function isModuleObjectWebpack4(obj){
    let test1 = 5
    try {
        for (const objElement of obj) {
            if(!objElement){continue}
            if(!(objElement.type === "ArrowFunctionExpression" || objElement.type === "FunctionExpression")){
                return false
            }
        }
    } catch (e) {
        // console.log(e)
        return false
    }

    return true;
}

function isModuleObjectWebpack5(obj){
    try {
        for (const objElement of obj) {

            if(!objElement){continue}
            if(!(objElement.value === "ArrowFunctionExpression" || objElement.value === "FunctionExpression")){
                return false
            }
        }
    } catch (e) {
        // console.log(e)
        return false;
    }
    return true;
}

function moduleIdsEnabled(obj){
    for (const objElement of obj) {
        if(objElement.key.raw.includes("/modules/")) {
            return true;
        }
    }
    return false;
}

module.exports = {FindModuleObjectWebpack4, moduleIdsEnabled};