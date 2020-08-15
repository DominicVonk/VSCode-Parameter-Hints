const { hoverProvider } = require("./providers/hover");
const { signatureProvider } = require("./providers/signature");
const { parser } = require("./parser");
const languageRunner = require("../generic/languageRunner");

module.exports.runner = async function runner(state, pipeline, editor, after) {
    return await languageRunner(state, pipeline, editor, parser, after, [signatureProvider, hoverProvider]);
}