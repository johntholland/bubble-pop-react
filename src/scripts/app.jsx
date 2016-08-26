global.React = require('react');
global.ReactDOM = require('react-dom');

var RootComponent = require('./components/RootComponent.jsx');

ReactDOM.render(
  <RootComponent />,
 global.document.querySelector('.root-anchor')
);