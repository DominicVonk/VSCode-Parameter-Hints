
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
        try {
            if (currentNode.type === 'MemberExpression') {
                let currentSubNode = currentNode.expression;
                let parentSubNode = currentNode;
                if (parentSubNode && parentSubNode.type === 'MemberExpression' && currentSubNode.name && parent.arguments && parent.arguments.length && parent.arguments.indexOf(currentNode) === -1) {
                    currentSubNode.arguments = parent.arguments;

                    currentSubNode.final_end = currentSubNode.arguments[currentSubNode.arguments.length - 1].end;

                    nodes[currentSubNode.start] = currentSubNode;
                }
            }
            if (currentNode.name && parent && (parent.type === 'CallExpression' || parent.type === 'NewExpression') && parent.arguments && parent.arguments.length && parent.arguments.indexOf(currentNode) === -1) {
                currentNode.arguments = parent.arguments;

                currentNode.final_end = currentNode.arguments[currentNode.arguments.length - 1].end;
                nodes[currentNode.start] = currentNode;
            }
        } catch (e) {
        }
    });
    return Object.values(nodes);
}