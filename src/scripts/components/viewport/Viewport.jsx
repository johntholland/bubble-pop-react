var T = require('three');
var React3 = require('react-three-renderer');

var OrbitCamera = require('./cameras/OrbitCamera.jsx');
var OrthoCamera = require('./cameras/OrthoCamera.jsx');

var raycaster = new T.Raycaster();

Array.matrix = function (m, n, initial)
{
    var a, i, j, mat = [];
    for (i = 0; i < m; i += 1)
    {
        a = [];
        for (j = 0; j < n; j += 1)
        {
            a[j] = initial;
        }
        mat[i] = a;
    }
    return mat;
};

function addCubes(scene)
{
    var columns = 9;
    var rows = 9;

    var board = Array.matrix(columns, rows, 0);

    board.columns = function ()
    {
        return this.length;
    };

    board.rows = function ()
    {
        return this[0].length;
    };

    var cubeColors = ["rgb(255,0,0)", "rgb(255,255,0)", "rgb(255,0,255)",
        "rgb(0,255,0)", "rgb(255,125,0)", "rgb(0,125,255)"
    ];

    for (var column = 0; column < board.columns() ; column++)
    {
        for (var row = 0; row < board.rows() ; row++)
        {

            var colorChoice = cubeColors[Math.floor(Math.random() * cubeColors.length)];

            // create a cube
            //var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
            var cubeGeometry = new T.SphereGeometry(2.3, 20, 20);

            var cubeMaterial = new T.MeshLambertMaterial({
                color: colorChoice
            });
            var cube = new T.Mesh(cubeGeometry, cubeMaterial);

            // position the cube
            cube.position.x = (5 * column);
            cube.position.y = (5 * row);
            cube.position.z = 0;
            cube.IsPopped = false;
            cube.Identifier = column + "" + row;
            cube.column = column;
            cube.row = row;
            cube.color = colorChoice;

            board[column][row] = cube;

            // add the cube to the scene
            scene.add(cube);
        }
    }
}


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

    componentDidMount: function ()
    {
        addCubes(this.scene);
    },
    applyInput: function (message)
    {
        var self = this;
        var inputTypes = {
            'camera/orbit': function ()
            {
                self.camera.applyOrbit(message.payload.x, message.payload.y);
            },
            'camera/pan': function ()
            {
                self.camera.applyPan(message.payload.x, message.payload.y);
            },
            'camera/dolly': function ()
            {
                self.camera.applyDolly(message.payload.z);
            },
            'select/click': function ()
            {
                console.log("clicked");
            }
        };
        if (_.isFunction(inputTypes[message.type]))
        {
            inputTypes[message.type]();
        }
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
