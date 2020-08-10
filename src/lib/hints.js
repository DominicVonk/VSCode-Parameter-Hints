const { ThemeColor, Range, workspace } = require('vscode');

class Hints {
    /**
     *
     * @param {string} message
     * @param {Range} range
     */
    static paramHint(message, range) {
        const currentState = workspace.getConfiguration('parameterHints');

        return {
            range,
            renderOptions: {
                before: {
                    opacity: 0.2,
                    color: new ThemeColor('parameterHints.hintForeground'),
                    contentText: message,
                    backgroundColor: new ThemeColor('parameterHints.hintBackground'),
                    margin: `${currentState.get('marginVertical')}px ${
                        currentState.get('marginHorizontal')}px; padding: ${
                        currentState.get('paddingVertical')}px ${
                        currentState.get('paddingHorizontal')}px; `,
                    borderRadius: '5px',
                    fontStyle: 'italic',
                    fontWeight: '400; font-size: 12px;'
                }
            }
        };
    }
}

module.exports = Hints;
