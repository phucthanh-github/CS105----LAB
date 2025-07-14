function init() {
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000) 

    var cylinder = getCylinder(0.5, 0.5, 2, 32, 0x00ff00);
    var cone = getCone(1, 3, 32, 0xffff00);
    
    // Áp dụng phép tịnh tiến ban đầu
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
    // Thay đổi vị trí camera
    camera.position.set(5, 5, 10);
    // Thay đổi điểm camera nhìn tới (VRP)
    camera.lookAt(new THREE.Vector3(1, 2, -3));

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('webgl').appendChild(renderer.domElement);

    // Tạo các biến điều khiển
    var scaleDirection = 1;
    var moveDirection = 1;

    function animate() {
        requestAnimationFrame(animate);
        
        // Phép QUAY - tiếp tục quay các đối tượng
        cylinder.rotation.x += 0.01;
        cylinder.rotation.y += 0.01;
        cone.rotation.x += 0.01;
        cone.rotation.y += 0.01;
        
        // Phép TỈ LỆ - thay đổi kích thước tuần hoàn
        if (cylinder.scale.x > 1.5 || cylinder.scale.x < 0.7) {
            scaleDirection *= -1;
        }
        var scaleFactor = 1 + 0.005 * scaleDirection;
        cylinder.scale.multiplyScalar(scaleFactor);
        
        // Phép TỊNH TIẾN - di chuyển lên xuống
        if (cone.position.y > 3 || cone.position.y < -3) {
            moveDirection *= -1;
        }
        cone.position.y += 0.05 * moveDirection;
        
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
    var material = new THREE.MeshBasicMaterial({ 
        color: color,
    });
    var mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

function getCone(radius, height, radialSegments, color) {
    var geometry = new THREE.ConeGeometry(radius, height, radialSegments);
    var material = new THREE.MeshBasicMaterial({ 
        color: color,
    });
    var mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

init();