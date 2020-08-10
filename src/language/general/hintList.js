const Hints = require("../../lib/hints");
const { Range } = require("vscode");

class HintList {
    constructor(positionOf, exclude = []) {
        this.newHints = {};
        this.positionOf = positionOf;
        this.exclude = exclude;
    }
    addHint(node, hint = null) {
        if (hint) {
            if (!this.newHints[node.hash]) {
                this.newHints[node.hash] = {};
            }
            this.newHints[node.hash][hint.label] = { ...hint };
            return true;
        } else {
            return false;
        }
    }
    addDummy(node) {
        this.newHints[node.hash] = true;
        return true;
    }
    hintExists(node) {
        if (HintList.currentHints[node.hash] === true) {
            console.log('1');
            return true;
        }
        if (HintList.currentHints[node.hash] && (!this.exclude.length || !this.exclude.includes(node.source))) {
            let hints = Object.values(HintList.currentHints[node.hash]);
            for (let _hint of hints) {
                _hint.currentNodeStart = node.start;

                if (!this.newHints[node.hash]) {
                    this.newHints[node.hash] = {};
                }
                this.newHints[node.hash][_hint.label] = { ..._hint };
            }
            return true;
        }
        return false;
    }
    clearHints() {
        HintList.currentHints = {};
        this.newHints = {};
    }
    getHints() {
        HintList.currentHints = { ...this.newHints };
        let newHints = Object.values(this.newHints);
        let hintList = [];
        for (let hintSubList of newHints) {
            if (hintSubList !== true) {
                let subHints = Object.values(hintSubList);
                for (let e of subHints) {
                    hintList.push(Hints.paramHint(e.label, new Range(
                        this.positionOf(e.start + (e.currentNodeStart - e.nodeStart)),
                        this.positionOf(e.end + (e.currentNodeStart - e.nodeStart)),
                    )));
                }
            }
        }
        return hintList;
    }
}
HintList.clear = () => {
    HintList.currentHints = {};
}
HintList.currentHints = {};
module.exports = HintList;