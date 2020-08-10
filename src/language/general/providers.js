const vscode = require('vscode');

module.exports.hoverProvider = async (editor, nodePosition) => {
    return await vscode.commands.executeCommand(
        "vscode.executeHoverProvider",
        editor.document.uri,
        nodePosition,
    );
}
module.exports.signatureProvider = async (editor, nodePosition) => {
    return await vscode.commands.executeCommand(
        "vscode.executeSignatureHelpProvider",
        editor.document.uri,
        nodePosition,
        '(');
}