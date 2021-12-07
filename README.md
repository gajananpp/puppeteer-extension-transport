# Puppeteer Extension Transport

![lint](https://github.com/gajananpp/puppeteer-extension-transport/actions/workflows/lint.yml/badge.svg) 
![build](https://github.com/gajananpp/puppeteer-extension-transport/actions/workflows/build.yml/badge.svg) 
[![npm version](https://badge.fury.io/js/puppeteer-extension-transport.svg)](https://www.npmjs.com/package/puppeteer-extension-transport)

This package allows you to use [**puppeteer-core**](https://github.com/puppeteer/puppeteer#puppeteer-core) in your browser extension's background page/service worker. It internally uses chrome.debugger extension api.

<br>

> **IMPORTANT NOTE** :- 
> For this to work, extension should have **debugger** permission specified in it's manifest json. Check [manifest.json](examples/extension-v2/manifest.json) in examples for reference.

<br>

## Installation

To install this package run:
```
npm i puppeteer-extension-transport
```
or with yarn:
```
yarn add puppeteer-extension-transport
```

<br>

## Usage

There are [v2 extension example](examples/extension-v2) and [v3 extension example](examples/extension-v3) in examples folder which you can load in your browser to test.

Here is an example of using this package:

```javascript
import puppeteer from 'puppeteer-core/lib/cjs/puppeteer/web'
import { ExtensionDebuggerTransport } from 'puppeteer-extension-transport'

async function run(tabId) {
    const extensionTransport = await ExtensionDebuggerTransport.create(tabId)
    const browser = await puppeteer.connect({
        transport: extensionTransport,
        defaultViewport: null,
    })

      // use first page from pages instead of using browser.newPage()
    const [page] = await browser.pages()

    await page.goto('https://wikipedia.org')

    const screenshot = await page.screenshot({
        encoding: 'base64',
    });
    console.log(`data:image/png;base64,${screenshot}`)

    const englishButton = await page.waitForSelector('#js-link-box-en > strong')
    await englishButton.click()

    const searchBox = await page.waitForSelector('#searchInput');
    await searchBox.type('telephone')
    await page.keyboard.press('Enter')

    await page.close();
}

chrome.tabs.create(
    {
        active: true,
        url: 'https://www.google.co.in',
    },
    tab => (tab.id ? run(tab.id) : null)
)
```
Execution :

![execution gif](examples/execution.gif)

<br>

Check puppeteer documentation [here](https://pptr.dev/).

<br>

## API

Check other available options/config for this package [here](docs/README.md).

<br>

## FAQ

**Q: With which browsers can this be used ?**
<br>
This can be used with chrome and chromium based edge browsers.

<br>

**Q: Does this require browser to be started with some CLI flags ?**
<br>
No. This package internally uses `chrome.debugger` api to communicate with chrome devtools protocol.

<br>

**Q: What do i need to specify in manifest.json of extension ?**
<br>
You will atleast need to specify below in manifest.json:
```json
"permissions": ["debugger"]
```
Check example [v2 manifest.json](examples/extension-v2/manifest.json) or [v3 manifest.json](examples/extension-v3/manifest.json) 

<br>

**Q: Who could use this ?**
<br>
If you are planning to do any of the following in extension:
1. do automation.
2. profiling, debugging, monitoring and handling lifecycle events of web pages.
3. any other thing you would like to use puppeteer for.
<br>