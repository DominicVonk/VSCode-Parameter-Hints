const { cancellablePromise } = require("../../lib/cancellablePromise");
const { getPositionOfFrom } = require("../../lib/getPositionOfFrom");
const { promisable } = require("../../lib/pipePromise")

module.exports.runner = function runner(languageRunner, editor, after) {
    let _languageRunner = null;
    let _runner = cancellablePromise(async (resolve, reject, state) => {
        let text = editor.document.getText();
        let positionOf = getPositionOfFrom(editor);

        let hints = [];
        let nodes = null;
        _languageRunner = (_nodes = null) => promisable(async () => await languageRunner((action) => {
            return promisable(action, () => state.done);
        }, text, editor, positionOf, _nodes), () => state.done);


        try {
            [hints, nodes] = await _languageRunner().promise;
            if (hints.length === 0) {
                [hints, nodes] = await new Promise((r) => {
                    let count = 0;
                    let retry = () => setTimeout(async () => {
                        let response = await _languageRunner(nodes).promise;
                        if (response.length && response[0].length || count > 3) {
                            r(response);
                        } else {
                            count++;
                            retry();
                        }
                    }, 2000);
                    retry();
                });
            }

            if (hints.length !== 0) {
                after(hints);
            }

            resolve([hints, nodes]);
        } catch (e) {
            console.log(e, 'rejected');
            resolve([hints, nodes]);
        }
    });
    _runner.catch(e => console.log(e));
    return _runner;
}