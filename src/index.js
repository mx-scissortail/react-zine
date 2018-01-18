import React from 'react';
import {publishable, subscribe, unsubscribe} from 'zine';
export {issue, publish, publishable, subscribe, unsubscribe} from 'zine';

export class Connector extends React.Component {
  constructor(props) {
    super(props);
    this.canUpdate = true;

    this.update = () => {
      if (this.canUpdate) {
        this.forceUpdate();
      }
    };

    if (publishable(this.props.source)) {
      subscribe(this.props.source, this.update);
    } else {
      console.warn("Tried to use Connector to subscribe to an unpublishable source: ", this.props.source);
    }
  }

  componentWillUnmount () {
    this.canUpdate = false; // Prevent updates from triggering re-renders after component decides to unmount
    unsubscribe(this.props.source, this.update);
  }

  componentWillUpdate (nextProps) {
    let oldSource = this.props.source;
    let source = nextProps.source;
    if (source !== oldSource) {
      unsubscribe(oldSource, this.update);
      if (publishable(source)) {
        subscribe(source, this.update);
      } else {
        console.warn("Tried to use Connector to subscribe to an unpublishable source: ", source);
      }
    }
  }

  render () {
    return this.props.render(this.props.source, this.props.passProps);
  }
};

Connector.defaultProps = {
  passProps: {},
  render: () => null,
  source: undefined
};

export function connect (source, render) {
  return (props) => <Connector source={source} render={render} passProps={props} />;
};
