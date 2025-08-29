<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/react-kit/tree/@guanghechen/react-viewmodel@0.2.17/packages/react-viewmodel#readme">@guanghechen/react-viewmodel</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/react-viewmodel">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/react-viewmodel.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/react-viewmodel">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/react-viewmodel.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/react-viewmodel">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/react-viewmodel.svg"
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
        src="https://img.shields.io/node/v/@guanghechen/react-viewmodel"
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


React viewmodel integration providing reactive state management with State and Computed patterns.

## Install

* npm

  ```bash
  npm install --save @guanghechen/react-viewmodel
  ```

* yarn

  ```bash
  yarn add @guanghechen/react-viewmodel
  ```

## Usage

### Basic State Management

Create reactive state with `State` and consume it with `useStateValue`:

```tsx
import { State, useStateValue } from '@guanghechen/react-viewmodel'
import React from 'react'

// Create a state with recommended '$' suffix naming
const count$ = new State<number>(0)

const Counter: React.FC = () => {
  // Use useStateValue to subscribe to state changes
  const count = useStateValue(count$)
  
  const increment = () => count$.setState(prev => prev + 1)
  const decrement = () => count$.setState(prev => prev - 1)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  )
}
```

### Computed Values

Create derived state with `Computed`:

```tsx
import { State, Computed, useStateValue, useComputed } from '@guanghechen/react-viewmodel'
import React from 'react'

const firstName$ = new State<string>('John')
const lastName$ = new State<string>('Doe')

// Create computed value with '$' suffix
const fullName$ = new Computed(() => {
  return `${firstName$.getSnapshot()} ${lastName$.getSnapshot()}`
})

const UserProfile: React.FC = () => {
  const firstName = useStateValue(firstName$)
  const lastName = useStateValue(lastName$)
  const fullName = useComputed(fullName$)
  
  return (
    <div>
      <input 
        value={firstName} 
        onChange={e => firstName$.setState(() => e.target.value)} 
        placeholder="First name"
      />
      <input 
        value={lastName} 
        onChange={e => lastName$.setState(() => e.target.value)} 
        placeholder="Last name"
      />
      <p>Full name: {fullName}</p>
    </div>
  )
}
```

### Complex State with Multiple Dependencies

```tsx
import { State, Computed, useStateValue, useComputed } from '@guanghechen/react-viewmodel'
import React from 'react'

interface ICartItem {
  id: string
  name: string
  price: number
  quantity: number
}

const cartItems$ = new State<ICartItem[]>([])
const taxRate$ = new State<number>(0.1)

// Computed total price including tax
const totalPrice$ = new Computed(() => {
  const items = cartItems$.getSnapshot()
  const tax = taxRate$.getSnapshot()
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return subtotal * (1 + tax)
})

const ShoppingCart: React.FC = () => {
  const items = useStateValue(cartItems$)
  const total = useComputed(totalPrice$)
  
  const addItem = (item: ICartItem) => {
    cartItems$.setState(prev => [...prev, item])
  }
  
  return (
    <div>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.name} - ${item.price} x {item.quantity}
          </li>
        ))}
      </ul>
      <p>Total: ${total.toFixed(2)}</p>
    </div>
  )
}
```

### ViewModel Management

Create and manage ViewModel instances with automatic lifecycle management:

```tsx
import { ViewModel, useViewModel } from '@guanghechen/react-viewmodel'
import React from 'react'

class FileTreeViewModel extends ViewModel {
  constructor(public readonly options: { currentFilepath: string | null }) {
    super()
  }
  // Your ViewModel implementation
}

interface IFileTreeContext {
  viewmodel: FileTreeViewModel
}

const FileTreeContextType = React.createContext<IFileTreeContext | null>(null)

export const FileTreeContextProvider: React.FC<{ children: React.ReactNode }> = props => {
  const viewmodel: FileTreeViewModel | null = useViewModel<FileTreeViewModel>(() => {
    return new FileTreeViewModel({ currentFilepath: null })
  })
  const context: IFileTreeContext | null = React.useMemo<IFileTreeContext | null>(
    () => (viewmodel ? { viewmodel } : null),
    [viewmodel],
  )

  if (!context) return <React.Fragment />

  return (
    <FileTreeContextType.Provider value={context}>{props.children}</FileTreeContextType.Provider>
  )
}
FileTreeContextProvider.displayName = 'FileTreeContextProvider'
```

## API Reference

Name                      | Description
:------------------------:|:---------------------------------------------:
`useStateValue`           | Subscribe to state changes and get current value
`useSetState`             | Get state setter function only
`useState`                | Get both state value and setter (similar to React.useState)
`useReactState`           | Get state value and updater with React-like API
`useComputed`             | Subscribe to computed value changes
`useToggleState`          | Get toggle function for boolean state
`useObserveKey`           | Observe specific object property changes
`useObserveSignal`        | Observe signal changes with custom comparator
`useViewModel`            | Create and manage ViewModel instances with automatic disposal


## Naming Convention

It is recommended to suffix State and Computed instances with `$` to clearly indicate they are reactive values:

```tsx
const count$ = new State<number>(0)
const doubleCount$ = new Computed(() => count$.getSnapshot() * 2)
const user$ = new State<IUser>({ name: 'Alice', age: 30 })
```


[homepage]: https://github.com/guanghechen/react-kit/tree/@guanghechen/react-viewmodel@0.2.17/packages/react-viewmodel#readme