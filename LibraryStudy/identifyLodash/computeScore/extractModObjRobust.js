const parser = require("acorn");
const walk = require("esprima-walk");
const fs = require("fs");

function parseBundle(src) {
    let url = src
        .split("<<123FileNameStart456>>>")[1]
        .split("<<<123FileNameEnd!56>>>")[0];
    let srcCode = src
        .split("<<<123FileSourceStart!56>>>")[1]
        .split("<<<123FileSourceEnd!56>>>")[0];
    let srcMaps = "";
    if (src.includes("<<<123SourceMapStart!56>>>")) {
        srcMaps = src
            .split("<<<123SourceMapStart!56>>>")[1]
            .split("<<<123SourceMapEnd!56>>>")[0];
    }
    return { url: url, srcCode: srcCode, srcMaps: srcMaps };
}

function extractWebpackRequireAndModObj(ast) {
    let b;
    let n = "";
    let modObjName = "";
    walk.walk(ast, (node) => {
        if (modObjName === "") {
            try {
                if (
                    node.type === "FunctionDeclaration" &&
                    node.params.length === 1
                ) {
                    b = node.body.body;
                    // distinguish between two different versions of the require function, a/b
                    // starting with type a
                    if (b.length === 4) {
                        let firstType =
                            b[0].type === "VariableDeclaration" &&
                            b[0].declarations[0].init.type ===
                                "MemberExpression" &&
                            node.params[0].name ===
                                b[0].declarations[0].init.property.name;
                        let secondType =
                            b[1].type === "IfStatement" &&
                            b[1].consequent.type === "ReturnStatement" &&
                            b[1].consequent.argument.object.name ===
                                b[0].declarations[0].id.name &&
                            b[1].consequent.argument.property.name ===
                                "exports";
                        let thirdType = b[2].type === "VariableDeclaration";
                        // &&
                        // b[2].declarations[0].init.left.property.name ===
                        //     node.params[0].name &&
                        // b[2].declarations[0].init.right.properties[0].key
                        //     .name === "exports";
                        let fourthType = b[3].type === "ReturnStatement";
                        // check for module object id
                        let moduleObjName = "";
                        if (
                            b[3].argument.expressions[0].callee.object.type ===
                            "Identifier"
                        )
                            moduleObjName =
                                b[3].argument.expressions[0].callee.object.name;
                        else if (
                            b[3].argument.expressions[0].callee.object.type ===
                            "MemberExpression"
                        )
                            moduleObjName =
                                b[3].argument.expressions[0].callee.object
                                    .object.name;

                        if (
                            firstType &&
                            secondType &&
                            thirdType &&
                            fourthType
                        ) {
                            n = node;
                            modObjName = moduleObjName;
                        }
                    }
                }
            } catch (e) {
                // console.error(e)
            }
        }
    });
    return [n, modObjName];
}

function findBeginningOfBundle(ast) {
    // expression.callee.body.body
    try {
        let start = ast.body[0].expression;
        if (start.type === "UnaryExpression") {
            start = start.argument;
        }
        return [start, true];
    } catch (e) {
        return [{}, false];
    }
}

function extractModObj(ast) {
    // let ast = process.argv[2];
    res = extractWebpackRequireAndModObj(ast);
    webpackRequire = res[0];
    moduleObjName = res[1];
    let modObj;
    // find module cache
    // moduleCacheId =
    //    webpackRequire.body.body[0].declarations[0].init.object.name;

    let start = findBeginningOfBundle(ast);
    if (!start[1]) {
        return [{}, false];
    }
    let startObj = start[0];
    startObj = startObj.callee.body.body;
    let i = 0;
    while (!(startObj[i].type === "FunctionDeclaration")) {
        if (startObj[i].type === "VariableDeclaration") {
            let moduleObject = startObj[i].declarations[i].init;
            if (
                moduleObject.type === "ObjectExpression" &&
                moduleObjName === startObj[i].declarations[i].id.name
            ) {
                modObj = moduleObject.properties;
                if (modObj.length > 0) {
                    console.log("success");
                }
                return;
            }
        }
        i++;
    }
}

// let filepath =
//     "/home/jay/thesis/LibraryDetection/d32-a.sdn.cz_d_32_c_static_QR_R_WdpWQ_2.0.696_webpack";
let filepath = process.argv[2];
let buf = fs.readFileSync(filepath);
let bundleStr = parseBundle(buf.toString())["srcCode"];
let ast = parser.parse(bundleStr, { ecmaVersion: 2020 });
extractModObj(ast);
