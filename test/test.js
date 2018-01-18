import React from 'react';
import {assert} from 'chai';
import {mount} from 'enzyme';
import sinon from 'sinon';
import createMockDOM from 'jsdom-global';

import * as zine from 'zine';
import {Connector, connect} from '../index.js';

createMockDOM();

const render = (source, props) => (
  props.secondValue ? <div>{source.value} {props.secondValue}</div> : <div>{source.value}</div>
);

describe('react-zine', () => {
  describe('Connector', () => {
    it('renders and passes props', () => {
      const store = {value: 'untouched'};
      const wrapper = mount(<Connector source={store} render={render} passProps={{secondValue: 'present'}} />);
      assert.equal(wrapper.html(), '<div>untouched present</div>');
    });

    it('re-renders on update', () => {
      const store = {value: 'untouched'};
      const wrapper = mount(<Connector source={store} render={render} />);
      assert.equal(wrapper.html(), '<div>untouched</div>');
      zine.issue(store, {value: 'touched'});
      assert.equal(wrapper.html(), '<div>touched</div>');
    });

    it('switches subscription on prop change', () => {
      const storeA = {value: 'untouched'};
      const storeB = {value: 'untouched'};
      const wrapper = mount(<Connector source={storeA} render={render} />);
      assert.equal(wrapper.html(), '<div>untouched</div>');
      zine.issue(storeA, {value: 'touched'});
      assert.equal(wrapper.html(), '<div>touched</div>');
      wrapper.setProps({source: storeB});
      assert.equal(wrapper.html(), '<div>untouched</div>');
      zine.issue(storeB, {value: 'touched'});
      assert.equal(wrapper.html(), '<div>touched</div>');
      zine.issue(storeA, {value: 'retouched'});
      assert.equal(wrapper.html(), '<div>touched</div>'); // Doesn't change to "retouched"
    });

    it('unsubscribes before unmounting', () => {
      const store = {value: 'untouched', renderChild: true};
      const parent = (store) => (
        <div>
        {store.renderChild && <Connector source={store} render={render} />}
        </div>
      );
      const wrapper = mount(<Connector source={store} render={parent} />);
      assert.equal(wrapper.html(), '<div><div>untouched</div></div>');
      sinon.spy(console, 'error');
      zine.issue(store, {renderChild: false});
      assert.isFalse(console.error.called);
      assert.equal(wrapper.html(), '<div></div>');
    });

    it('renders as child without triggering parent re-render', () => {
      var renderCount = 0;
      const store = {value: 'untouched'};
      const wrapper = mount(<div className={'parent ' + renderCount++}><Connector source={store} render={render} /></div>);
      assert.equal(wrapper.html(), '<div class="parent 0"><div>untouched</div></div>');
      zine.issue(store, {value: 'touched'});
      assert.equal(wrapper.html(), '<div class="parent 0"><div>touched</div></div>');
    });
  });

  describe('connect', () => {
    it('wraps Connector, renders and updates (passing props)', () => {
      const store = {value: 'untouched'};
      const Connected = connect(store, render);
      const wrapper = mount(<Connected secondValue='present'/>);
      assert.equal(wrapper.html(), '<div>untouched present</div>');
      zine.issue(store, {value: 'touched'});
      assert.equal(wrapper.html(), '<div>touched present</div>');
    });
  });
});
