const vscode = require('vscode');
const { signatureProvider } = require('../../general/providers');
module.exports.signatureProvider = async (editor, node, positionOf) => {
    let nodePosition = positionOf(node.what.loc.end.offset + 1);

    let signatureHelp = await signatureProvider(editor, node, nodePosition);
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