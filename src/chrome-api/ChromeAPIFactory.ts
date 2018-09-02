import { PromisingChromeAPI } from './PromisingChromeAPI';
import RealPromisingChromeAPI from './RealPromisingChromeAPI';
import FakePromisingChromeAPI from './FakePromisingChromeAPI';

export default function (): PromisingChromeAPI {
	return (chrome && chrome.windows) ?
		new RealPromisingChromeAPI() :
		new FakePromisingChromeAPI();
}