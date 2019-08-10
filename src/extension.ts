import * as vscode from 'vscode';
import axios from 'axios';
import { IUrl } from './types';

const DOMAIN = 'https://kutt.it';
const API_KEY = "DcJCiKE8bXI7oCdtszyuWzY4XThrueJvmtpFwQw0";
const URL_REGEX = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

axios.defaults.headers.common['X-API-Key'] = API_KEY;

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('extension.kutt', () => {
		vscode.window.showInputBox().then(
			(value) => {
				if(value && value.match(URL_REGEX)){
					axios.post(`${DOMAIN}/api/url/submit`, {
						target: value,
					})
					.then(
						res => {
							const url:IUrl = res.data;
							vscode.window.showInformationMessage(`Shorted link is ${url.shortUrl}`);
						}
					)
				}
				else {
					!value ?
						vscode.window.showErrorMessage(`You enterd nothing. nothing can't be short. nothing is long and painfull.`)
					:
						vscode.window.showErrorMessage(`The url "${value}" is not valid.`);
				}
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
