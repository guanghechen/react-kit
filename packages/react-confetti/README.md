<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/react-kit/tree/@guanghechen/react-confetti@2.3.10/packages/react-confetti#readme">@guanghechen/react-confetti</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/react-confetti">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/react-confetti.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/react-confetti">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/react-confetti.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/react-confetti">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/react-confetti.svg"
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
        src="https://img.shields.io/node/v/@guanghechen/react-confetti"
      />
    </a>
    <a href="https://github.com/facebook/jest">
      <img
        alt="Tested with Jest"
        src="https://img.shields.io/badge/tested_with-jest-9c465e.svg"
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


Simple confetti particle in React.

## Install

* npm

  ```bash
  npm install --save @guanghechen/react-confetti
  ```

* yarn

  ```bash
  yarn add @guanghechen/react-confetti
  ```

## Usage

```tsx
import { useThrowRandomConfetti } from '@guanghechen/react-confetti'
import React from 'react'

const App: React.FC = () => {
  const throwConfetti = useThrowRandomConfetti()
  const [tick, setTick] = React.useState<number>(0)

  React.useEffect(() => {
    if (tick > 0) void throwConfetti()
  }, [tick])

  return <button onClick={() => setTick(c => c + 1)}>throw confetti</button>
}
```


## Related


[homepage]: https://github.com/guanghechen/react-kit/tree/@guanghechen/react-confetti@2.3.10/packages/react-confetti#readme
