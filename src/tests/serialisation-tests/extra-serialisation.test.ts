import { windowsToString, stringToWindows } from '../../utils/SessionUtils';

const expectedMd = `My Window 482:
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
	expect(newStr).toEqual(expectedMd);
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
	expect(newStr).toEqual(expectedMd);
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
	expect(newStr).toEqual(expectedMd);
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