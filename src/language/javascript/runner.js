const Hints = require("../../lib/hints");
const { promiseList } = require("../../lib/promiseList");
const { parser } = require("./parser");
const { hoverProvider } = require("./providers/hover");
const { signatureProvider } = require("./providers/signature");

module.exports.runner = async function runner(pipeline, text, editor, positionOf, _nodes = null) {
    let nodes;
    if (_nodes) {
        nodes = _nodes;
    } else {
        nodes = parser(text);
    }
    let promises = promiseList();
    let hints = [];
    for (let node of nodes) {
        promises.push(
            pipeline(async () => {
                let signature = await signatureProvider(editor, node, positionOf);
                if (signature && signature.length) {
                    signature.forEach(signatureHint => {
                        hints.push(Hints.paramHint(signatureHint.label, signatureHint.range));
                    })
                    return true;
                }
                return false;
            }).pipe(
                async () => {
                    let hover = await hoverProvider(editor, node, positionOf);
                    if (hover && hover.length) {
                        hover.forEach(hoverHint => {
                            hints.push(Hints.paramHint(hoverHint.label, hoverHint.range));
                        })
                        return true;
                    }
                    return false;
                }
            ).pipe(async () => {
                return true;
            }))
    }
    await promises.done();
    return [hints, nodes];
}