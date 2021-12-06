import puppeteer from 'puppeteer-core/lib/cjs/puppeteer/web';
import {ExtensionDebuggerTransport} from '../../lib';

const run = async (tabId: number) => {
  const extensionTransport = await ExtensionDebuggerTransport.create(tabId);
  const browser = await puppeteer.connect({
    transport: extensionTransport,
    defaultViewport: null,
  });

  // use first page from pages instead of using browser.newPage()
  const [page] = await browser.pages();

  await page.goto('https://wikipedia.org');

  const screenshot = await page.screenshot({
    encoding: 'base64',
  });
  console.log(`data:image/png;base64,${screenshot}`);

  const englishButton = await page.waitForSelector('#js-link-box-en > strong');
  await englishButton?.click();

  const searchBox = await page.waitForSelector('#searchInput');
  await searchBox?.type('telephone');
  await page.keyboard.press('Enter');

  await page.close();
};

chrome.commands.onCommand.addListener(command => {
  if (command === 'test') {
    chrome.tabs.create(
      {
        active: true,
        url: 'https://www.google.co.in',
      },
      tab => (tab.id ? run(tab.id) : null)
    );
  }
});
