import * as vscode from 'vscode';
import axios from 'axios';
import { IUrl } from './types';

const DOMAIN = 'https://kutt.it';
const URL_REGEX = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('extension.kutt', async () => {

		let USER_API_KEY = context.globalState.get('API_KEY', '');
		console.log(Boolean(USER_API_KEY),{USER_API_KEY})

		// if there was no API key stored in extention storage, ask for one
		if(USER_API_KEY){
			axios.defaults.headers.common['X-API-Key'] = USER_API_KEY;
			await shortURL(context);
		}
		else {
			await askForAPIKey(context).then(
				() => shortURL(context)
			);
			
		}
	});

	context.subscriptions.push(disposable);
}

const askForAPIKey = (context: any) => {
	return new Promise(resolve => {
		console.log("asking is happning!")
		vscode.window.showInputBox({
			placeHolder:"Enter you kutt.it API key...",
			prompt: "you can find you API key in https://kutt.it/settings",
			validateInput: (value) => {
				if(value.match(/.{40}/)) return null;
				return "API lenght must be 40 character length."
			}
		})
		.then(
			(value?: string) => {
				context.globalState.update('API_KEY', value);
				axios.defaults.headers.common['X-API-Key'] = value;
				resolve();
			},
			(reason: any) => {
				console.error("ERR002: Something bad happend.",reason)
			}
		);
	});
}


const shortURL = (context: any) => {
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
								console.log({url})
								vscode.window.showInformationMessage(`Shorted link is ${url.shortUrl}`);
								resolve();
							}
						).catch((error) => {
							// Error 😨
							if (error.response) {
								/*
								 * The request was made and the server responded with a
								 * status code that falls out of the range of 2xx
								 */
								console.log(error.response.data);
								console.log(error.response.status);
								console.log(error.response.headers);
								if(error.response.status == 401){
									context.globalState.update('API_KEY', null);
									axios.defaults.headers.common['X-API-Key'] = "";
									vscode.window.showErrorMessage(`Your API Key is not valid! please enter it again.`);
								}
								resolve();
							} else {
								// Something happened in setting up the request and triggered an Error
								console.log('ERR004:', error.message);
							}
						});
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
}
// this method is called when your extension is deactivated
export function deactivate() {}
