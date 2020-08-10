
const dashAst = require('dash-ast');
const { parseModule: parse } = require('escaya');
const hashCode = require('../../lib/hash.js');
module.exports.parser = (text) => {
    let ast = parse(text, {
        next: true,
        module: true,
        loc: true
    });
    let nodes = {};
    let exclude = [];
    dashAst(ast, function (currentNode, parent) {
        try {
            if (currentNode.type === 'MemberExpression') {
                let currentSubNode = currentNode.expression;
                let parentSubNode = currentNode;
                if (parentSubNode && parentSubNode.type === 'MemberExpression' && currentSubNode.name && parent.arguments && parent.arguments.length && parent.arguments.indexOf(currentNode) === -1) {
                    currentSubNode.arguments = parent.arguments;

                    let end = currentSubNode.arguments[currentSubNode.arguments.length - 1].end;
                    currentSubNode.hash = hashCode(text.substr(Math.max(0, currentSubNode.start - 100), end - currentSubNode.start + 100));
                    let s = text.substr(currentSubNode.start);
                    currentSubNode.source = s.substr(0, s.indexOf('(')).trim();
                    nodes[currentSubNode.start] = currentSubNode;
                }
            }
            if (currentNode.name && parent && (parent.type === 'CallExpression' || parent.type === 'NewExpression') && parent.arguments && parent.arguments.length && parent.arguments.indexOf(currentNode) === -1) {
                currentNode.arguments = parent.arguments;

                let end = currentNode.arguments[currentNode.arguments.length - 1].end;
                currentNode.hash = hashCode(text.substr(Math.max(0, currentNode.start - 100), end - currentNode.start + 100));
                let s = text.substr(currentNode.start);
                currentNode.source = s.substr(0, s.indexOf('(')).trim();
                nodes[currentNode.start] = currentNode;
            }
            if ((parent && (parent.type === 'LexicalBinding' || parent.type === 'VariableDeclaration')) && (currentNode.type === 'ArrowFunction' || currentNode.type === 'FunctionExpression' || currentNode.type === 'ClassExpression')) {
                if (parent.binding && parent.binding.name) {
                    exclude.push(parent.binding.name);
                }
            }
            if (currentNode.type === 'FunctionDeclaration' || currentNode.type === 'MethodDefinition' || currentNode.type === 'ClassDeclaration') {
                if (currentNode.name && currentNode.name.name) {
                    exclude.push(currentNode.name.name);
                }
            }
        } catch (e) {
            console.log(e);
        }
    });
    return [Object.values(nodes), exclude];
}