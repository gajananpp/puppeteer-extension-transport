# Puppeteer Extension Transport

![lint](https://github.com/gajananpp/puppeteer-extension-transport/actions/workflows/lint.yml/badge.svg) 
[![npm version](https://badge.fury.io/js/puppeteer-extension-transport.svg)](https://www.npmjs.com/package/puppeteer-extension-transport)

This package allows you to use [**puppeteer-core**](https://github.com/puppeteer/puppeteer#puppeteer-core) in your browser extension's background page/service worker. It internally uses chrome.debugger extension api.

<br>

> **IMPORTANT NOTE** :- 
> For this to work, extension should have **debugger** permission and **unsafe_eval** content security policy specified in it's manifest json.
> unsafe_eval is needed since puppeteer internally uses [Function constuctors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function) and browser by default blocks it for extensions. Check [manifest.json](examples/extension/manifest.json) in examples for reference.

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

There is an [extension](examples/extension) in examples folder which you can load in your browser to test.

Here is an example of using this package:

```javascript
import puppeteer from 'puppeteer-core/lib/cjs/puppeteer/web'
import ExtensionTransport from 'puppeteer-extension-transport'

async function run(tabId) {
    const extensionTransport = await ExtensionTransport.create(tabId)
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

<br>

Check puppeteer documentation [here](https://pptr.dev/).

<br>

**Contributions are welcome**

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
"content_security_policy": "script-src 'self' 'unsafe-eval'; object-src 'self';"
```
Check example [manifest.json](examples/extension/manifest.json)

<br>

**Q: Who should use this ?**
<br>
If you are planning to do any of the following in extension:
1. do automation.
2. profiling and debugging of web pages.
3. web crawling.
4. monitor and handle page, network lifecycle events.
5. any other thing you would like to use puppeteer for.
<br>