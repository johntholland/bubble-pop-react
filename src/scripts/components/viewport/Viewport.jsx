var T = require('three');
var React3 = require('react-three-renderer');

var OrbitCamera = require('./cameras/OrbitCamera.jsx');
var OrthoCamera = require('./cameras/OrthoCamera.jsx');

var raycaster = new T.Raycaster();

var Viewport = React.createClass({
    getAspect: function ()
    {
        var size = this.props.size;
        return size.w / size.h;
    },

    renderCamera: function ()
    {
        var self = this;

        return <OrbitCamera name="camera" fov={75} aspect={self.getAspect()} near={0.1} far={1000}
                            ref={_.set.bind(self, self, 'camera')} />;
    },
    render: function ()
    {
        var self = this;
        var width = this.props.size.w; // canvas width
        var height = this.props.size.h; // canvas height
        var cameraPosition = new T.Vector3(0, 0, 5);

        return <React3 width={width}
                       height={height}
                       mainCamera="camera"
                       antialias={true}>
          <scene ref={_.set.bind(this, this, 'scene')}>
              {this.renderCamera()}
            <ambientLight color={0xaaaaaa} />
            <directionalLight color={0xaaaaaa}
                              intensity={1.1}
                              position={new T.Vector3(3, 4, 10)}
                              lookAt={new T.Vector3(0, 0, 0)} />
          </scene>
        </React3>;
    }
});

module.exports = Viewport;
