
const dashAst = require('../../lib/walker.js');
const engine = require('php-parser');
module.exports.parser = (text) => {
    let parser = new engine({
        parser: {
            extractDoc: true,
            php7: true
        },
        ast: {
            withPositions: true
        }
    });
    let ast = parser.parseCode(text);
    let nodes = {};

    dashAst(ast, function (currentNode) {
        if (currentNode.kind === 'call') {
            if (currentNode.what.kind === 'propertylookup' || currentNode.what.kind === 'staticlookup') {
                let _node = {
                    what: currentNode.what.offset,
                    arguments: currentNode.arguments
                };
                nodes[_node.what.loc.start.offset] = _node;
            } else {
                nodes[currentNode.what.loc.start.offset] = currentNode;
            }
        } else if (currentNode.kind === 'new') {
            nodes[currentNode.what.loc.start.offset] = currentNode;
        }
    });

    return Object.values(nodes);
}