import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import sinon from 'sinon'
import isEqual from '../src'

class ChildWithShouldComponentUpdate extends React.Component {
  public override render(): React.ReactElement | null {
    return null
  }

  public override shouldComponentUpdate(nextProps: unknown): boolean {
    // this.props.children is a h1 with a circular reference to its owner, Container
    return !isEqual(this.props, nextProps)
  }
}

class Container extends React.Component<{ title?: string; subtitle?: string }> {
  public override render(): React.ReactElement | null {
    return (
      <ChildWithShouldComponentUpdate>
        <h1>{this.props.title || ''}</h1>
        <h2>{this.props.subtitle || ''}</h2>
      </ChildWithShouldComponentUpdate>
    )
  }
}

describe('advanced', () => {
  let sandbox: any
  let warnStub: any
  let childRenderSpy: any

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    warnStub = sandbox.stub(console, 'warn')
    childRenderSpy = sandbox.spy(ChildWithShouldComponentUpdate.prototype, 'render')
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('React', () => {
    describe('element (with circular references)', () => {
      it('compares without warning or errors', () => {
        const testRenderer = ReactTestRenderer.create(React.createElement(Container))
        testRenderer.update(React.createElement(Container))
        expect(warnStub.callCount).toEqual(0)
      })
      it('elements of same type and props are equal', () => {
        const testRenderer = ReactTestRenderer.create(React.createElement(Container))
        testRenderer.update(React.createElement(Container))
        expect(childRenderSpy.callCount).toEqual(1)
      })
      it('elements of same type with different props are not equal', () => {
        const testRenderer = ReactTestRenderer.create(React.createElement(Container))
        testRenderer.update(React.createElement(Container, { title: 'New' }))
        expect(childRenderSpy.callCount).toEqual(2)
      })
    })
  })
})
