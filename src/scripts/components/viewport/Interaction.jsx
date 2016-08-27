var Interaction = React.createClass({
  _isMouseDown: false,
  _lastMousePoint: {x: 0, y: 0},
  isActive: function() {
    return this._isMouseDown === true;
  },
  setLastMousePoint: function (x, y) {
    this._lastMousePoint.x = x;
    this._lastMousePoint.y = y;
  },
  onMouseMotion: function (x, y, modifierType) {
    var types = {
      'alt': 'camera/orbit',
      'shiftalt': 'camera/pan'
    };
    var type = types[modifierType];
    if (this._isMouseDown && type !== undefined) {
      this.props.onChange({
        type: type,
        payload: {x: x - this._lastMousePoint.x, y: y - this._lastMousePoint.y}
      });
      this.setLastMousePoint(x, y);
    }
  },
  onWheelMotion: function (z) {
    this.props.onChange({
      type: 'camera/dolly',
      payload: {z: z}
    });
  },
  getThrottledMouseMove: function () {
    var self = this;

    var throttled = _.throttle(
      function(){ return self.onMouseMotion.apply(self, arguments); },
      25, {leading: true, trailing: true});
    return function (event) {

      event.preventDefault();
      event.stopPropagation();

      if(event.altKey) {
        if(event.shiftKey){
          return throttled(event.clientX, event.clientY, 'shiftalt');
        } else return throttled(event.clientX, event.clientY, 'alt');
      }
    }
  },
  getThrottledWheel: function () {
    var self = this;
    var throttled = _.throttle(
      function(){ return self.onWheelMotion.apply(self, arguments); },
      30, {leading: false, trailing: true});
    return function(event){
      return throttled(event.deltaY * 0.01);
    }
  },
  onMouseDown: function (event) {

    event.preventDefault();
    event.stopPropagation();

    this.setLastMousePoint(event.clientX, event.clientY);
    this._isMouseDown = true;
  },
  onMouseUp: function (event) {

    event.preventDefault();
    event.stopPropagation();

    if(!event.altKey && !event.shiftKey && !event.ctrlKey) {
      var yOffset = -48; //This is needed for now for reasons unknown so it's a bit of a hack
      // var yOffset = 0; //This is needed for now for reasons unknown so it's a bit of a hack
      var point = {
        x: (event.clientX / this.props.viewportSize.w) * 2 - 1,
        y: ((event.clientY + yOffset) / this.props.viewportSize.h) * -2 + 1
      };
      this.props.onChange({
        type: 'select/click',
        payload: point
      });
    }

    this._isMouseDown = false;
    this.props.onChange({
      type: 'camera/release'
    });
  },
  onMouseOut: function () {
    this._isMouseDown = false;
    this.props.onChange({
      type: 'camera/release'
    });
  },
  render: function () {
    return <div className="interface-layer"
                style={this.props.style}
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                onMouseMove={this.getThrottledMouseMove()}
                onMouseOut={this.onMouseOut}
                onWheel={this.getThrottledWheel()}
    ></div>;
  }
});

module.exports = Interaction;