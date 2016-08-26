var T = require('three');

var OrthoCamera = React.createClass({
  getInitialState: function () {
    return {
      left: -this.props.aspect,
      right: this.props.aspect,
      top: 1,
      bottom: -1,
      position: new T.Vector3().set(8 * 12, 4 * 12, 20 * 12),
      lookAt: new T.Vector3().set(8 * 12, 4 * 12, 0)
    };
  },
  componentDidMount: function () {
    this.update();
  },
  componentWillReceiveProps: function (nextProps) {
    this.update(nextProps.aspect);
  },
  _parameters: {
    minDistance: 1,
    maxDistance: Infinity,
    panSpeed: 1,
    dollySpeed: 0.5,
    target: new T.Vector3(0, 0, 0)
  },
  _internals: {
    scale: 1,
    panOffset: new T.Vector2(),

    position: new T.Vector2(),
    distance: 150
  },
  update: function (aspect = this.props.aspect) {
    this._internals.position.add(this._internals.panOffset);
    this._internals.distance *= this._internals.scale;

    this._internals.panOffset.set(0, 0);
    this._internals.scale = 1;

    var distance = this._internals.distance;
    this.setState({
      left: (distance / -2) * aspect + this._internals.position.x,
      right: (distance / 2) * aspect + this._internals.position.x,
      top: (distance / 2) + this._internals.position.y,
      bottom: (distance / -2) + this._internals.position.y
    });
  },
  applyOrbit: function () {
    return;
  },
  applyPan: function (x, y) {
    var panSpeed = this._parameters.panSpeed;
    var distance = this._internals.distance;
    var panDistanceSpeed = panSpeed * distance * 0.001;
    this._internals.panOffset.add(new T.Vector2(x * -panDistanceSpeed, y * panDistanceSpeed));
    this.update();
  },
  applyDolly: function (z) {
    var dollySpeed = this._parameters.dollySpeed;
    this._internals.scale += z * dollySpeed;
    this.update();
  },
  getThreeCameraObject: function () {
    return this.camera;
  },
  render: function () {
    return <orthographicCamera
      {...(_.pick(this.props, ['near', 'far', 'name']))}
      position={this.state.position}
      left={this.state.left}
      right={this.state.right}
      top={this.state.top}
      bottom={this.state.bottom}
      ref={_.set.bind(this, this, 'camera')}/>
  }
});

module.exports = OrthoCamera;