
const dashAst = require('dash-ast');
const { parseModule: parse } = require('escaya');
module.exports.parser = (text) => {
    let ast = parse(text, {
        next: true,
        module: true,
        loc: true
    });
    let nodes = {};

    dashAst(ast, function (currentNode, parent) {
        if (currentNode.type === 'MemberExpression') {
            let currentSubNode = currentNode.expression;
            let parentSubNode = currentNode;
            if (parentSubNode && parentSubNode.type === 'MemberExpression' && currentSubNode.name && parent.arguments && parent.arguments.indexOf(currentNode) === -1) {
                currentSubNode.arguments = parent.arguments;
                nodes[currentSubNode.start] = currentSubNode;
            }
        }
        if (currentNode.name && parent && (parent.type === 'CallExpression' || parent.type === 'NewExpression') && parent.arguments && parent.arguments.indexOf(currentNode) === -1) {
            currentNode.arguments = parent.arguments;
            nodes[currentNode.start] = currentNode;
        }
    });

    return Object.values(nodes);
}