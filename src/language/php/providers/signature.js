const vscode = require('vscode');
const { signatureProvider } = require('../../generic/providers');
module.exports.signatureProvider = async (editor, node, positionOf) => {
    let nodePosition = positionOf(node.what.loc.end.offset + 1);

    let signatureHelp = await signatureProvider(editor, nodePosition);
    if (signatureHelp) {
        let signature = signatureHelp.signatures[signatureHelp.activeSignature];
        if (signature) {
            let variadicLabel = '';
            let params = [];
            var variadicCounter = 0;
            let mode = vscode.workspace.getConfiguration("parameterHints").get(
                "hintingType",
            );
            for (let i = 0; i < node.arguments.length; i++) {
                let label;
                if (variadicLabel) {
                    if (mode === 'typeOnly') {
                        label = variadicLabel;
                    } else {
                        label = variadicLabel + '[' + variadicCounter + ']';
                    }
                    variadicCounter++;
                } else if (signature.parameters.length <= i) {
                    break;
                }
                if (!label) {
                    let _label = signature.parameters[i].label;
                    let startLabel = _label.match(/((\.\.\.|)(&|)(\$[0-9a-z_]+))/i)[1];
                    label = startLabel;

                    if (startLabel.substr(0, 3) == '...') {
                        variadicLabel = startLabel.substr(3);
                        if (mode === 'typeOnly') {
                            label = variadicLabel;
                        } else {
                            label = variadicLabel + '[' + variadicCounter + ']';
                        }
                        variadicCounter++;
                    }
                    if (mode === 'typeOnly' || mode === 'variableAndType') {
                        if (_label.trim().substr(0, startLabel.length) !== startLabel) {
                            if (mode === 'variableAndType') {
                                label = _label.replace(startLabel, label);
                            } else {
                                label = _label.replace(startLabel, '');
                            }
                            if (label.indexOf('=') !== -1) {
                                label = label.substr(0, label.indexOf('='));
                            }
                            if (variadicLabel) {
                                variadicLabel = label;
                            }
                        } else {
                            if (mode === 'variableAndType') {
                                label = signature.parameters[i].documentation.value.match(/`(.*?)(\.\.\.|)(&|)(\$[0-9a-z_]+)/i)[1] + label;
                                if (label.trim().substr(0, 5) === 'mixed') {
                                    label = label.trim().substr(5);
                                }
                                if (variadicLabel) {
                                    variadicLabel = label.substr(0, label.length - 3);
                                }
                            } else {
                                label = signature.parameters[i].documentation.value.match(/`(.*?)(\.\.\.|)(&|)(\$[0-9a-z_]+)/i)[1].trim();
                                if (label.trim().substr(0, 5) === 'mixed') {
                                    label = label.trim().substr(5);
                                }
                                if (variadicLabel) {
                                    variadicLabel = label.trim();
                                }
                            }
                        }
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
                        start: node.arguments[i].loc.start.offset - correction,
                        end: node.arguments[i].loc.end.offset
                    });
                }
            }
            return params;
        }
    }
    return false;
}