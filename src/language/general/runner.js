const { cancellablePromise } = require("../../lib/cancellablePromise");
const { getPositionOfFrom } = require("../../lib/getPositionOfFrom");
const { promisable, promisableOne } = require("../../lib/pipePromise")

module.exports.runner = function runner(languageRunner, editor, after) {
    let _languageRunner = null;
    let _runner = cancellablePromise(async (resolve, reject, state) => {
        let text = editor.document.getText();
        let positionOf = getPositionOfFrom(editor);

        let hints = [];
        let nodes = null;
        let exclude = [];
        _languageRunner = (_nodes = null, _exclude = null) => promisable(async () => await languageRunner((action) => {
            return promisable(action, () => state.done);
        }, text, editor, positionOf, _nodes, _exclude), () => state.done);


        try {
            [hints, nodes, exclude] = await _languageRunner().promise;
            if (hints.length === 0) {
                [hints, nodes, exclude] = await promisableOne((r) => {
                    let count = 0;
                    console.log('retry', count);
                    let retry = () => setTimeout(async () => {
                        let response = await _languageRunner(nodes, exclude).promise;
                        if (response.length && response[0].length || count > 3) {
                            r(response);
                        } else {
                            count++;
                            retry();
                        }
                    }, 2000);
                    retry();
                }, () => state.done).promise;
            }

            if (hints.length !== 0) {
                after(hints);
            }

            resolve([hints, nodes, exclude]);
        } catch (e) {
            resolve([hints, nodes, exclude]);
        }
    });
    _runner.catch(e => { });
    return _runner;
}