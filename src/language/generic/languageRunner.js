const { getPositionOfFrom } = require("../../lib/getPositionOfFrom");
const { promiseList } = require("../../lib/promiseList");
const HintList = require("./hintList");

module.exports = async (state, pipeline, editor, parser, after, providers, parserOptions = {}) => {
    let text = editor.document.getText();
    let positionOf = getPositionOfFrom(editor);
    let nodes = parser(text, parserOptions);
    const runner = async () => {
        let hintList = new HintList(positionOf, editor);
        let promises = promiseList();
        for (let node of nodes) {
            if (hintList.nodeVisible(node)) {
                let pipes = pipeline(async () => {
                    let provider = await providers[0](editor, node, positionOf);
                    if (provider && provider.length) {
                        provider.forEach(hint => {
                            hintList.addHint(hint);
                        })
                        return true;
                    }
                    return false;
                });
                for (var i = 1; i < providers.length; i++) {
                    pipes.pipe(
                        async () => {
                            let provider = await providers[i](editor, node, positionOf);
                            if (provider && provider.length) {
                                provider.forEach(hint => {
                                    hintList.addHint(hint);
                                })
                                return true;
                            }
                            return false;
                        }
                    )
                }
                pipes.pipe(async () => {
                    return true;
                });

                promises.push(pipes);
            }
        }
        await promises.done();

        return hintList.getHints();
    }
    let hints = await runner();
    let count = 0;
    if (!state.done) {
        after(hints);
    }
    while (hints.length == 0 && count < 3 && !state.done) {
        await new Promise(r => setTimeout(r, 2000));
        if (!state.done) {
            hints = await runner();
            if (!state.done) {
                after(hints);
            }
        }
        count++;
    }
    if (!hints || hints.length == 0) {
        return [];
    }
    if (!state.done) {
        after(hints);
    }
    return hints;
}