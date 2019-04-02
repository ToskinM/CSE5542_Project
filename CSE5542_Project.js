	var scene, camera, renderer, stereoEffect, controls;
	var ground, roombaCat, catHead, cat;
	var FOV = 90;
	var WIDTH, HEIGHT;
			
	init();
	createRoombaCat();
	animate();
	
	// Sets up the scene
    function init() {
		WIDTH = window.innerWidth;
		HEIGHT = window.innerHeight;
			
		// Create the scene and set the scene size.
		scene = new THREE.Scene();
		scene.fog = new THREE.Fog( 0x000000, 0, 250 );
		
		camera = new THREE.PerspectiveCamera(FOV, WIDTH / HEIGHT, 0.001, 700);
		translateGlobal(camera, 0,40,0);
		scene.add(camera);
			
		// Create a renderer and add it to the DOM, enable shadows.
		renderer = new THREE.WebGLRenderer({antialias:true});
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		document.body.appendChild(renderer.domElement);
		
		stereoEffect = new THREE.StereoEffect(renderer);
		stereoEffect.setSize( WIDTH, HEIGHT );
		
		//camera = new THREE.PerspectiveCamera(FOV, WIDTH / HEIGHT, 0.1, 20000);
		//translateGlobal(camera, 0,6,100);
		//scene.add(camera);
		
		// Create an event listener that resizes the renderer with the browser window and updates camera aspects.
		window.addEventListener('resize', function() {
			WIDTH = window.innerWidth;
			HEIGHT = window.innerHeight;
			
			//renderer.setSize(WIDTH, HEIGHT);
			
			camera.aspect = WIDTH / HEIGHT
			
			camera.updateProjectionMatrix();
			
			stereoEffect.setSize( WIDTH, HEIGHT );
		});
		
	    // Create a light, set its position, and add it to the scene.
		var light = new THREE.PointLight( 0xffffff, 1, 100 );
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
		controls.noPan = true;
		controls.noZoom = true;
		
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
		element.addEventListener('click', fullscreen, false);
		window.removeEventListener('deviceorientation', setOrientationControls, true);
	}
	
	// Creates roomba cat.
	function createRoombaCat() {
		// Materials
		var groundMaterial = new THREE.MeshLambertMaterial ( { color: 0x80c0fa } );
		var roombaMaterial = new THREE.MeshLambertMaterial ( { color: 0xf0f0f0 } );
		var catMaterial = new THREE.MeshLambertMaterial ( { color: 0x303030 } );
		var catEyeMaterial = new THREE.MeshBasicMaterial ( { color: 0x00ff00 } ); // keep this toony material for glowing eyes
		var haloMaterial = new THREE.MeshLambertMaterial ( { color: 0xffffc0 } );
		
		// ground
		var geometry = new THREE.PlaneGeometry( 2000, 2000, 10, 10 );
		ground = CreateMeshWithShadows( geometry, groundMaterial );
		scene.add( ground );
		translateGlobal(ground, 0, -1.5, 0);
		rotateDegrees(ground, -90, 0, 0);
		
		// Roomba body
		var geometry = new THREE.CylinderGeometry( 10, 10, 3, 16 );
		var roombaBody = CreateMeshWithShadows( geometry, roombaMaterial );
		scene.add( roombaBody );
		
		// Cat base
		var points = [];
		for ( var i = 0; i < 10; i ++ ) {
			points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 10 + 5, ( i - 5 ) * 2 ) );
		}
		geometry = new THREE.LatheGeometry( points );
		var catBase = CreateMeshWithShadows( geometry, catMaterial );
		scene.add( catBase );
		rotateDegrees(catBase, 180, 0, 0);
		scale(catBase, 0.5, 0.5, 0.5)
		translateGlobal(catBase, 0, 5.5, 0);
		
		// Cat tail
		geometry = new THREE.CylinderGeometry( 1, 1, 20, 8 );
		var catTail = CreateMeshWithShadows( geometry, catMaterial );
		scene.add( catTail );
		translateGlobal(catTail, -8, 12, 0);
		rotateDegrees(catTail, 0, 0, 10);
		
		// Cat body
		geometry = new THREE.CylinderGeometry( 2, 5, 15, 8 );
		var catBody = CreateMeshWithShadows( geometry, catMaterial );
		scene.add( catBody );
		translateGlobal(catBody, 1, 9, 0);
		
		// Cat head
		geometry = new THREE.IcosahedronGeometry( 4, 1);
		var catHeadBase = CreateMeshWithShadows( geometry, catMaterial );
		scene.add( catHeadBase );
		translateGlobal(catHeadBase, 1, 18, 0);
		rotateDegrees(catTail, 0, 90, 0);
		
		// Cat ear right
		var geometry = new THREE.ConeGeometry( 2, 3, 3 );
		var catEarR = new THREE.Mesh( geometry, catMaterial );
		scene.add( catEarR );
		translateGlobal(catEarR, 1, 21.5, 3);
		rotateDegrees(catEarR, 45, 0, 0);
		
		// Cat ear left
		var catEarL = catEarR.clone();
		scene.add( catEarL );
		translateGlobal(catEarL, 0, 0, -6);
		rotateDegrees(catEarL, -90, 0, 0);
		
		// Cat eye right
		geometry = new THREE.SphereGeometry( 1, 2, 5);
		var catEyeR = new THREE.Mesh( geometry, catEyeMaterial );
		scene.add( catEyeR );
		translateGlobal(catEyeR, 4, 19.5, 1.5);
		
		// Cat eye left
		var catEyeL = catEyeR.clone();
		scene.add( catEyeL );
		translateGlobal(catEyeL, 0, 0, -3);
		
		// Cat halo
		geometry = new THREE.TorusGeometry( 3, 0.5, 4, 16 );
		var halo = new THREE.Mesh( geometry, haloMaterial );
		scene.add( halo );
		translateGlobal(halo, 1, 24, 0);
		rotateDegrees(halo, 95, 0, 0);

		// Set up hierarchy
		//				   scene
		//				   roombaCat
		//			roomba 			cat
		//			roombaBody		catBody, catTail, catHead
		//											  catHeadBase, catEyeL, catEyeR, halo
		//
		roombaCat = new THREE.Group();
		cat = new THREE.Group();
		var roomba = new THREE.Group();
		catHead = new THREE.Group();
		
		roombaCat.name = roombaCat;
		cat.name = cat;
		roomba.name = roomba;
		catHead.name = catHead;
		
		roomba.add( roombaBody );
		
		cat.add( catBase );
		cat.add( catTail );
		cat.add( catBody );
		cat.add( catHead );
		
		catHead.add( catHeadBase );
		catHead.add( catEyeL );
		catHead.add( catEyeR );
		catHead.add( catEarR );
		catHead.add( catEarL );
		catHead.add( halo );
		
		roombaCat.add( roomba );
		roombaCat.add( cat );
		
		scene.add( roombaCat );
		
		
	}
	
	// Renders the scene and updates the render as needed.
	function animate() {
		requestAnimationFrame(animate);

		// Move the roombaCat around in a circle

		roombaCat.position.set(0, 0, 0);
		rotateDegrees(roombaCat, 0, 1, 0);
		translate(roombaCat, 20, 0, 0);

		stereoEffect.render(scene, camera);
	}
	
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
	

	
	