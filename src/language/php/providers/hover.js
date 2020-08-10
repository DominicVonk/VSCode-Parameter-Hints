const vscode = require('vscode');
const engine = require('php-parser');
const { hoverProvider } = require('../../general/providers');
let paramGenerated = {};
/**
 * @param {vscode.TextEditor} editor
 * 
 */
module.exports.hoverProvider = async (editor, node, positionOf) => {
    let nodePosition = positionOf(node.what.loc.start.offset);
    let hoverCommand = await hoverProvider(editor, node, nodePosition);

    if (hoverCommand.length > 0 && hoverCommand[0].contents && hoverCommand[0].contents.length > 0) {
        let res = hoverCommand[0].contents[0].value;
        if (res) {
            let parsingString = res.match(/```php(.*?)```/gs).map(e => /```php(.*?)```/gs.exec(e)[1])
            parsingString = parsingString && parsingString.find(e => e.includes('function'));
            if (!parsingString) {
                return false;
            }
            let params = [];
            let parser = new engine({
                parser: {
                    extractDoc: true,
                    php7: true,
                    suppressErrors: false
                },
                ast: {
                    withPositions: true
                }
            });
            let string = parsingString.trim().replace(/^(.*?)function/m, 'function');
            let ast = parser.parseCode(string);

            let subparams = ast.children[0].arguments.map(e => (e.variadic ? '...' : '') + (e.byRef ? '&' : '') + '$' + e.name.name);
            if (!subparams) {
                return false;
            }
            let variadicLabel = '';
            var variadicCounter = 0;

            for (let i = 0; i < node.arguments.length; i++) {
                let label;
                if (variadicLabel) {
                    label = variadicLabel + '[' + variadicCounter + ']';
                    variadicCounter++;
                } else if (subparams.length <= i) {
                    break;
                }
                if (!label) {
                    label = subparams[i];
                    if (label.substr(0, 3) == '...') {
                        variadicLabel = label.substr(3);
                        label = variadicLabel + '[' + variadicCounter + ']';
                        variadicCounter++;
                    }
                }
                let operatorsTill = node.loc.source.substr(node.what.loc.end.offset - node.loc.start.offset + 1, node.arguments[i].loc.start.offset - node.what.loc.end.offset - 1)
                let correction = operatorsTill.length - operatorsTill.lastIndexOf(',') - operatorsTill.substr(operatorsTill.lastIndexOf(',') + 1).match(/^(\s*)/)[0].length - 1;
                if (correction < 0) {
                    correction = 0;
                }
                params.push({
                    label: label.replace('?', '').trim() + ':',
                    nodeStart: node.what.loc.start.offset,
                    currentNodeStart: node.what.loc.start.offset,
                    start: node.arguments[i].loc.start.offset - correction,
                    end: node.arguments[i].loc.end.offset
                });
            }
            return params;
        }
    }
    return false
}