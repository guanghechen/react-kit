<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/react-kit/tree/@guanghechen/dom-blob@2.3.2/packages/dom-blob#readme">@guanghechen/dom-blob</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/dom-blob">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/dom-blob.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/dom-blob">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/dom-blob.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/dom-blob">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/dom-blob.svg"
      />
    </a>
    <a href="#install">
      <img
        alt="Module Formats: cjs, esm"
        src="https://img.shields.io/badge/module_formats-cjs%2C%20esm-green.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/dom-blob"
      />
    </a>
    <a href="https://github.com/prettier/prettier">
      <img
        alt="Code Style: prettier"
        src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"
      />
    </a>
  </div>
</header>
<br/>


Utilities for processing blob objects (i.e., download / create).


## Install

* npm

  ```bash
  npm install --save @guanghechen/dom-blob
  ```

* yarn

  ```bash
  yarn add @guanghechen/dom-blob
  ```

## Usage

* `convertDataURLToBlob(dataURL: string): Blob`: Creates and returns a blob from
  a data URL (either base64 encoded or not).


* `downloadBlob(blob: Blob, filename: string): void`: emit a download task in
  browser.


[homepage]: https://github.com/guanghechen/react-kit/tree/@guanghechen/dom-blob@2.3.2/packages/dom-blob#readme
