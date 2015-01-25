window.addEventListener('load', function() {

  var container;

  var camera, controls, scene, renderer;

  var mesh;

  var worldWidth = 128, worldDepth = 128,
  worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2,
  data = generateHeight( worldWidth, worldDepth );

  var clock = new THREE.Clock();

  init();
  animate();

  function init() {

    container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
    camera.position.y = getY( worldHalfWidth, worldHalfDepth ) * 100 + 100;

    controls = new THREE.FirstPersonControls( camera );

    controls.movementSpeed = 1000;
    controls.lookSpeed = 0.125;
    controls.lookVertical = true;

    scene = new THREE.Scene();

    // sides

    var matrix = new THREE.Matrix4();

    var pxGeometry = new THREE.PlaneTypedGeometry( 100, 100 );
    pxGeometry.uvs[ 1 ] = 0.5;
    pxGeometry.uvs[ 3 ] = 0.5;
    pxGeometry.applyMatrix( matrix.makeRotationY( Math.PI / 2 ) );
    pxGeometry.applyMatrix( matrix.makeTranslation( 50, 0, 0 ) );

    var nxGeometry = new THREE.PlaneTypedGeometry( 100, 100 );
    nxGeometry.uvs[ 1 ] = 0.5;
    nxGeometry.uvs[ 3 ] = 0.5;
    nxGeometry.applyMatrix( matrix.makeRotationY( - Math.PI / 2 ) );
    nxGeometry.applyMatrix( matrix.makeTranslation( - 50, 0, 0 ) );

    var pyGeometry = new THREE.PlaneTypedGeometry( 100, 100 );
    pyGeometry.uvs[ 5 ] = 0.5;
    pyGeometry.uvs[ 7 ] = 0.5;
    pyGeometry.applyMatrix( matrix.makeRotationX( - Math.PI / 2 ) );
    pyGeometry.applyMatrix( matrix.makeTranslation( 0, 50, 0 ) );

    var pzGeometry = new THREE.PlaneTypedGeometry( 100, 100 );
    pzGeometry.uvs[ 1 ] = 0.5;
    pzGeometry.uvs[ 3 ] = 0.5;
    pzGeometry.applyMatrix( matrix.makeTranslation( 0, 0, 50 ) );

    var nzGeometry = new THREE.PlaneTypedGeometry( 100, 100 );
    nzGeometry.uvs[ 1 ] = 0.5;
    nzGeometry.uvs[ 3 ] = 0.5;
    nzGeometry.applyMatrix( matrix.makeRotationY( Math.PI ) );
    nzGeometry.applyMatrix( matrix.makeTranslation( 0, 0, -50 ) );

    //

    var geometry = new THREE.TypedGeometry( worldWidth * worldDepth * 2 * 5 ); // 2 triangles, 5 possible sides

    for ( var z = 0; z < worldDepth; z ++ ) {

      for ( var x = 0; x < worldWidth; x ++ ) {

        var h = getY( x, z );

        matrix.makeTranslation(
          x * 100 - worldHalfWidth * 100,
          h * 100,
          z * 100 - worldHalfDepth * 100
        );

        var px = getY( x + 1, z );
        var nx = getY( x - 1, z );
        var pz = getY( x, z + 1 );
        var nz = getY( x, z - 1 );

        geometry.merge( pyGeometry, matrix );

        if ( ( px != h && px != h + 1 ) || x == 0 ) {

          geometry.merge( pxGeometry, matrix );

        }

        if ( ( nx != h && nx != h + 1 ) || x == worldWidth - 1 ) {

          geometry.merge( nxGeometry, matrix );

        }

        if ( ( pz != h && pz != h + 1 ) || z == worldDepth - 1 ) {

          geometry.merge( pzGeometry, matrix );

        }

        if ( ( nz != h && nz != h + 1 ) || z == 0 ) {

          geometry.merge( nzGeometry, matrix );

        }

      }

    }

    geometry.computeBoundingSphere();

    var texture = THREE.ImageUtils.loadTexture( 'atlas.png' );
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;

    var mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { map: texture, ambient: 0xbbbbbb } ) );
    scene.add( mesh );

    var ambientLight = new THREE.AmbientLight( 0xcccccc );
    scene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
    directionalLight.position.set( 1, 1, 0.5 ).normalize();
    scene.add( directionalLight );

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0xbfd1e5 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    container.innerHTML = "";

    container.appendChild( renderer.domElement );

    //

    window.addEventListener( 'resize', onWindowResize, false );

  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    controls.handleResize();

  }

  function generateHeight( width, height ) {

    var data = [], perlin = new ImprovedNoise(),
    size = width * height, quality = 2, z = Math.random() * 100;

    for ( var j = 0; j < 4; j ++ ) {

      if ( j == 0 ) for ( var i = 0; i < size; i ++ ) data[ i ] = 0;

      for ( var i = 0; i < size; i ++ ) {

        var x = i % width, y = ( i / width ) | 0;
        data[ i ] += perlin.noise( x / quality, y / quality, z ) * quality;


      }

      quality *= 4

    }

    return data;

  }

  function getY( x, z ) {

    return ( data[ x + z * worldWidth ] * 0.2 ) | 0;

  }

  //

  function animate() {

    requestAnimationFrame( animate );

    render();

  }

  function render() {

    controls.update( clock.getDelta() );
    renderer.render( scene, camera );

  }
});
