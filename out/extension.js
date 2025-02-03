"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
class Category {
    color;
    regex;
    decoration = [];
    constructor(color_string, regex) {
        this.color = vscode.window.createTextEditorDecorationType({
            color: color_string
        });
        this.regex = regex;
    }
}
function activate(context) {
    let timeout = undefined;
    let activeEditor = vscode.window.activeTextEditor;
    const bools = new Category('#DF69BA', /\W(true|false)\W/g); //purple
    const functions = new Category('#DFA000', /\b\w+(?=\s*\()/g); //yellow
    const operators = new Category('#F57D26', /[+\-/*!=]/g); //orange
    const comments = new Category('#8DA101', /\/\/.*/g); //green
    const keywords = new Category('#F85552', new RegExp(['while', 'if', "for"].join('|'), 'g')); //red
    const types = new Category('#3A94C5', new RegExp(/\b(i64|i32|Array|<|>)\b/g)); //blue
    const categories = [bools, functions, operators, comments, keywords, types];
    function isStFile(editor) {
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
        }
        else {
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
//# sourceMappingURL=extension.js.map