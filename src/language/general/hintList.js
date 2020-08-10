const Hints = require("../../lib/hints");
const { Range } = require("vscode");

class HintList {
    constructor(positionOf, editor) {
        this.hints = [];
        this.positionOf = positionOf;
        this.editor = editor;
    }
    addHint(hint = null) {
        if (hint) {
            this.hints.push(hint);
            return true;
        } else {
            return false;
        }
    }
    nodeVisible(node) {
        let lineStart = this.positionOf(node.start).line;
        let lineEnd = this.positionOf(node.final_end).line;
        for (let range of this.editor.visibleRanges) {
            let maxStart = Math.max(0, range.start.line - 100);
            let maxEnd = range.end.line + 100;
            if (lineStart >= maxStart && lineStart <= maxEnd) {
                return true;
            }
            if (lineEnd >= maxStart && lineEnd <= maxEnd) {
                return true;
            }
            if (lineStart <= maxStart && lineEnd >= maxEnd) {
                return true;
            }
        }
        return false;


    }
    clearHints() {
        this.hints = [];
    }
    getHints() {
        let hintList = [];
        for (let hint of this.hints) {
            hintList.push(Hints.paramHint(hint.label, new Range(
                this.positionOf(hint.start),
                this.positionOf(hint.end),
            )));
        }
        return hintList;
    }
}
module.exports = HintList;