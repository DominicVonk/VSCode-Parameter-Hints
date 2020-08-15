// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { runner } = require('./language/generic/runner');
const { runner: phpRunner } = require('./language/php/runner');
const { runner: typescriptRunner } = require('./language/typescript/runner');
const ts = require('typescript');

const hintDecorationType = vscode.window.createTextEditorDecorationType({});
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
	let activeEditor = vscode.window.activeTextEditor;
	let currentRunner = null;

	const messageHeader = 'Parameter Hints: ';
	const hideMessageAfterMs = 3000;
	const isEnabled = () => vscode.workspace.getConfiguration("parameterHints").get(
		"enabled",
	);
	const languagesEnabled = () => vscode.workspace.getConfiguration("parameterHints").get(
		"languages",
	);

	let timeout = null;
	const trigger = (identifier, editor, force, time = 100) => {
		if (currentRunner && !currentRunner.state.done) {
			currentRunner.reject();
		}
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => {
			if (editor && (isEnabled() || force)) {
				if (languagesEnabled().includes("php") && editor.document.languageId === 'php') {
					currentRunner = runner(phpRunner, editor, hints => {
						if (hints !== false && isEnabled()) {
							if (hints.length) {
								editor.setDecorations(hintDecorationType, hints);
							} else {
								editor.setDecorations(hintDecorationType, [new vscode.Range(0, 0, 0, 0)]);
							}

						}
					})
				} else if (languagesEnabled().includes("typescript") && editor.document.languageId === 'typescript') {
					currentRunner = runner(typescriptRunner, editor, hints => {
						if (hints !== false && isEnabled()) {
							if (hints.length) {
								editor.setDecorations(hintDecorationType, hints);
							} else {
								editor.setDecorations(hintDecorationType, [new vscode.Range(0, 0, 0, 0)]);
							}

						}
					}, { language: ts.ScriptKind.TS })
				} else if (languagesEnabled().includes("typescriptreact") && editor.document.languageId === 'typescriptreact') {
					currentRunner = runner(typescriptRunner, editor, hints => {
						if (hints !== false && isEnabled()) {
							if (hints.length) {
								editor.setDecorations(hintDecorationType, hints);
							} else {
								editor.setDecorations(hintDecorationType, [new vscode.Range(0, 0, 0, 0)]);
							}

						}
					}, { language: ts.ScriptKind.TSX })
				} else if (languagesEnabled().includes("javascript") && editor.document.languageId === 'javascript') {
					currentRunner = runner(typescriptRunner, editor, hints => {
						if (hints !== false && isEnabled()) {
							if (hints.length) {
								editor.setDecorations(hintDecorationType, hints);
							} else {
								editor.setDecorations(hintDecorationType, [new vscode.Range(0, 0, 0, 0)]);
							}

						}
					}, { language: ts.ScriptKind.JS })
				} else if (languagesEnabled().includes("javascriptreact") && editor.document.languageId === 'javascriptreact') {
					currentRunner = runner(typescriptRunner, editor, hints => {
						if (hints !== false && isEnabled()) {
							if (hints.length) {
								editor.setDecorations(hintDecorationType, hints);
							} else {
								editor.setDecorations(hintDecorationType, [new vscode.Range(0, 0, 0, 0)]);
							}

						}
					}, { language: ts.ScriptKind.JSX })
				}
			}
		}, time);
	}
	const clear = (editor) => {
		if (timeout) {
			clearTimeout(timeout);
		}
		currentRunner && !currentRunner.state.done && currentRunner.reject();
		editor && editor.setDecorations(hintDecorationType, [new vscode.Range(0, 0, 0, 0)]);
	}


	vscode.commands.registerCommand('parameterHints.toggle', () => {
		const currentState = vscode.workspace.getConfiguration('parameterHints').get('enabled');
		let message = `${messageHeader} Hints ${currentState ? 'disabled' : 'enabled'}`;

		vscode.workspace.getConfiguration('parameterHints').update('enabled', !currentState, true);
		if (currentState) {
			clear(activeEditor)
		} else {
			trigger('restart', activeEditor, true)
		}
		vscode.window.setStatusBarMessage(message, hideMessageAfterMs);
	})

	trigger('on start', activeEditor, false, 100);

	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		trigger('change_active_text_editor', activeEditor, false, 100);
	}));

	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
		if (event.contentChanges.length) {
			trigger('text edited', activeEditor, false, 300);
		}
	}))

	context.subscriptions.push(vscode.window.onDidChangeTextEditorVisibleRanges(event => {
		activeEditor = event.textEditor;
		trigger('scroll', activeEditor, false, 100);
	}))
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
