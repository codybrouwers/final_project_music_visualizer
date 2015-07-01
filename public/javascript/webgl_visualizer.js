var animationID;
WebGLVisualizer = {
  //Need to have access to visualizer and it's parameters
  init: function() {
    this.start = Date.now(),

    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.position.z = 50;

    var red = 240;
    var green = 50;
    var blue = 10;
    this.color = 'rgb(' + red + ',' + green + ',' + blue + ')'
    var myColor = new THREE.Color(this.color);
    var geometry = new THREE.BoxGeometry( 20, 20, 20 );
    var texture = new THREE.DataTexture(musicInterface.getByteData(), 1024, 2, THREE.RGBFormat);

    var uniforms = { 
      tMatCap: { 
          type: 't', 
          value: THREE.ImageUtils.loadTexture( 'img/matcap/matcap2.jpg' ) 
      },
      iChannel0: { 
          type: 't', 
          value: texture 
      },
      time: { // float initialized to 0
        type: "f", 
        value: 0.0 
      }
    }
    this.material = new THREE.ShaderMaterial( {
      color: myColor,
      uniforms: uniforms,
      vertexShader: document.getElementById( 'vertexShader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentShader' ).textContent
    } );

    this.material.uniforms.tMatCap.value.wrapS = 
    this.material.uniforms.tMatCap.value.wrapT = 
    THREE.ClampToEdgeWrapping;

    this.material.uniforms.tMatCap.needsUpdate = true

    this.mesh = new THREE.Mesh( geometry, this.material );
    this.scene.add( this.mesh );
    this.geometry = this.mesh.geometry;


    this.renderer = new THREE.WebGLRenderer({ antiAliasing: true, alpha: true });
    this.renderer.setClearColor( 0x222222, 1);
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    var controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );

    this.visualizerType = 1;

    window.addEventListener( 'resize', this.onWindowResize.bind(this), false );

  },

  onWindowResize: function() {

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );

  },

  animate: function(frame) {
    animationID = requestAnimationFrame(this.animate.bind(this));
    // this.mesh.rotation.x += 0.01;
    // this.mesh.rotation.y += 0.02;

    var scale = 1 + musicInterface.level;
    this.mesh.scale.x = scale;
    this.mesh.scale.y = scale;
    this.mesh.scale.z = scale;

    musicInterface.updateData();
    this.material.uniforms[ 'time' ].value += .00025;
    this.material.uniforms.iChannel0.value.image.data = musicInterface.getByteData();
    this.material.uniforms.iChannel0.value.needsUpdate = true
    this.renderer.render(this.scene, this.camera);
  },

  cancelAnimate: function () {
    cancelAnimationFrame(animationID);
  },

  setParams: function(params) {
    //params is supposed to be an array of hashes following
    //the format of {type:..., value:...} that we can iterate
    //through and set parameters automatically.
    params.forEach(function(param, index) {
      var type = param['type'];
      var value = param['value'];
      
      switch (type) {
        case 'color':
          this.setColor(value);
          break;
        case 'geometry':
          this.setGeometry(value);
          break;
        case 'matcap':
          this.setMatCap(value);
          break;
      }
    }, this);
  },

  getParams: function() {
    var params = [];
    paramsList = this.getParamsList(this.visualizerType);
    paramsList.forEach(function(paramType, index) {
      params[index] = this.getParam(paramType);
    }, this);
    return params;
  },

  getParamsList: function(visualizerType) {
    //Might make this a multicase chained operation?
    var paramList = [];
    switch (visualizerType) {
      case 1: //Basic Visualizer Case
        paramList = paramList.concat(['color', 'geometry', 'matcap']);
        break;
    }
    return paramList;
  },

  getParam: function(type) {
    var value;
    switch (type) {
      case 'color':
        value = this.getColor();
        break;
      case 'geometry':
        value = this.mesh.geometry.type;
        break;
      case 'matcap':
        value = this.material.uniforms.tMatCap.value.sourceFile;
        break;
    }
    return { 'type': type, 'value': value }
  },

  getColor: function() {
    color = this.mesh.material.color;
    red = Math.floor(255 * color.r);
    green = Math.floor(255 * color.g);
    blue = Math.floor(255 * color.b);
    return 'rgb('+red+','+green+','+blue+')'
  },

  setColor: function(color) {
    this.mesh.material.color = new THREE.Color(color);
  },

  setGeometry: function(shape) {
    if (shape === 'TorusKnotGeometry') {
      this.mesh.geometry = new THREE[shape]( 16, 4, 256, 32, 2, 6);
    }
    else if (shape === 'IcosahedronGeometry') {
      this.mesh.geometry = new THREE[shape]( 20, 4 );
    }
    else if (shape === 'PlaneGeometry') {
      this.mesh.geometry = new THREE[shape]( 30, 30, 32, 32);
    }
    else {
      this.mesh.geometry = new THREE[shape]( 20, 20, 20, 32, 32, 32 );
    }
  },

  setMatCap: function(matcap_path) {
    this.material.uniforms.tMatCap.value = THREE.ImageUtils.loadTexture( matcap_path );
    this.material.uniforms.tMatCap.value.wrapS = 
    this.material.uniforms.tMatCap.value.wrapT = 
    THREE.ClampToEdgeWrapping;

    this.material.uniforms.tMatCap.value.needsUpdate = true;
  }
}