import * as vscode from 'vscode';
import axios from 'axios';
import { IUrl } from './types';
const DOMAIN = 'https://kutt.it';
const API_KEY = "DcJCiKE8bXI7oCdtszyuWzY4XThrueJvmtpFwQw0";

axios.defaults.headers.common['X-API-Key'] = API_KEY;

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('extension.kutt', () => {
		vscode.window.showInputBox().then(
			(value) => {
				axios.post(`${DOMAIN}/api/url/submit`, {
					target: "https://google.com",
				})
				.then(
					res => {
						const url:IUrl = res.data;
						vscode.window.showInformationMessage(`Shorted link is ${url.shortUrl}`);
					}
				)
				
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
