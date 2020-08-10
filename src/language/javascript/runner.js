const Hints = require("../../lib/hints");
const { promiseList } = require("../../lib/promiseList");
const { parser } = require("./parser");
const { hoverProvider } = require("./providers/hover");
const { signatureProvider } = require("./providers/signature");
const HintList = require("../general/hintList");

module.exports.runner = async function runner(pipeline, text, editor, positionOf, _nodes = null) {
    let nodes;
    if (_nodes) {
        nodes = _nodes;
    } else {
        nodes = parser(text);
    }
    let hintList = new HintList(positionOf, editor);
    let promises = promiseList();

    for (let node of nodes) {
        if (hintList.nodeVisible(node)) {
            promises.push(
                pipeline(async () => {
                    let signature = await signatureProvider(editor, node, positionOf);
                    if (signature && signature.length) {
                        signature.forEach(signatureHint => {
                            hintList.addHint(signatureHint);
                        })
                        return true;
                    }
                    return false;
                }).pipe(
                    async () => {
                        let hover = await hoverProvider(editor, node, positionOf);
                        if (hover && hover.length) {
                            hover.forEach(hoverHint => {
                                hintList.addHint(hoverHint);
                            })
                            return true;
                        }
                        return false;
                    }
                ).pipe(async () => {
                    return true;
                }))
        }
    }
    await promises.done();
    let hints = hintList.getHints();
    return [hints, nodes];
}