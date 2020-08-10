const vscode = require('vscode');
let hoverParamsGenerated = {};
let signatureHelpParamsGenerated = {};

module.exports.resetCache = () => {
    hoverParamsGenerated = {};
    signatureHelpParamsGenerated = {};
}

module.exports.hoverProvider = async (editor, node, nodePosition) => {
    let hoverCommand;
    /*if (typeof hoverParamsGenerated[node.hash] !== 'undefined') {
        hoverCommand = hoverParamsGenerated[node.hash];
    } else {*/
    hoverCommand = await vscode.commands.executeCommand(
        "vscode.executeHoverProvider",
        editor.document.uri,
        nodePosition,
    );

    //   hoverParamsGenerated[node.hash] = hoverCommand || false;
    //}
    return hoverCommand;
}
module.exports.signatureProvider = async (editor, node, nodePosition) => {
    let signatureHelp;
    /* if (typeof signatureHelpParamsGenerated[node.hash] !== 'undefined') {
         signatureHelp = signatureHelpParamsGenerated[node.hash];
     } else {*/
    signatureHelp = await vscode.commands.executeCommand(
        "vscode.executeSignatureHelpProvider",
        editor.document.uri,
        nodePosition,
        '(');

    //       signatureHelpParamsGenerated[node.hash] = signatureHelp || false;
    //}
    return signatureHelp;
}