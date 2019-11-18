import {
  windowsToString,
  stringToWindows,
  stringToSession,
} from './MarkdownSerialisation';

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

describe('Markdown Serialisation tests', () => {
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

  test('ending a window title with ~ results in invisible window', () => {
    // given a md string
    const inputMd = `:
 * http://www.bananalink.org.uk/all-about-bananas
 * https://www.bbcgoodfood.com/recipes/collection/banana

My Window~
 * http://example.com/
 * https://en.wikipedia.org/wiki/United_Fruit_Company 

~
 * http://www.google.com/
 * https://www.banana.com/
`;

    // when parsed into windows
    const ws = stringToWindows(inputMd);

    // expect the correct number of windows
    expect(ws).toHaveLength(3);
    expect(ws[0].title).toBe('');
    expect(ws[1].title).toBe('My Window');
    expect(ws[2].title).toBe('');
    expect(ws[0].visible).toBeTruthy();
    expect(ws[1].visible).toBeFalsy();
    expect(ws[2].visible).toBeFalsy();
  });

  test('invisible tab', () => {
    // given a md string
    const inputMd = `Bananas 1:
 * http://www.bananalink.org.uk/all-about-bananas
 ~ https://www.bbcgoodfood.com/recipes/collection/banana

Bananas 2~
 ~ http://example.com/
 * https://en.wikipedia.org/wiki/United_Fruit_Company 
`;

    // when parsed into windows
    const ws = stringToWindows(inputMd);

    // expect
    expect(ws[0].tabs![0].visible).toBeTruthy();
    expect(ws[0].tabs![1].visible).toBeFalsy();
  });

  test('detecting chrome-extension window', () => {
    const session = stringToSession(`
    : My Window
    * http://tab-1
    * balalala
     
    :
    * chrome-extension://index.html
    `);

    expect(session.panelWindow).not.toBeNull();
    expect(session.windows).toHaveLength(2);
    expect(session.windows[0].tabs).toHaveLength(1);
    expect(session.panelWindow.tabs).toHaveLength(1);
    expect(session.panelWindow.tabs[0].url).toBe(
      'chrome-extension://index.html'
    );
  });
});
