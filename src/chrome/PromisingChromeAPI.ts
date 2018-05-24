import { promisify } from '../utils/Promisify';

const winsGetAll = promisify<chrome.windows.Window[]>(chrome.windows.getAll);
const winsCreate = promisify<chrome.windows.Window | undefined>(chrome.windows.create);
const winsUpdate = promisify<chrome.windows.Window>(chrome.windows.update);
const winsRemove = promisify<void>(chrome.windows.remove);
const tabsCreate = promisify<chrome.tabs.Tab>(chrome.tabs.create);
const tabsUpdate = promisify<chrome.tabs.Tab | undefined>(chrome.tabs.update);
const tabsRemove = promisify<void>(chrome.tabs.remove);

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