const fs = require("fs");
const parser = require("acorn");
var walk = require("esprima-walk");

function featuresFromFile(AST) {
    if (AST === undefined) {
        return;
    }
    let stringLiterals = [];
    let numbers = [];
    let instanceofInst = [];
    let methodnames = [];
    let classAttributesThis = [];
    let thisUsages = 0;
    walk(AST, (node) => {
        if (node !== null) {
            switch (node.type) {
                // Literals
                case "Literal":
                    if (node.raw.includes("./node_modules/")) break;
                    if (node.raw.includes('"') || node.raw.includes("'"))
                        stringLiterals.push(node.value);
                    else {
                        numbers.push(node.value);
                    }
                    break;
                // method names
                case "MethodDefinition":
                    methodnames.push(node.key.name);

                // class attributes accessed via "this"
                case "MemberExpression":
                    if (
                        "object" in node &&
                        node.object.type === "ThisExpression"
                    ) {
                        thisUsages += 1;
                        if ("property" in node) {
                            classAttributesThis.push(node.property.name);
                        }
                    }
                default:
                    break;
            }
            if ("operator" in node && node.operator === "instanceof") {
                let operants = [];
                if (node.left.type === "Identifier") {
                    operants.push(node.left.name);
                }
                if (node.right.type === "Identifier") {
                    operants.push(node.right.name);
                }
            }
        }
    });
    return {
        stringLiterals: stringLiterals,
        numbers: numbers,
        instanceofInst: instanceofInst,
        methodnames: methodnames,
        classAttributesThis: classAttributesThis,
        thisUsages: thisUsages,
    };
}

module.exports = featuresFromFile;
