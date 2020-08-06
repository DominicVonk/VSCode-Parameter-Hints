const { ThemeColor, Range } = require('vscode');

class Hints {
    /**
     *
     * @param {string} message
     * @param {Range} range
     */
    static paramHint(message, range) {
        return {
            range,
            renderOptions: {
                before: {
                    opacity: 0.2,
                    color: new ThemeColor('parameterHints.hintForeground'),
                    contentText: message,
                    backgroundColor: new ThemeColor('parameterHints.hintBackground'),
                    margin: `0px 4px 0px 4px`,
                    padding: `4px 4px;`,
                    borderRadius: '5px',
                    fontStyle: 'italic',
                    fontWeight: '400',
                    fontSize: '12px'
                }
            }
        };
    }
}

module.exports = Hints;
