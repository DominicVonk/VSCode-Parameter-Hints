module.exports.getPositionOfFrom = (editor) => {
    return (characterIndex) => {
        return editor.document.positionAt(characterIndex);
    }
}