[puppeteer-extension-transport](../README.md) / [Exports](../modules.md) / ExtensionDebuggerTransport

# Class: ExtensionDebuggerTransport

A puppeteer connection transport for extension.

## Implements

- `ConnectionTransport`

## Table of contents

### Properties

- [delay](ExtensionDebuggerTransport.md#delay)

### Methods

- [create](ExtensionDebuggerTransport.md#create)

## Properties

### delay

• **delay**: `number`

If required, adjust this value to increase or decrese delay in ms between subsequent commands.
> Note :- decreasing it too much can give issues

**`default`** 0.03 * 1000

#### Defined in

[index.ts:36](https://github.com/gajananpp/puppeteer-extension-transport/blob/305df11/lib/index.ts#L36)

## Methods

### create

▸ `Static` **create**(`tabId`, `functionSerializer?`): `Promise`<[`ExtensionDebuggerTransport`](ExtensionDebuggerTransport.md)\>

Returns a puppeteer connection transport instance for extension.

**`example`**
How to use it:
```javascript
const extensionTransport = await ExtensionDebuggerTransport.create(tabId)
const browser = await puppeteer.connect({
 transport: extensionTransport,
 defaultViewport: null
})

// use first page from pages instead of using browser.newPage()
const [page] = await browser.pages()
await page.goto('https://wikipedia.org')
```

**`throws`** Error
If debugger permission not given to extension

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tabId` | `number` | The id of tab to target. You can get this using chrome.tabs api |
| `functionSerializer?` | `FunctionConstructor` | Optional function serializer. If not specified and if extension's manifest.json contains `unsafe_eval` then defaults to `new Function()` else defaults to `() => {}` |

#### Returns

`Promise`<[`ExtensionDebuggerTransport`](ExtensionDebuggerTransport.md)\>

- The instance of [ExtensionDebuggerTransport](ExtensionDebuggerTransport.md)

#### Defined in

[index.ts:71](https://github.com/gajananpp/puppeteer-extension-transport/blob/305df11/lib/index.ts#L71)
