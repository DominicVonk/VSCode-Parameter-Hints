const vscode = require('vscode');
module.exports.signatureProvider = async (editor, node, positionOf) => {
    let nodePosition = positionOf(node.what.loc.end.offset + 1);
    const signatureHelp = await vscode.commands.executeCommand(
        "vscode.executeSignatureHelpProvider",
        editor.document.uri,
        nodePosition,
        '('
    );
    if (signatureHelp) {
        let signature = signatureHelp.signatures[signatureHelp.activeSignature];
        if (signature) {
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
                    label = signature.parameters[i].label;
                    label = label.match(/((\.\.\.|)(&|)(\$[0-9a-z_]+))/i)[1];
                    if (label.substr(0, 3) == '...') {
                        variadicLabel = label.substr(3);
                        label = variadicLabel + '[' + variadicCounter + ']';
                        variadicCounter++;
                    }
                }
                if (label) {
                    params.push({
                        label: label.replace('?', '').trim() + ':',
                        range: new vscode.Range(positionOf(node.arguments[i].loc.start.offset),
                            positionOf(node.arguments[i].loc.end.offset))
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