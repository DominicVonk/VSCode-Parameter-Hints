const vscode = require('vscode');
const ts = require('typescript');
const { hoverProvider } = require('../../generic/providers');
module.exports.hoverProvider = async (editor, node, positionOf) => {

    let nodePosition = positionOf(node.start);
    let hoverCommand = await hoverProvider(editor, nodePosition);
    if (hoverCommand.length > 0 && hoverCommand[0].contents && hoverCommand[0].contents.length > 0) {
        let res = hoverCommand[0].contents[0].value;
        if (res) {
            let subparams;
            let mode = vscode.workspace.getConfiguration("parameterHints").get(
                "hintingType",
            );
            let parsingString = /```typescript(.*?)```/s.exec(res);
            if (!parsingString) {
                return false;
            }
            let preparse = parsingString[1].trim();
            preparse = preparse.replace(/^var(.*?):\s*(.*?)(\s*new\s*.*?\(|\()(.*)/s, '(method) a$2($4');
            preparse = preparse.replace(/^constructor\s*([a-zA-Z0-9]+)\s*\(/s, '(method) a$1(');
            preparse = preparse.replace(/^const(.*?):\s*(.*?)(\s*new\s*.*?\(|\()(.*)/s, '(method) a$2($4');
            preparse = preparse.replace(/^let(.*?):\s*(.*?)(\s*new\s*.*?\(|\()(.*)/s, '(method) a$2($4');
            preparse = preparse.replace(/\(method\)(([^(]*?)\.|\s*)([a-z_A-Z0-9]+)(\s*\(|\s*<)/s, '(method) function $3$4');
            preparse = preparse.replace(/\(alias\)((.*?)\.|\s*)([a-z_A-Z0-9]+)(\s*\(|\s*<)/s, '(method) function $3$4');
            preparse = preparse.replace(/function (([^(]*?)\.|\s*)([a-z_A-Z0-9]+)(\s*\(|\s*<)/s, '(method) function $3$4');
            preparse = preparse.replace(/function\s*([a-zA-Z_0-9]+\.)([a-z_A-Z0-9]+)/s, 'function $2');
            preparse = preparse.replace(/\(method\)\s*function\s*([a-z_A-Z0-9]+)\s*<(.*?)>\(/s, '(method) function $1(');

            while (preparse.match((/^\(method\) /))) {
                preparse = preparse.replace(/^\(method\) /, '');
            }

            preparse = preparse.replace(/<(.*?)>(,|\)|\s*\|)/g, '$2');
            //console.log(preparse);
            let parsed = ts.createSourceFile('inline.ts', preparse, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
            subparams = parsed.statements[0].parameters;
            if (!subparams) {
                return false;
            }
            //console.log(subparams, node.arguments.length);
            let params = [];
            let variadicLabel = '';
            var variadicCounter = 0;

            for (let i = 0; i < node.arguments.length; i++) {
                let label;
                if (variadicLabel) {
                    // console.log(variadicLabel);
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
                    let variadic = false;
                    if (subparams[i].dotDotDotToken) {
                        variadic = true;
                    }
                    label = subparams[i];
                    if (mode === 'typeOnly') {
                        if (label.type && label.type.getFullText().includes('|')) {
                            label = label.type.types.map(e => {
                                if (e.elementType && e.elementType.typeName) { return e.elementType.typeName.escapedText }
                                if (e.typeName) { return e.typeName.escapedText }
                                if (e.kind === ts.SyntaxKind.FunctionType) { return 'Function' }
                                if (e.kind === ts.SyntaxKind.TypeLiteral) { return '' }
                                if (e.kind === ts.SyntaxKind.StringKeyword) { return 'String' }
                                if (e.kind === ts.SyntaxKind.NumberKeyword) { return 'Number' }
                                if (e.kind === ts.SyntaxKind.BooleanKeyword) { return 'Boolean' }
                                if (e.kind === ts.SyntaxKind.ObjectKeyword) { return 'Object' }
                                return '';
                            }).filter((v, i, a) => v).join(' | ')
                        } else {
                            let e = label.type;
                            if (e) {
                                if (e.elementType && e.elementType.typeName) { e = e.elementType.typeName.escapedText }
                                if (e.typeName) { e = e.typeName.escapedText }
                                if (e.kind === ts.SyntaxKind.FunctionType) { e = 'Function' }
                                if (e.kind === ts.SyntaxKind.TypeLiteral) { e = '' }
                                if (e.kind === ts.SyntaxKind.StringKeyword) { e = 'String' }
                                if (e.kind === ts.SyntaxKind.NumberKeyword) { e = 'Number' }
                                if (e.kind === ts.SyntaxKind.BooleanKeyword) { e = 'Boolean' }
                                if (e.kind === ts.SyntaxKind.ObjectKeyword) { e = 'Object' }
                            }
                            if (typeof e !== 'string') {
                                e = '';
                            }
                            label = e;
                        }

                        if (label && variadic) {
                            variadicLabel = label;
                        }
                    } else if (mode === 'variableAndType') {
                        let type = label.type.getFullText();

                        if (type.includes('|')) {
                            if (label.type.types) {
                                type = label.type.types.map(e => {
                                    if (e.elementType && e.elementType.typeName) { return e.elementType.typeName.escapedText }
                                    if (e.typeName) { return e.typeName.escapedText }
                                    if (e.kind === ts.SyntaxKind.FunctionType) { return 'Function' }
                                    if (e.kind === ts.SyntaxKind.TypeLiteral) { return '' }
                                    if (e.kind === ts.SyntaxKind.StringKeyword) { return 'String' }
                                    if (e.kind === ts.SyntaxKind.NumberKeyword) { return 'Number' }
                                    if (e.kind === ts.SyntaxKind.BooleanKeyword) { return 'Boolean' }
                                    if (e.kind === ts.SyntaxKind.ObjectKeyword) { return 'Object' }
                                    return '';
                                }).filter((v, i, a) => v).join(' | ')
                            } else {
                                type = '';
                            }
                        } else {
                            let e = label.type;
                            if (e) {
                                if (e.elementType && e.elementType.typeName) { e = e.elementType.typeName.escapedText }
                                if (e.typeName) { e = e.typeName.escapedText }
                                if (e.kind === ts.SyntaxKind.FunctionType) { e = 'Function' }
                                if (e.kind === ts.SyntaxKind.TypeLiteral) { e = '' }
                                if (e.kind === ts.SyntaxKind.StringKeyword) { e = 'String' }
                                if (e.kind === ts.SyntaxKind.NumberKeyword) { e = 'Number' }
                                if (e.kind === ts.SyntaxKind.BooleanKeyword) { e = 'Boolean' }
                                if (e.kind === ts.SyntaxKind.ObjectKeyword) { e = 'Object' }
                            }
                            if (typeof e !== 'string') {
                                e = '';
                            }
                            type = e;
                        }
                        label = type + ' ' + label.name.escapedText;
                    } else if (mode === 'variableOnly') {
                        label = label.name.escapedText;
                    }
                    //console.log(variadic, label);
                    if (variadic) {
                        variadicLabel = label;
                        //console.log(variadicLabel);
                        if (mode === 'typeOnly') {
                            label = variadicLabel;
                        } else {
                            label = variadicLabel + '[' + variadicCounter + ']';
                        }
                        variadicCounter++;
                    }
                }
                if (label) {
                    params.push({
                        label: label.trim() + ':',
                        start: node.arguments[i].getStart(),
                        end: node.arguments[i].getEnd()
                    });
                }
            }
            return params;
        }
    }

    return false
}