var Viewport = require('./viewport/Viewport.jsx');

module.exports = React.createClass({
    getInitialState: function ()
    {
        return {
            viewportSize: { w: 0, h: 0 }
        };
    },
    componentDidMount: function ()
    {
        this.updateViewportSize();
    },
    componentDidUpdate: function ()
    {
        this.updateViewportSize();
    },
    updateViewportSize: function ()
    {
        var nextSize = { w: 0, h: 0 };
        if (_.isObject(this.mainContent))
        {
            nextSize.w = this.mainContent.clientWidth;
            nextSize.h = this.mainContent.clientHeight;
        }
        if (!_.isEqual(this.state.viewportSize, nextSize))
        {
            console.log('updating size');
            this.setState({ viewportSize: nextSize });
        }
    },
    render: function ()
    {
        return (
          <div className="root">
              <main ref={_.set.bind(this, this, 'mainContent' )}>
                <Viewport ref={_.set.bind(this, this, 'viewport')} {...this.props} size={this.state.viewportSize} />
              </main>
          </div>
        );
    }
});