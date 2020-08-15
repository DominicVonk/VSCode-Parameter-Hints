
const dashAst = require('../../lib/walker.js');
const engine = require('php-parser');
module.exports.parser = (text) => {
    let parser = new engine({
        parser: {
            extractDoc: true,
            php7: true,
            suppressErrors: true
        },
        ast: {
            withPositions: true,
            withSource: true,
        }
    });
    let ast = parser.parseCode(text);
    let nodes = {};
    dashAst(ast, function (currentNode) {
        if (currentNode.kind === 'call') {
            if (currentNode.what.kind === 'propertylookup' || currentNode.what.kind === 'staticlookup') {
                if (currentNode.arguments.length) {
                    let _node = {
                        what: currentNode.what.offset,
                        arguments: currentNode.arguments,
                        loc: currentNode.loc
                    };
                    _node.start = _node.what.loc.start.offset;
                    _node.final_end = _node.arguments[_node.arguments.length - 1].loc.end.offset;
                    nodes[_node.start] = _node;
                }
            } else {
                if (currentNode.arguments.length) {
                    currentNode.start = currentNode.what.loc.start.offset;
                    currentNode.final_end = currentNode.arguments[currentNode.arguments.length - 1].loc.end.offset;
                    nodes[currentNode.start] = currentNode;
                }

            }
        } else if (currentNode.kind === 'new') {
            if (currentNode.arguments.length) {
                currentNode.start = currentNode.what.loc.start.offset;
                currentNode.final_end = currentNode.arguments[currentNode.arguments.length - 1].loc.end.offset;
                nodes[currentNode.start] = currentNode;
            }
        }
    });

    return Object.values(nodes);
}