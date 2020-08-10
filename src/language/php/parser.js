
const dashAst = require('../../lib/walker.js');
const engine = require('php-parser');
const hashCode = require('../../lib/hash.js');
module.exports.parser = (text) => {
    let parser = new engine({
        parser: {
            extractDoc: true,
            php7: true
        },
        ast: {
            withPositions: true,
            withSource: true,
        }
    });
    let ast = parser.parseCode(text);
    let nodes = {};
    let localMethod = [];
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
                    _node.end = _node.arguments[_node.arguments.length - 1].loc.end.offset;
                    _node.hash = hashCode(text.substr(Math.max(0, _node.start - 100), _node.end - _node.start + 100));
                    currentNode.source = _node.what.loc.source;
                    nodes[_node.start] = _node;
                }
            } else {
                if (currentNode.arguments.length) {
                    currentNode.start = currentNode.what.loc.start.offset;
                    currentNode.end = currentNode.arguments[currentNode.arguments.length - 1].loc.end.offset;
                    currentNode.hash = hashCode(text.substr(Math.max(0, currentNode.start - 100), currentNode.end - currentNode.start + 100));
                    currentNode.source = currentNode.what.loc.source;
                    nodes[currentNode.start] = currentNode;
                }

            }
        } else if (currentNode.kind === 'new') {
            if (currentNode.arguments.length) {
                currentNode.start = currentNode.what.loc.start.offset;
                currentNode.end = currentNode.arguments[currentNode.arguments.length - 1].loc.end.offset;
                currentNode.hash = hashCode(text.substr(Math.max(0, currentNode.start - 100), currentNode.end - currentNode.start + 100));
                currentNode.source = currentNode.what.loc.source;
                nodes[currentNode.start] = currentNode;
            }
        }
        else if (currentNode.kind === 'method' || currentNode.kind === 'function') {
            if (currentNode.name && currentNode.name.name) {
                localMethod.push(currentNode.name.name)
            }
        }
    });

    return [Object.values(nodes), localMethod];
}