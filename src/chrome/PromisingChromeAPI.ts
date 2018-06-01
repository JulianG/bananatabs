/*
tslint:disable no-any
*/

import { promisify } from '../utils/Promisify';

let winsGetAll: (...args: any[]) => Promise<chrome.windows.Window[]>;
let winsCreate: (...args: any[]) => Promise<chrome.windows.Window | undefined>;
let winsRemove: (...args: any[]) => Promise<void>;
let winsUpdate: (...args: any[]) => Promise<chrome.windows.Window>;
let tabsCreate: (...args: any[]) => Promise<chrome.tabs.Tab>;
let tabsUpdate: (...args: any[]) => Promise<chrome.tabs.Tab | undefined>;
let tabsRemove: (...args: any[]) => Promise<void>;

if (chrome && chrome.windows) {
	winsGetAll = promisify<chrome.windows.Window[]>(chrome.windows.getAll);
	winsCreate = promisify<chrome.windows.Window | undefined>(chrome.windows.create);
	winsRemove = promisify<void>(chrome.windows.remove);
	winsUpdate = promisify<chrome.windows.Window>(chrome.windows.update);
	tabsCreate = promisify<chrome.tabs.Tab>(chrome.tabs.create);
	tabsUpdate = promisify<chrome.tabs.Tab | undefined>(chrome.tabs.update);
	tabsRemove = promisify<void>(chrome.tabs.remove);
}

export const PromisingChromeAPI = {
	windows: {

		getAll: (getInfo: chrome.windows.GetInfo) => {
			return winsGetAll(getInfo);
		},
		create: (createData: chrome.windows.CreateData) => {
			return winsCreate(createData);
		},
		update: (id: number, updateInfo: chrome.windows.UpdateInfo) => {
			winsUpdate(id, updateInfo);
		},
		remove: (id: number) => {
			return winsRemove(id);
		}
	},
	tabs: {
		create: (props: chrome.tabs.CreateProperties) => {
			return tabsCreate(props);
		},
		update: (id: number, props: chrome.tabs.UpdateProperties) => {
			return tabsUpdate(id, props);
		},
		remove: (id: number) => {
			return tabsRemove(id);
		}
	}
};