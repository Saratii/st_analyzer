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
class Catagory {
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
        }
        else {
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
//# sourceMappingURL=extension.js.map