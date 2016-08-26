var T = require('three');
var React3 = require('react-three-renderer');

var transformTools = (function () {
  var v = new T.Vector3();
  return {
    getZoomScale: function (parameters) {
      return Math.pow(0.95, parameters.dollySpeed);
    },
    rotateLeft: function (angle, internals) {
      internals.sphericalDelta.theta -= angle
    },
    rotateUp: function (angle, internals) {
      internals.sphericalDelta.phi -= angle
    },
    panLeft: function (distance, objectMatrix, internals) {
      v.setFromMatrixColumn(objectMatrix, 0);
      v.multiplyScalar(-distance);
      internals.panOffset.add(v);
    },
    panUp: function (distance, objectMatrix, internals) {
      v.setFromMatrixColumn(objectMatrix, 1);
      v.multiplyScalar(-distance);
      internals.panOffset.add(v);
    },
    dolly: function (dollyScale, internals) {
      internals.scale += dollyScale;
    }
  };
})();

var OrbitCamera = React.createClass({
  _parameters: {
    minDistance: 1,
    maxDistance: Infinity,
    minPolarAngle: 0,
    maxPolarAngle: Math.PI,
    minAzimuthAngle: -Infinity,
    maxAzimuthAngle: Infinity,
    panSpeed: 1.5,
    dollySpeed: 0.5,
    rotateSpeed: 1.0,
    unitY: new T.Vector3(0, 1, 0)
  },
  _internals: {
    spherical: new T.Spherical(),
    sphericalDelta: new T.Spherical(),

    scale: 1,
    panOffset: new T.Vector3(),

    distance: 1,
    transformMatrix: new T.Matrix4()
  },
  getDefaultProps: function () {
    return {
      target: new T.Vector3().set(8 * 12, 4 * 12, 0),
      position: new T.Vector3().set(8 * 12, 4 * 12, 20 * 12)
    };
  },
  getInitialState: function () { return {}; },
  componentWillMount: function () {
    this.setState(_.pick(this.props, ['position', 'target']));
  },
  update: (function () {
    var offset = new T.Vector3();

    var lastPosition = new T.Vector3();
    var lastQuaternion = new T.Quaternion();

    return function () {
      var position = this.state.position;
      var spherical = this._internals.spherical;

      offset.copy(position).sub(this.state.target);

      spherical.setFromVector3(offset);

      spherical.theta += this._internals.sphericalDelta.theta;
      spherical.phi += this._internals.sphericalDelta.phi;

      spherical.theta = _.clamp(spherical.theta,
        this._parameters.minAzimuthAngle,
        this._parameters.maxAzimuthAngle);

      spherical.phi = _.clamp(spherical.phi,
        this._parameters.minPolarAngle,
        this._parameters.maxPolarAngle);

      spherical.makeSafe();

      spherical.radius *= this._internals.scale;
      spherical.radius = _.clamp(spherical.radius,
        this._parameters.minDistance,
        this._parameters.maxDistance);

      this._internals.distance = spherical.radius;

      var newTarget = new T.Vector3().copy(this.state.target).add(this._internals.panOffset);

      offset.setFromSpherical(spherical);

      var newPosition = new T.Vector3().copy(newTarget).add(offset);

      this.setState({
        position: newPosition,
        target: newTarget
      });

      this._internals.scale = 1;
      this._internals.sphericalDelta.set( 0, 0, 0 );
      this._internals.panOffset.set( 0, 0, 0 );
    }
  })(),
  componentDidMount: function () {
    this.update();
  },
  applyOrbit: function (x, y) {
    var orbitX = (x * Math.PI) / window.innerWidth;
    var orbitY = (y * Math.PI) / window.innerHeight;

    transformTools.rotateLeft(orbitX, this._internals);
    transformTools.rotateUp(orbitY, this._internals);
    this.update();
  },
  applyPan: function (x, y) {
    var camMatrix = this._internals.transformMatrix.lookAt(
      this.state.position,
      this.state.target,
      this._parameters.unitY);
    x = (x / window.innerWidth) * this._internals.distance * this._parameters.panSpeed;
    y = (y / -window.innerHeight) * this._internals.distance * this._parameters.panSpeed;

    transformTools.panLeft(x, camMatrix, this._internals);
    transformTools.panUp(y, camMatrix, this._internals);
    this.update();
  },
  applyDolly: function (z) {
    transformTools.dolly(z * this._parameters.dollySpeed, this._internals);
    this.update();
  },
  getThreeCameraObject: function () {
    return this.camera;
  },
  render: function () {
    return <perspectiveCamera
      {...(_.pick(this.props, ['name', 'fov', 'aspect', 'near', 'far']))}
      position={this.state.position}
      lookAt={this.state.target}
      ref={_.set.bind(this, this, 'camera')}
    />
  }
});

module.exports = OrbitCamera;