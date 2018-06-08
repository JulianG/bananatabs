import { windowsToString, stringToWindows } from '../../utils/SessionUtils';

const basicMd = `My Window 482:
 * http://www.bananalink.org.uk/all-about-bananas
 * https://www.bbcgoodfood.com/recipes/collection/banana

My Window:
 * http://example.com/
 * https://en.wikipedia.org/wiki/United_Fruit_Company

My Bananas:
 * http://localhost:3000/
`;

const expectedMd = `My Window 482:
 * http://www.bananalink.org.uk/all-about-bananas
 * https://www.bbcgoodfood.com/recipes/collection/banana

My Window:
 * http://example.com/
 * https://en.wikipedia.org/wiki/United_Fruit_Company

My Bananas:
 * http://localhost:3000/
`;

test('basic test', () => {
	const windows = stringToWindows(basicMd);
	const newStr = windowsToString(windows);
	expect(newStr).toEqual(expectedMd);
});

test('leading empty line', () => {
	const initialMd = `\n${basicMd}`;
	const windows = stringToWindows(initialMd);
	const newStr = windowsToString(windows);
	expect(newStr).toEqual(expectedMd);
});

test('two leading empty lines', () => {
	const initialMd = `\n\n${basicMd}`;
	const windows = stringToWindows(initialMd);
	const newStr = windowsToString(windows);
	expect(newStr).toEqual(expectedMd);
});

test('trailing empty line', () => {
	const initialMd = `${basicMd}\n`;
	const windows = stringToWindows(initialMd);
	const newStr = windowsToString(windows);
	expect(newStr).toEqual(expectedMd);
});

test('two trailing empty line', () => {
	const initialMd = `${basicMd}\n\n`;
	const windows = stringToWindows(initialMd);
	const newStr = windowsToString(windows);
	expect(newStr).toEqual(expectedMd);
});

test('two empty lines between groups', () => {
	const initialMd = `My Window 482:
 * http://www.bananalink.org.uk/all-about-bananas
 * https://www.bbcgoodfood.com/recipes/collection/banana


My Window:
 * http://example.com/
 * https://en.wikipedia.org/wiki/United_Fruit_Company


My Bananas:
 * http://localhost:3000/
`;
	const windows = stringToWindows(initialMd);
	const newStr = windowsToString(windows);
	expect(newStr).toEqual(expectedMd);
});

test('tab lines without valid urls are ignored', () => {
	const initialMd = `
My Window 482:
 * http://www.bananalink.org.uk/all-about-bananas
 * https://www.bbcgoodfood.com/recipes/collection/banana
 * dadadada
	
My Window:
 * http://example.com/
 * https://en.wikipedia.org/wiki/United_Fruit_Company
	
My Bananas:
 * http://localhost:3000/
`;
	const windows = stringToWindows(initialMd);
	const newStr = windowsToString(windows);
	expect(newStr).toEqual(expectedMd);
});