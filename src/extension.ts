import * as vscode from 'vscode';
import axios from 'axios';
import { IUrl } from './types';

const DOMAIN = 'https://kutt.it';
const URL_REGEX = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('extension.kutt', () => {

		let USER_API_KEY = context.globalState.get('API_KEY', '');
		axios.defaults.headers.common['X-API-Key'] = USER_API_KEY;

		// if there was no APi key stored in extention storage, ask for one
		if(!USER_API_KEY){
			vscode.window.showInputBox({
				placeHolder:"Enter you kutt.it API key...",
				validateInput: (value) => {
					if(value.match(/.{40}/)) return null;
					return "API lenght must be 40 character length."
				}
			})
			.then(
				(value?: string) => {
					context.globalState.update('API_KEY', value);
					axios.defaults.headers.common['X-API-Key'] = value;
				},
				(reason: any) => {
					console.error("ERR002: Something bad happend.",reason)
				}
			);
		}
		
		vscode.window.showInputBox({
				placeHolder:"Enter the URL you want to short...",
				ignoreFocusOut: true
		}).then(
			(value?: string) => {
				if(value && value.match(URL_REGEX)){
					vscode.window.withProgress({
						location: vscode.ProgressLocation.Notification,
						title: "Trying to short it...",
						cancellable: true
					}, (progress: any, token: any) => {

						token.onCancellationRequested(() => {
							console.log("User canceled the long running operation");
						});

						return new Promise(resolve => {
							axios.post(`${DOMAIN}/api/url/submit`, {
								target: value,
							})
							.then(
								(res: any) => {
									const url:IUrl = res.data;
									vscode.window.showInformationMessage(`Shorted link is ${url.shortUrl}`);
									resolve();
								}
							)
						});
					});
				}
				else {
					!value ?
						vscode.window.showErrorMessage(`You enterd nothing. nothing can't be short. nothing is long and painfull.`)
					:
						vscode.window.showErrorMessage(`The url "${value}" is not valid.`);
				}
			},
			(reason: any) => {
				console.error("ERR001: Something bad happend.",reason)
			}
		);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
