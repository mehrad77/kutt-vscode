import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('extension.kutt', () => {
		vscode.window.showInputBox().then(
			(value) => {
				vscode.window.showInformationMessage(value || "no link detected");
			},
			(reason) => {
				console.error("ERR001: Something bad happend.",reason)
			}
		);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
