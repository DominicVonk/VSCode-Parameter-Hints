const vscode = require('vscode');
const { TypescriptParser } = require('typescript-parser');
let typescriptParser = new TypescriptParser();
module.exports.hoverProvider = async (editor, node, positionOf) => {
    let nodePosition = positionOf(node.start);
    const hoverCommand = await vscode.commands.executeCommand(
        "vscode.executeHoverProvider",
        editor.document.uri,
        nodePosition,
    );

    if (hoverCommand.length > 0 && hoverCommand[0].contents && hoverCommand[0].contents.length > 0) {
        let res = hoverCommand[0].contents[0].value;
        if (res) {
            let parsingString = /```typescript(.*?)```/s.exec(res);
            if (!parsingString) {
                return false;
            }
            let parsed = await typescriptParser.parseSource(parsingString[1]);

            let subparams = parsed.declarations && parsed.declarations.length && parsed.declarations[0].parameters && parsed.declarations[0].parameters.map(e => e.name);
            if (!subparams) {
                return false;
            }
            let params = [];
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
                    label = subparams[i].split(':')[0];
                    if (label.substr(0, 3) == '...') {
                        variadicLabel = label.substr(3);
                        label = variadicLabel + '[' + variadicCounter + ']';
                        variadicCounter++;
                    }
                }
                params.push({
                    label: label.replace('?', '').trim() + ':',
                    range: new vscode.Range(positionOf(node.arguments[i].start),
                        positionOf(node.arguments[i].end))
                });
            }
            return params;
        }
    }
    return false;
}