const Hints = require("../../lib/hints");
const { promiseList } = require("../../lib/promiseList");
const { parser } = require("./parser");
const { hoverProvider } = require("./providers/hover");
const { signatureProvider } = require("./providers/signature");
const HintList = require("../general/hintList");

module.exports.runner = async function runner(pipeline, text, editor, positionOf, _nodes = null, _exclude = null) {
    let nodes;
    let exclude;
    if (_nodes) {
        nodes = _nodes;
        exclude = _exclude;
    } else {
        [nodes, exclude] = parser(text);
    }
    console.log('parsed');
    let hintList = new HintList(positionOf, exclude);
    let promises = promiseList();

    for (let node of nodes) {
        if (!hintList.hintExists(node)) {
            promises.push(
                pipeline(async () => {
                    let signature = await signatureProvider(editor, node, positionOf);
                    if (signature && signature.length) {
                        signature.forEach(signatureHint => {
                            hintList.addHint(node, signatureHint);
                        })
                        return true;
                    }
                    return false;
                }).pipe(
                    async () => {
                        let hover = await hoverProvider(editor, node, positionOf);
                        if (hover && hover.length) {
                            hover.forEach(hoverHint => {
                                hintList.addHint(node, hoverHint);
                            })
                            return true;
                        }
                        return false;
                    }
                ).pipe(async () => {
                    hintList.addDummy(node);
                    return true;
                }))
        }
    }
    await promises.done();
    let hints = hintList.getHints();
    return [hints, nodes, exclude];
}