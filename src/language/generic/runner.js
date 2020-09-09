const { cancellablePromise } = require("../../lib/cancellablePromise");
const { promisable } = require("../../lib/pipePromise")

module.exports.runner = function runner(languageRunner, editor, after, parserOptions = {}) {
    let _languageRunner = null;
    let _runner = cancellablePromise(async (resolve, reject, state) => {

        _languageRunner = () => promisable(async () => await languageRunner(state, (action) => {
            return promisable(action, () => state.done);
        }, editor, after, parserOptions), () => state.done);


        try {
            await (_languageRunner().promise);
        } catch (e) {

        }
    });
    _runner.catch(e => { /*console.log(e)*/ });
    return _runner;
}