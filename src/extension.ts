import * as vscode from 'vscode';

class Category {
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

	const bools = new Category('#DF69BA', /\W(true|false)\W/g); //purple
	const functions = new Category('#DFA000', /\b\w+(?=\s*\()/g); //yellow
	const operators = new Category('#F57D26', /[+\-/*!=]/g); //orange
	const comments = new Category('#8DA101', /\/\/.*/g); //green
	const keywords = new Category('#F85552', new RegExp(['while', 'if', "for"].join('|'), 'g')); //red
	const types = new Category('#3A94C5', new RegExp(/\b(i64|i32|Array|<|>)\b/g)); //blue
	const categories = [bools, functions, operators, comments, keywords, types];

	function isStFile(editor: vscode.TextEditor | undefined): boolean {
		return editor?.document.fileName.endsWith('.st') ?? false;
	}

	function updateDecorations() {
		if (!activeEditor || !isStFile(activeEditor)) {
			return;
		}
		const text = activeEditor.document.getText();
		for (const category of categories) {
			let match;
			category.decoration = [];
			while ((match = category.regex.exec(text))) {
				const startPos = activeEditor.document.positionAt(match.index);
				const endPos = activeEditor.document.positionAt(match.index + match[0].length);
				const range = new vscode.Range(startPos, endPos);
				category.decoration.push({ range });
			}
			activeEditor.setDecorations(category.color, category.decoration);
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

	if (activeEditor && isStFile(activeEditor)) {
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor && isStFile(editor)) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document && isStFile(activeEditor)) {
			triggerUpdateDecorations(true);
		}
	}, null, context.subscriptions);
}
