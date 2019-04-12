	var scene, camera, renderer, stereoEffect, controls;
	var ground, roombaCat, catHead, cat, specimen;
	var cameraHolder;
	var FOV = 90;
	var WIDTH, HEIGHT;
	
	var raycaster, arrow;
	var clock;
	var hotspots, hotspotMarkers, line;
	var hotspotTriggered = false;
	var specimenGroup, hudGroup;
	var hud, hotspotHUD;
	var activeHotspot = -1;
	
	var hotspotDictionary = {
		"Main": new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('https://raw.githubusercontent.com/ToskinM/CSE5542_Project/master/Specimen/birchstump.png'), depthTest: true, transparent: true }),
		"Classification": new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('https://raw.githubusercontent.com/ToskinM/CSE5542_Project/master/Specimen/classification.png'), depthTest: true, transparent: true }),
		"Habitat": new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('https://raw.githubusercontent.com/ToskinM/CSE5542_Project/master/Specimen/habitat.png'), depthTest: true, transparent: true }),
	};
	
	var assetPath = "https://cse5542projectwlmt.weebly.com/files/theme/Specimen/";
	var proxyPath = "https://cors-anywhere.herokuapp.com/";
	
	var title, description;
	
	// Website: https://cse5542projectwlmt.weebly.com
	
	// Set this to true to get models to load when testing locally.
	// SET TO FALSE BEFORE UPLOADING TO WEBSITE OR PUSHING
	// If you get a CORS Policy error, its probably this
	var runningLocally = false;
			
	init();
	createHUD();
	createSpecimen();
	
	// Sets up the scene
    function init() {
		if (runningLocally){
			assetPath = proxyPath + "https://cse5542projectwlmt.weebly.com/files/theme/Specimen/";
		}
		
		specimen = new THREE.Object3D();
		clock = new THREE.Clock();
		hotspots = [];
		hotspotMarkers = [];
		specimenGroup = new THREE.Group();
		hudGroup = new THREE.Group();
	
		WIDTH = window.innerWidth * 0.98;
		HEIGHT = window.innerHeight * 0.975;
			
		// Create the scene and set the scene size.
		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0x424242 );
		scene.fog = new THREE.Fog( 0x424242, 0, 150 );
		
		camera = new THREE.PerspectiveCamera(FOV, WIDTH / HEIGHT, 0.001, 700);
		//translateGlobal(camera, 0,40,0);
		scene.add(camera);
			
		// Create a renderer and add it to the DOM, enable shadows.
		renderer = new THREE.WebGLRenderer({antialias:true});
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		
		document.body.appendChild(renderer.domElement);

		document.body.appendChild( WEBVR.createButton( renderer, { frameOfReferenceType: 'eye-level' } ) );
		renderer.vr.enabled = true;
		
		stereoEffect = new THREE.StereoEffect(renderer);
		stereoEffect.setSize( WIDTH, HEIGHT );
		
		// add raycaster
		raycaster = new THREE.Raycaster();
		arrow = new THREE.ArrowHelper( raycaster.ray.direction, raycaster.ray.origin, 100, Math.random() * 0xffffff );
		//scene.add( arrow );
		
		// Create an event listener that resizes the renderer with the browser window and updates camera aspects.
		window.addEventListener('resize', function() {
			WIDTH = window.innerWidth * 0.98;
			HEIGHT = window.innerHeight * 0.975;
			
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

		// //Setup non-VR controls.
		// controls = new THREE.OrbitControls(camera, renderer.domElement);
		// controls.target.set(
			// camera.position.x + 0.15,
			// camera.position.y,
			// camera.position.z
		// );
		// controls.enablePan = false;
		// controls.enableZoom = false;
		
		// // Setup DeviceOrientation functionality
		// window.addEventListener('deviceorientation', setOrientationControls, true);
		// function setOrientationControls(e) {
			// if (!e.alpha) {
				// // If DeviceOrientation controls cannot be set, return
				// return;
			// }
			
			// // If we have a compatable device, replace controlls with VR controls
			// controls = new THREE.DeviceOrientationControls(camera, true);
			// controls.connect();
			// controls.update();
		// }
		
		// // Allow fullscreen on screen click
		// //renderer.domElement.addEventListener('click', fullscreen, false);
		 // window.removeEventListener('deviceorientation', setOrientationControls, true);

		//gui
		//var gui = new dat.GUI();
	}
	
	function createHUD() {	
		var material1 = new THREE.MeshLambertMaterial({color: 0x000000, transparent: true, opacity: 0.0});
		var material2 = new THREE.MeshLambertMaterial({color: 0x000000, transparent: true, opacity: 0.3});
        var geometry = new THREE.PlaneGeometry(1, 0.5, 1, 1);
		
		// HUD Backgrounds
		hud = new THREE.Mesh(geometry, material2);
        hotspotHUD = new THREE.Mesh(geometry, material2);
		scene.add(hud);
		scene.add(hotspotHUD);
		camera.add(hud);
		camera.add(hotspotHUD);
		hud.position.set(-0.55,-0.7,-1);
		hotspotHUD.position.set(0.55,-0.7,-1);
		
		// HUD Text Areas
        hud = new THREE.Mesh(geometry, hotspotDictionary['Main']);
        hotspotHUD = new THREE.Mesh(geometry, material1);
		scene.add(hud);
		scene.add(hotspotHUD);
		camera.add(hud);
		camera.add(hotspotHUD);
		hud.position.set(-0.55,-0.7,-1);
		hotspotHUD.position.set(0.55,-0.7,-1);
	}

	function createSpecimen() {	
		// ground
		var groundMaterial = new THREE.MeshLambertMaterial ( { color: 0xffffff } );
		var geometry = new THREE.PlaneGeometry( 2000, 2000, 10, 10 );
		ground = CreateMeshWithShadows( geometry, groundMaterial );
		ground.name = 'ground';
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
						specimen.name = 'specimen';
						specimen.position.set(0, 0, 0);
						specimen.scale.set(0.2, 0.2, 0.2);
						rotateDegrees(specimen, 90, 0, 0);
						scene.add(specimen);
						
						addHotspots();
						
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
	
	function addHotspots(){
		var sphereGeometry = new THREE.SphereGeometry( 1, 32, 32 );
		var sphereHotspotGeometry = new THREE.SphereGeometry( 10, 32, 32 );
		
		var sphereMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide});
		var invisibleMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00, transparent: true, opacity: 0.0});
		
		// Add first hotspot
		var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
		var sphereHotspot = new THREE.Mesh( sphereHotspotGeometry, invisibleMaterial );
		sphereHotspot.name = 'Classification';
		sphere.position.set(specimen.position.x - 2, specimen.position.y + 40, specimen.position.z - 5);
		sphereHotspot.position.set(specimen.position.x - 2, specimen.position.y + 40, specimen.position.z - 5);
		scene.add(sphere);
		scene.add(sphereHotspot);
		hotspotMarkers.push(sphere);
		hotspots.push(sphereHotspot);
		
		// Add second hotspot
		sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
		sphereHotspot = new THREE.Mesh( sphereHotspotGeometry, invisibleMaterial );
		sphereHotspot.name = 'Habitat';
		sphere.position.set(specimen.position.x + 2, specimen.position.y + 10, specimen.position.z + 10);
		sphereHotspot.position.set(specimen.position.x + 2, specimen.position.y + 10, specimen.position.z + 10);
		scene.add(sphere);
		scene.add(sphereHotspot);
		hotspotMarkers.push(sphere);
		hotspots.push(sphereHotspot);

		// Group together the specimen and out hotspots, so they're 'points' on the specimen
		specimenGroup.position.set(0, -20, -40);
		specimenGroup.add(specimen)
		specimenGroup.add(hotspots[0])
		specimenGroup.add(hotspotMarkers[0])
		specimenGroup.add(hotspots[1])
		specimenGroup.add(hotspotMarkers[1])
		scene.add(specimenGroup);

		renderer.setAnimationLoop(animate);
	}
	
	// var RotationCtrl = function() {
	// 	this.XRotation = 0.01;
	// 	this.YRotation = 0.2;
	// 	this.ZRotation = 0.2;
	// 	this.stop = false;
	// 	this.Text = false;
	// };
	//
	// var rotCtrl = new RotationCtrl();
	// //var gui = new dat.GUI();
	// var gui = new dat.GUIVR.create('Rotation Control');
	// gui.add(rotCtrl, 'XRotation', 0, 2);
	// gui.add(rotCtrl, 'YRotation', 0, 2);
	// gui.add(rotCtrl, 'ZRotation', 0, 2);
	// gui.add(rotCtrl, 'stop');
	// gui.add(rotCtrl, 'Text');
	// gui.position.set(1, 2, -3);
	// gui.scale.set(3,3,3);
	// scene.add(gui);
	// var gazeInput = dat.GUIVR.addInputObject( camera );
	// scene.add( gazeInput.cursor );
	
	function changeParagraphText(text)
	{
		//document.getElementById("info").innerHTML = "<p><font color=\"white\">"+text+"</font></p>";
		//title = text;
		
		hotspotHUD.material = text;
	}

	function changeHeaderText(text)
	{
		//document.getElementById("header").innerHTML = "<p><font color=\"white\" size = \"6\">"+text+"</font></p>";
		//description = text;
		
		hudRight.material = text;
	}

	function animate(){
		// Rotate our specimen
		rotateDegrees(specimenGroup, 0, 1, 0);
		
		hudGroup.position.set
	
		// update the position of arrow
		arrow.setDirection(raycaster.ray.direction);

		// update the raycaster
		var worldPos = new THREE.Vector3();
		var worldDir = new THREE.Vector3();
		worldPos = camera.getWorldPosition(worldPos)
		worldDir = camera.getWorldDirection(worldDir)
		raycaster.set(worldPos, worldDir);

		// test intersection with all hotspots.
		var intersects = raycaster.intersectObjects(hotspots);
		if (intersects.length > 0) {
			console.log('Looking at: ' + intersects[0].object.name);
			
			// Start clock to see how long this hotspot is being looked at
			if (!clock.running) clock.start();
			
			// make the hotspot pulse
			var delta = clock.getElapsedTime();
			var scale = Math.abs(Math.sin(delta/1*Math.PI)) * 1.5;
			if (scale < 1) {
				scale = 1;
			}
			
			//intersects[0].object.scale.set(scale, scale, scale);
			if (intersects[0].object.name === 'Classification')
				hotspotMarkers[0].scale.set(scale, scale, scale);
			else if (intersects[0].object.name === 'Habitat')
				hotspotMarkers[1].scale.set(scale, scale, scale);
			
			// If the hotspot is looked at for 0.5 seconds, trigger UI update
			if (!hotspotTriggered && clock.getElapsedTime() > 0.5) {
				hotspotTriggered = true;
				
				// UI update
				console.log(hotspotDictionary[intersects[0].object.name]);
				
				if (intersects[0].object.name === 'Classification')
					activeHotspot = 0;
				else if (intersects[0].object.name === 'Habitat')
					activeHotspot = 1;
				
				changeParagraphText(hotspotDictionary[intersects[0].object.name])
				//changeHeaderText(intersects[0].object.name)
			}

		} else {
			hotspotTriggered = false;
			
			// If no hotspots are being looked at, reset the clock
			clock.stop();
			
			// Reset size of hotspots
			for (var i = 0; i < scene.children.length; i ++) {
				hotspotMarkers[0].scale.set(1,1,1);
				hotspotMarkers[1].scale.set(1,1,1);
			}
		}
		scene.remove(line);
		if (activeHotspot >= 0){
			var material = new THREE.LineBasicMaterial( { color: 0xaaaaaa } );
			var geometry = new THREE.Geometry();
			
			var hotspotPosition = new THREE.Vector3();
			var HUDPosition = new THREE.Vector3();
			hotspotPosition = hotspots[activeHotspot].getWorldPosition(hotspotPosition);
			HUDPosition = hotspotHUD.getWorldPosition(HUDPosition) ;
			geometry.vertices = [hotspotPosition,HUDPosition];

			line = new THREE.Line( geometry, material );
			scene.add( line );
		}

		
		//stereoEffect.render(scene, camera);
		renderer.render(scene, camera);
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
