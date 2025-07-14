function init() {
    // Tạo scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f25);
    
    // Tạo camera
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 3, 10);
    camera.lookAt(0, 0, 0);
    
    // Tạo renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    
    // Tạo texture loader
    const textureLoader = new THREE.TextureLoader();
    
    // Tạo hình trụ với texture gỗ
    const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
    const cylinderMaterial = new THREE.MeshStandardMaterial({ 
        map: textureLoader.load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg'),
        roughness: 0.8,
        metalness: 0.2
    });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.set(-2, 0, 0);
    cylinder.castShadow = true;
    scene.add(cylinder);
    
    // Tạo hình nón với texture kim loại
    const coneGeometry = new THREE.ConeGeometry(1, 3, 32);
    const coneMaterial = new THREE.MeshStandardMaterial({ 
        map: textureLoader.load('https://ambientcg.com/view?id=Metal034'),
        roughness: 0.1,
        metalness: 1
    });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.set(2, 0, 0);
    cone.castShadow = true;
    scene.add(cone);
    
    // Tạo sàn
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a3b4c,
        roughness: 0.9,
        metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Tạo ánh sáng
    // 1. AmbientLight (ánh sáng môi trường) 
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    
    // 2. DirectionalLight (ánh sáng định hướng) –
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // 3. PointLight (ánh sáng điểm) 
    const pointLight = new THREE.PointLight(0xff7f50, 2, 20);
    pointLight.position.set(-4, 3, 0);
    scene.add(pointLight);
    
    const coneLight = new THREE.PointLight(0xffffff, 3, 10);
    coneLight.position.set(2, 3, 2); 
    scene.add(coneLight);
    // Animation
    function animate() {
        requestAnimationFrame(animate);
        
        // Xoay các đối tượng
        cylinder.rotation.x += 0.01;
        cylinder.rotation.y += 0.01;
        
        cone.rotation.x += 0.01;
        cone.rotation.y += 0.01;
        
        // Di chuyển point light
        pointLight.position.x = -4 + Math.sin(Date.now() * 0.001) * 3;
        pointLight.position.z = Math.cos(Date.now() * 0.001) * 3;
        
        renderer.render(scene, camera);
    }
    animate();
    
    // Xử lý thay đổi kích thước cửa sổ
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Khởi chạy ứng dụng
init();
