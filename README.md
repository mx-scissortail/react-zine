# react-zine

react-zine is a simple state management system for building reactive user interfaces with React. It's built on top of the tiny publisher/subscriber system [zine](https://github.com/j-s-n/zine). It aims to be small ([zine](https://github.com/j-s-n/zine) and react-zine together are about 3kb unminified), performant and much easier to use than most state management systems for React. Using react-zine you can easily externalize state (i.e. pull state data out of `this.setState` and manage it independently of your components) and reactively inject updates into arbitrary locations in the hierarchy. An updated tutorial is coming soon.

## Installation

To install (using npm):
```
npm install react-zine --save
```

# API Documentation

In addition to its two main exports (described below), react-zine re-exports `issue`, `publish`, `publishable`, `subscribe` and `unsubscribe` from [zine](https://github.com/j-s-n/zine), which means you only need to import one module to use it.

Usage: `import {Connector, connect, publish, subscribe, issue, unsubscribe, unsubscribeAll, publishable} from 'react-zine';`

---
### `Connector`

`Connector` is a react wrapper component. It takes three props: `source` (any publishable subject, i.e. an object or function), `render` (a function of two arguments that determines what `Connector` renders) and `passProps` (an optional object of additional props to pass along at render time). The `source` argument is passed along as the first argument to the `render` prop whenever `Connector` renders. So for instance:

```
<Connector source={StoreInstance} passProps={{foo: 'bar'}} render={(store, props) => (
  <SomeOtherComponent {...props} value={store.value} />
  )} />
```

Will render `<SomeOtherComponent foo='bar' value={StoreInstance.value} />`. The useful feature of `Connector` is that it automatically manages a subscription to whatever is provided to its `source` prop and re-renders whenever that is published. So the above component will re-render (in place, without affecting the rest of the component hierarchy) whenever `StoreInstance` is published from anywhere in the application, which makes it easy to inject state updates anywhere in the component hierarchy.

If `Connector` unmounts or is re-rendered from above with a new `source` prop, it will automatically cancel its former subscription (and create a new one if necessary).

---
### `connect(source, render)`

`connect` provides syntax sugar for a common use of `Connector`, and is implemented as follows:
```
export function connect (source, render) {
  return (props) => <Connector source={source} render={render} passProps={props} />;
}
```
This enables an extremely concise way to define pure functional components that subcribe to static sources, e.g.
```
const InputStore = {value: ''};
const Input = connect(InputStore,
  (store, props) => <input type="text" value={store.value} onInput={(event) => issue(store, {value: event.target.value})} />
);
```
...will define a managed `input` component that tracks and updates the `value` field from the object `InputStore`.

## Recent changes

### Version 1.0

This is the first release of react-zine. The functionality provided by this module used to be a part of the main [zine](https://github.com/j-s-n/zine) package, but this update factors React-specific functionality into a separate package (this one) and renames the two main exports so that the `connect` function takes the common imperative form for functions, while the `Connector` class takes the common noun form.

## License

MIT
