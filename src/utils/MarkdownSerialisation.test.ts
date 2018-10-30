import { windowsToString, stringToWindows } from './MarkdownSerialisation';

// basic serialisation tests

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

////

const expectedMDextra = `My Window 482:
 * http://www.bananalink.org.uk/all-about-bananas
 * https://www.bbcgoodfood.com/recipes/collection/banana

My Window:
 * http://example.com/
 * https://en.wikipedia.org/wiki/United_Fruit_Company
`;

test('no leading space on tab lines', () => {

	const inputMd = `My Window 482:
* http://www.bananalink.org.uk/all-about-bananas
* https://www.bbcgoodfood.com/recipes/collection/banana

My Window:
* http://example.com/
* https://en.wikipedia.org/wiki/United_Fruit_Company
`;
	const windows = stringToWindows(inputMd);
	const newStr = windowsToString(windows);
	expect(newStr).toEqual(expectedMDextra);
});

test('no asteriscs on tab lines', () => {

	const inputMd = `My Window 482:
http://www.bananalink.org.uk/all-about-bananas
https://www.bbcgoodfood.com/recipes/collection/banana

My Window:
http://example.com/
https://en.wikipedia.org/wiki/United_Fruit_Company
`;
	const windows = stringToWindows(inputMd);
	const newStr = windowsToString(windows);
	expect(newStr).toEqual(expectedMDextra);
});

test('no asteriscs but some spaces on tab lines', () => {

	const inputMd = `My Window 482:
http://www.bananalink.org.uk/all-about-bananas
https://www.bbcgoodfood.com/recipes/collection/banana

My Window:
http://example.com/
 https://en.wikipedia.org/wiki/United_Fruit_Company
`;

	const windows = stringToWindows(inputMd);
	const newStr = windowsToString(windows);
	expect(newStr).toEqual(expectedMDextra);
});

test('no window title line', () => {

	const inputMd = `http://www.bananalink.org.uk/all-about-bananas
https://www.bbcgoodfood.com/recipes/collection/banana

My Window:
http://example.com/
 https://en.wikipedia.org/wiki/United_Fruit_Company
`;

	const noTitleExpectedMd = `Window:
 * http://www.bananalink.org.uk/all-about-bananas
 * https://www.bbcgoodfood.com/recipes/collection/banana

My Window:
 * http://example.com/
 * https://en.wikipedia.org/wiki/United_Fruit_Company
`;

	const windows = stringToWindows(inputMd);
	const newStr = windowsToString(windows);
	expect(newStr).toEqual(noTitleExpectedMd);
});