const vscode = require('vscode');
const engine = require('php-parser');
const { hoverProvider } = require('../../generic/providers');
/**
 * @param {vscode.TextEditor} editor
 * 
 */
module.exports.hoverProvider = async (editor, node, positionOf) => {
    let nodePosition = positionOf(node.what.loc.start.offset);
    let hoverCommand = await hoverProvider(editor, nodePosition);

    if (hoverCommand.length > 0 && hoverCommand[0].contents && hoverCommand[0].contents.length > 0) {
        let res = hoverCommand[0].contents[0].value;
        if (res) {
            let parsingString = res.match(/```php(.*?)```/gs).map(e => /```php(.*?)```/gs.exec(e)[1])
            parsingString = parsingString && parsingString.find(e => e.includes('function'));
            let docParams = res.match(/_@param_ `(.*?)`/ig);
            if (!parsingString) {
                return false;
            }
            let params = [];
            let parser = new engine({
                parser: {
                    extractDoc: true,
                    php7: true,
                    suppressErrors: true
                },
                ast: {
                    withPositions: true
                }
            });
            let string = parsingString.trim().replace(/^(.*?)function/m, 'function');

            let mode = vscode.workspace.getConfiguration("parameterHints").get(
                "hintingType",
            );
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
                    if (mode === 'typeOnly') {
                        label = variadicLabel;
                    } else {
                        label = variadicLabel + '[' + variadicCounter + ']';
                    }
                    variadicCounter++;
                } else if (subparams.length <= i) {
                    break;
                }
                if (!label) {
                    let _label = subparams[i];
                    let startLabel = _label.match(/((\.\.\.|)(&|)(\$[0-9a-z_]+))/i)[1];
                    label = startLabel;
                    if (label.substr(0, 3) == '...') {
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
                                label = docParams[i].match(/`(.*?)(\.\.\.|)(&|)(\$[0-9a-z_]+)/i)[1] + label;

                                if (label.trim().substr(0, 5) === 'mixed') {
                                    label = label.trim().substr(5);
                                }
                                if (variadicLabel) {
                                    variadicLabel = label.substr(0, label.length - 3);
                                }
                            } else {
                                label = docParams[i].match(/`(.*?)(\.\.\.|)(&|)(\$[0-9a-z_]+)/i)[1].trim();
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
    return false
}