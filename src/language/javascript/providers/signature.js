const vscode = require('vscode');
const { TypescriptParser } = require('typescript-parser');
let typescriptParser = new TypescriptParser();
module.exports.signatureProvider = async (editor, node, positionOf) => {
    let nodePosition = positionOf(node.end + 1);
    const signatureHelp = await vscode.commands.executeCommand(
        "vscode.executeSignatureHelpProvider",
        editor.document.uri,
        nodePosition,
        '('
    );
    if (signatureHelp) {
        let signature = signatureHelp.signatures[signatureHelp.activeSignature];
        if (signature) {
            let parsed = await typescriptParser.parseSource(signature.label);
            if (parsed.usages[0] !== node.name) {
                return false;
            }
            let variadicLabel = '';
            let params = [];
            var variadicCounter = 0;
            for (let i = 0; i < node.arguments.length; i++) {
                let label;
                if (variadicLabel) {
                    label = variadicLabel + '[' + variadicCounter + ']';
                    variadicCounter++;
                } else if (signature.parameters.length <= i) {
                    break;
                }
                if (!label) {
                    let paramLabel = signature.parameters[i].label;
                    label = signature.label.substr(paramLabel[0]);
                    if (label.indexOf(':') < paramLabel[1] - paramLabel[0]) {
                        label = label.substr(0, label.indexOf(':'));
                    } else {
                        label = label.substr(0, paramLabel[1] - paramLabel[0]);
                    }
                    if (label.substr(0, 3) == '...') {
                        variadicLabel = label.substr(3);
                        label = variadicLabel + '[' + variadicCounter + ']';
                        variadicCounter++;
                    }
                }
                if (label) {
                    params.push({
                        label: label.replace('?', '').trim() + ':',
                        range: new vscode.Range(positionOf(node.arguments[i].start),
                            positionOf(node.arguments[i].end))
                    });
                }
            }
            if (params.length > 0) {
                return params;
            } else {
                return false;
            }
        }
    }
    return false;
}