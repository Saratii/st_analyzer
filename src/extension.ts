import * as vscode from 'vscode';

class Catagory {
	public color: vscode.TextEditorDecorationType;
	public regex: RegExp;
	public decoration: vscode.DecorationOptions[] = [];

	constructor(color_string: string, regex: RegExp) {
		this.color = vscode.window.createTextEditorDecorationType({
			color: color_string
		});
		this.regex = regex;
	}
}

export function activate(context: vscode.ExtensionContext) {
	let timeout: NodeJS.Timeout | undefined = undefined;
	let activeEditor = vscode.window.activeTextEditor;
	const bools = new Catagory('#DF69BA', /\W(true|false)\W/g); //purple
	const functions = new Catagory('#DFA000', /\b\w+(?=\s*\()/g); //yellow
	const operators = new Catagory('#F57D26', /[+\-/*!=]/g); //orange
	const comments = new Catagory('#8DA101', /\/\/.*/g); //green
	const keywords = new Catagory('#F85552', new RegExp(['while', 'if', "for"].join('|'), 'g')); //red
	const types = new Catagory('#3A94C5', new RegExp(/\b(i64|i32|Array|<|>)\b/g)); //blue
	const catagories = [bools, functions, operators, comments, keywords, types];
	function updateDecorations() {
		if (!activeEditor) {
			return;
		}
		const text = activeEditor.document.getText();
		for (const catagory of catagories) {
			let match;
			catagory.decoration = [];
			while ((match = catagory.regex.exec(text))) {
				const startPos = activeEditor.document.positionAt(match.index);
				const endPos = activeEditor.document.positionAt(match.index + match[0].length);
				const range = new vscode.Range(startPos, endPos);
				catagory.decoration.push({ range });
			}
			activeEditor.setDecorations(catagory.color, catagory.decoration);
		}
	}

	function triggerUpdateDecorations(throttle = false) {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		if (throttle) {
			timeout = setTimeout(updateDecorations, 200);
		} else {
			updateDecorations();
		}
	}
	if (activeEditor) {
		triggerUpdateDecorations();
	}
	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations(true);
		}
	}, null, context.subscriptions);
}