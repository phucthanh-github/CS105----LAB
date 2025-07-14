function init() {
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000) 

    var cylinder = getCylinder(0.5, 0.5, 2, 32, 0x00ff00);
    var cone = getCone(1, 3, 32, 0xffff00);
    
    cylinder.position.set(-2, 0, 0); 
    cone.position.set(2, 0, 0);   
    
    scene.add(cylinder);
    scene.add(cone);

    var camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth/window.innerHeight,
        1,
        1000
    );
    camera.position.set(0, 3, 10); 
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('webgl').appendChild(renderer.domElement);

    function animate() {
        requestAnimationFrame(animate);
        cylinder.rotation.x += 0.01;
        cylinder.rotation.y += 0.01;
        cone.rotation.x += 0.01;
        cone.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function getCylinder(radiusTop, radiusBottom, height, radialSegments, color) {
    var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
    var material = new THREE.MeshBasicMaterial({ color: color });
    var mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

function getCone(radius, height, radialSegments, color) {
    var geometry = new THREE.ConeGeometry(radius, height, radialSegments);
    var material = new THREE.MeshBasicMaterial({ color: color });
    var mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

init();