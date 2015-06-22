(function() {

  /** @jsx React.DOM */
  
  // var WebGLVisualization = require('./webgl-viz.jsx');
  
  var AppView = React.createClass({
    getInitialState: function () {
      return {
        page: 'Edit'
      }
    },
    changePage: function(page){
      this.setState({page: page});
    },

    render: function(){
      if (this.state.page === 'List'){
        return <VisualizationList key='list' changePage={this.changePage}/>;
      } else {
        return <EditView key='edit' changePage={this.changePage}/>;
      }
    }
  });

  var VisualizationItem = React.createClass({

    handleClick: function(){
      console.log('handleclick called');
      return this.props.changePage('Edit'); 
    },

    render: function() {
      return <div className="viz" >
        <img onClick={this.handleClick} src="http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2014/4/11/1397210130748/Spring-Lamb.-Image-shot-2-011.jpg"  title={this.props.v.song_name}>
        </img></div>
    }

  });

  var VisualizationList = React.createClass({

    sortOptions: ['song_name', 'created_at', 'updated_at'],

    getInitialState: function(){
      return { visualizations: [], sortBy: this.sortOptions[0] };
    },
    
    componentWillMount: function(){
      $.ajax({
        type: "GET",
        url: "/visualizations",
        dataType: 'json',
        success: function(visualizations) {
          this.setState({visualizations: visualizations})
        }.bind(this)
      });
    },

    componentDidMount: function(){
      slipHover(this.refs.container.getDOMNode());
    },

    render: function(){
      var self = this;
      var items = _.sortBy(self.state.visualizations, function(v){return v[self.state.sortBy]});
      var items = items.map(function(v){
        return <VisualizationItem v={v} key={ "visualization-item-" + v.id} changePage={self.props.changePage} />;
      })
      var sortButtons = _.map(self.sortOptions, function(s){
        return <div className="sort-button" onClick={function(){
          self.setState({sortBy: s});
        }}>{s}</div>;
      })
      return (
        <div>
          <h1>List View</h1>
          {sortButtons}
          <div id="container" ref="container">
            {items}
          </div>
        </div>
      )
    }
  });

  var EditView = React.createClass({

    handleClick: function(){
      return this.props.changePage('List');
    },

    render: function(){
      var self = this;
      return (
        <div>
          <h1>Edit View</h1>
          <p onClick= {this.handleClick}>Back to List</p>
          <WebGLVisualizer />
        </div>
      )
    } 
  });

  var WebGLVisualizer = React.createClass({
    render: function() {
      return (
        <div>
          <div className='viz-container'>
            <ParameterMenu />
          </div>
        </div>
      );
    },
    componentDidMount: function() {
      var soundAnalyzer = initSound();
      var container = $('.viz-container');
      var viz = new VIZ.Simple(container, soundAnalyzer);
      Menu();
    }
  });

  var ParameterMenu = React.createClass({
    render: function(){
      return (
        <div>
          <div className="close">- hide options</div>
          <div className="menu-button">+ show options</div>
          <div className="menu">
            <fieldset>
              <legend>Color</legend>
              <ul className="color">
                <li>
                  <form htmlFor='input-red'>Red</form>
                  <input id='input-red' type='number' name="red"/>
                </li>
                <li>
                  <form htmlFor='input-green'>Green</form>
                  <input id='input-green' type='number' name="green"/>
                </li>
                <li>
                  <form htmlFor='input-blue'>Blue</form>
                  <input id='input-blue' type='number' name="blue"/>
                </li>
              </ul>
            </fieldset>
            <fieldset>
              <legend>Shape</legend>
              <ul className='shape'>
                <li>
                  <label>Sphere</label>
                  <input type="radio" name="shape" value="sphere"/>
                </li>
                <li>
                  <label>Cube</label>
                  <input type="radio" name="shape" value="cube"/>
                </li>
              </ul>
            </fieldset>
            <p>Source</p>
            <ul>
                <li className="track">Track</li>
            </ul>
          </div>
        </div> 
      )
    }
  })

  React.render(
    <AppView />,
    document.getElementById('app')
  );

})();
