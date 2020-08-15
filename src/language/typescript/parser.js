
const dashAst = require('../../lib/walker.js');
const ts = require('typescript');
module.exports.parser = (text, parserOptions) => {
    try {
        let ast = ts.createSourceFile('test.ts', text.replace(/\n\n/g, '\n '), ts.ScriptTarget.Latest, true, parserOptions.language);
        let nodes = {};
        dashAst(ast, function (currentNode, parent) {
            try {
                if (currentNode.expression && (currentNode.expression.name || currentNode.expression.kind === ts.SyntaxKind.Identifier) && (currentNode.kind === ts.SyntaxKind.CallExpression || currentNode.kind === ts.SyntaxKind.NewExpression) && currentNode.arguments && currentNode.arguments.length) {
                    currentNode.start = currentNode.expression.name ? currentNode.expression.name.getStart() : currentNode.expression.getStart();
                    currentNode.end = currentNode.expression.name ? currentNode.expression.name.getEnd() : currentNode.expression.getEnd();
                    currentNode.name = currentNode.expression.name ? currentNode.expression.name.escapedText : currentNode.expression.escapedText;
                    currentNode.final_end = currentNode.arguments[currentNode.arguments.length - 1].getEnd();
                    nodes[currentNode.start] = currentNode;
                }
            } catch (e) {
            }
        });
        return Object.values(nodes);
    } catch (e) {
        return [];
    }
}