	var scene, camera, renderer, stereoEffect, controls;
	var ground, roombaCat, catHead, cat, specimen;
	var FOV = 90;
	var WIDTH, HEIGHT;
	
	var assetPath = "https://cse5542projectwlmt.weebly.com/files/theme/Specimen/";
	var proxyPath = "https://cors-anywhere.herokuapp.com/";
	
	// Set this to true to get models to load when testing locally.
	// SET TO FALSE BEFORE UPLOADING TO WEBSITE
	var runningLocally = false;
			
	init();
	//createRoombaCat();
	createSpecimen();
	//animate();
	
	// Sets up the scene
    function init() {
		if (runningLocally){
			assetPath = proxyPath + "https://cse5542projectwlmt.weebly.com/files/theme/Specimen/";
		}
		
	
		specimen = new THREE.Object3D();
	
		WIDTH = window.innerWidth;
		HEIGHT = window.innerHeight;
			
		// Create the scene and set the scene size.
		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0x424242 );
		scene.fog = new THREE.Fog( 0x424242, 0, 300 );
		
		camera = new THREE.PerspectiveCamera(FOV, WIDTH / HEIGHT, 0.001, 700);
		translateGlobal(camera, 0,40,0);
		scene.add(camera);
			
		// Create a renderer and add it to the DOM, enable shadows.
		renderer = new THREE.WebGLRenderer({antialias:true});
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		
		document.body.appendChild(renderer.domElement);
		document.body.appendChild( WEBVR.createButton( renderer ) );
		renderer.vr.enabled = true;
		
		stereoEffect = new THREE.StereoEffect(renderer);
		stereoEffect.setSize( WIDTH, HEIGHT );
		
		// Create an event listener that resizes the renderer with the browser window and updates camera aspects.
		window.addEventListener('resize', function() {
			WIDTH = window.innerWidth;
			HEIGHT = window.innerHeight;
			
			camera.aspect = WIDTH / HEIGHT
			
			camera.updateProjectionMatrix();
			
			stereoEffect.setSize( WIDTH, HEIGHT );
		});
		
	    // Create a light, set its position, and add it to the scene.
		var light = new THREE.PointLight( 0xefebd8, 4, 100 );
		light.position.set(0,50,0);
		light.castShadow = true;
		scene.add(light);
		
		// Create directional light to light whole scene a bit
		var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.7 );
		light.castShadow = true;
		scene.add( directionalLight );
		
		//var helper = new THREE.CameraHelper( light.shadow.camera );
		//scene.add( helper );

		// Setup non-VR controls.	
		controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.target.set(
			camera.position.x + 0.15,
			camera.position.y,
			camera.position.z
		);
		controls.enablePan = false;
		controls.enableZoom = false;
		
		// Setup DeviceOrientation functionality
		window.addEventListener('deviceorientation', setOrientationControls, true);
		function setOrientationControls(e) {
			if (!e.alpha) {
				// If DeviceOrientation controls cannot be set, return
				return;
			}
			
			// If we have a compatable device, replace controlls with VR controls
			controls = new THREE.DeviceOrientationControls(camera, true);
			controls.connect();
			controls.update();
		}
		
		// Allow fullscreen on screen click
		//renderer.domElement.addEventListener('click', fullscreen, false);
		window.removeEventListener('deviceorientation', setOrientationControls, true);
	}
	
	function createSpecimen() {	
		// ground
		var groundMaterial = new THREE.MeshLambertMaterial ( { color: 0x212121 } );
		var geometry = new THREE.PlaneGeometry( 2000, 2000, 10, 10 );
		ground = CreateMeshWithShadows( geometry, groundMaterial );
		scene.add( ground );
		translateGlobal(ground, 0, -80, 0);
		rotateDegrees(ground, -90, 0, 0);
		
		// Load the specimen model and textures
		THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
		new THREE.MTLLoader()
			.setPath( assetPath )
			.load( 'TexturesCom_BirchTree_lp.mtl', function ( materials ) {
				materials.preload();
				new THREE.OBJLoader()
					.setMaterials( materials )
					.setPath( assetPath )
					.load( 'TexturesCom_BirchTree_lp.obj', function ( object ) {
						
						// Position specimen in scene
						specimen = object
						specimen.position.set(0, 70, 30);
						specimen.scale.set(0.2, 0.2, 0.2);
						rotateDegrees(specimen, 90, 180, 0);
						scene.add(specimen);
						
					}, onLoadOBJ, onProgressOBJ );
		}, onProgressMTL );
	}
	function onLoadOBJ() {
		console.log("Object Loaded!");
	}
	function onProgressOBJ(xhr){
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log('Object ' + Math.round( percentComplete, 2 ) + '% downloaded' );
		}
	}
	function onLoadMTL() {
		console.log("Material Loaded!");
	}
	function onProgressMTL(xhr){
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( 'Material ' + Math.round( percentComplete, 2 ) + '% downloaded' );
		}
	}
	
	// Renders the scene and updates the render as needed.
	// function animate() {
		// requestAnimationFrame(animate);

		// //rotateDegrees(specimen, 0, 0, 1);

		// stereoEffect.render(scene, camera);
	// }
	
	renderer.setAnimationLoop( function () {
		stereoEffect.render(scene, camera);
	} );
	
	//====================== Transform Library ======================//
	
	// Not quite sure how to get prototypes working
	// THREE.Object3D.prototype.translateBy = function(dx, dy, dy){
		// var x = this.position.x + dx;
		// var y = this.position.y + dy;
		// var z = this.position.z + dz;
		// this.position.set(x, y, z);
	// }
	
	function translateGlobal(object3D, dx, dy, dz) {
		var x = object3D.position.x + dx;
		var y = object3D.position.y + dy;
		var z = object3D.position.z + dz;
		object3D.position.set(x, y, z);
	}
	function translate(object3D, dx, dy, dz) {
		object3D.translateX(dx);
		object3D.translateY(dy);
		object3D.translateZ(dz);
	}
	
	function rotateDegrees(object3D, degX, degY, degZ) {
		object3D.rotateX(degX * (Math.PI / 180));
		object3D.rotateY(degY * (Math.PI / 180));
		object3D.rotateZ(degZ * (Math.PI / 180));
	}
	function rotateRadians(object3D, radX, radY, radZ) {
		object3D.rotateX(radX);
		object3D.rotateY(radY);
		object3D.rotateZ(radZ);
	}
	
	function scale(object3D, dx, dy, dz) {
		var x = object3D.scale.x * dx;
		var y = object3D.scale.y * dy;
		var z = object3D.scale.z * dz;
		object3D.scale.set(x, y, z);
	}
	
	//====================== 3D Object Creation Library ======================//
	function CreateMeshWithShadows( geometry, material ) {
		var mesh = new THREE.Mesh( geometry, material );
		mesh.castShadow = true;
		mesh.receiveShadow = true; 
		return mesh;
	}
	

	
	