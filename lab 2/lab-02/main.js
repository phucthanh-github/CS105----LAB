const canvas = document.getElementById("webglCanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  console.error("WebGL không được hỗ trợ trên trình duyệt này!");
}

// Đặt kích thước canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);

// Vertex Shader
const vertexShaderSource = `
  attribute vec2 a_position;
  uniform mat3 u_translationMatrix;
  uniform mat3 u_rotationMatrix;
  uniform mat3 u_scaleMatrix;
  void main() {
    vec3 position = u_translationMatrix * u_rotationMatrix * u_scaleMatrix * vec3(a_position, 1);
    gl_Position = vec4(position.xy, 0, 1);
  }
`;

// Fragment Shader
const fragmentShaderSource = `
  void main() {
    gl_FragColor = vec4(0, 0, 1, 1); // Màu xanh dương
  }
`;

// Hàm tạo shader
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Lỗi biên dịch shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// Tạo và biên dịch shader
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

// Tạo chương trình shader
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error("Lỗi liên kết chương trình:", gl.getProgramInfoLog(program));
}

// Sử dụng chương trình shader
gl.useProgram(program);

// Tạo buffer và đưa dữ liệu vào
const positionBuffers = [];
const positions = [
  // Chữ "F"
  [
    // Thanh dọc của chữ "F"
    -0.5, -0.5, // Đỉnh dưới trái
    -0.4, -0.5, // Đỉnh dưới phải
    -0.5,  0.5, // Đỉnh trên trái
    -0.4,  0.5, // Đỉnh trên phải

    // Thanh ngang trên của chữ "F"
    -0.5,  0.5,
    -0.1,  0.5,
    -0.5,  0.4,
    -0.1,  0.4,

    // Thanh ngang giữa của chữ "F"
    -0.5,  0.1,
    -0.2,  0.1,
    -0.5, -0.0,
    -0.2, -0.0,
  ],
  // Chữ "H"
  [
    // Thanh dọc trái của chữ "H"
    -0.1, -0.5,
     0.0, -0.5,
    -0.1,  0.5,
     0.0,  0.5,

    // Thanh dọc phải của chữ "H"
     0.2, -0.5,
     0.3, -0.5,
     0.2,  0.5,
     0.3,  0.5,

    // Thanh ngang giữa của chữ "H"
    -0.1,  0.0,
     0.3,  0.0,
    -0.1, -0.1,
     0.3, -0.1,
  ]
];

positions.forEach((pos, index) => {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
  positionBuffers.push(buffer);
});

// Liên kết thuộc tính với shader
const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionAttributeLocation);

// Lấy vị trí uniform cho ma trận tịnh tiến, xoay và tỉ lệ
const translationMatrixLocation = gl.getUniformLocation(program, "u_translationMatrix");
const rotationMatrixLocation = gl.getUniformLocation(program, "u_rotationMatrix");
const scaleMatrixLocation = gl.getUniformLocation(program, "u_scaleMatrix");

// Khởi tạo ma trận tịnh tiến, xoay và tỉ lệ cho từng đối tượng
const objects = [
  { // Chữ "F"
    translation: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    rotation: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    scale: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  },
  { // Chữ "H"
    translation: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    rotation: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    scale: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  }
];

// Hàm cập nhật ma trận tịnh tiến
function updateTranslationMatrix(index, dx, dy) {
  objects[index].translation[6] = dx;
  objects[index].translation[7] = dy;
}

// Hàm cập nhật ma trận xoay
function updateRotationMatrix(index, angle) {
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  objects[index].rotation = [
    cosA, -sinA, 0,
    sinA,  cosA, 0,
    0,     0,    1
  ];
}

// Hàm cập nhật ma trận tỉ lệ
function updateScaleMatrix(index, sx, sy) {
  objects[index].scale = [
    sx, 0, 0,
    0, sy, 0,
    0, 0, 1
  ];
}

// Hàm vẽ lại cảnh
function drawScene() {
  gl.clearColor(1, 1, 1, 1); // Đặt màu nền trắng
  gl.clear(gl.COLOR_BUFFER_BIT);

  objects.forEach((obj, index) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffers[index]);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // Áp dụng các ma trận biến đổi
    gl.uniformMatrix3fv(translationMatrixLocation, false, obj.translation);
    gl.uniformMatrix3fv(rotationMatrixLocation, false, obj.rotation);
    gl.uniformMatrix3fv(scaleMatrixLocation, false, obj.scale);

    // Vẽ đối tượng
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.drawArrays(gl.TRIANGLE_STRIP, 4, 4);
    gl.drawArrays(gl.TRIANGLE_STRIP, 8, 4);
  });
}

// Thêm giao diện thanh trượt và nút bấm
const controls = document.createElement("div");
controls.innerHTML = `
  <div>
    <label for="objectSelector">Chọn đối tượng:</label>
    <select id="objectSelector">
      <option value="0">Chữ F</option>
      <option value="1">Chữ H</option>
    </select>
  </div>
  <div>
    <label for="translateX">Tịnh tiến Ox:</label>
    <input type="range" id="translateX" min="0" max="100" value="50">
  </div>
  <div>
    <label for="translateY">Tịnh tiến Oy:</label>
    <input type="range" id="translateY" min="0" max="100" value="50">
  </div>
  <div>
    <label for="rotate">Góc quay (angle):</label>
    <input type="range" id="rotate" min="0" max="100" value="0">
  </div>
  <div>
    <label for="scaleX">Tỉ lệ X:</label>
    <input type="range" id="scaleX" min="0" max="100" value="50">
  </div>
  <div>
    <label for="scaleY">Tỉ lệ Y:</label>
    <input type="range" id="scaleY" min="0" max="100" value="50">
  </div>
  <div>
    <button id="autoTransform">Bật/Tắt Tự động</button>
  </div>
`;
document.body.appendChild(controls);

// Lấy các thanh trượt và nút bấm
const objectSelector = document.getElementById("objectSelector");
const translateXSlider = document.getElementById("translateX");
const translateYSlider = document.getElementById("translateY");
const rotateSlider = document.getElementById("rotate");
const scaleXSlider = document.getElementById("scaleX");
const scaleYSlider = document.getElementById("scaleY");
const autoTransformButton = document.getElementById("autoTransform");

// Biến kiểm soát chế độ tự động
let isAutoTransformEnabled = false;

// Xử lý sự kiện thay đổi giá trị thanh trượt
function updateSelectedObject() {
  const selectedIndex = parseInt(objectSelector.value);
  const dx = (translateXSlider.value - 50) / 50; // Chuyển đổi giá trị từ 0-100 sang -1 đến 1
  const dy = (translateYSlider.value - 50) / 50; // Chuyển đổi giá trị từ 0-100 sang -1 đến 1
  const angle = (rotateSlider.value / 100) * Math.PI * 2; // Chuyển đổi giá trị từ 0-100 sang 0 đến 2π
  const sx = scaleXSlider.value / 50; // Chuyển đổi giá trị từ 0-100 sang 0 đến 2
  const sy = scaleYSlider.value / 50; // Chuyển đổi giá trị từ 0-100 sang 0 đến 2

  updateTranslationMatrix(selectedIndex, dx, dy);
  updateRotationMatrix(selectedIndex, angle);
  updateScaleMatrix(selectedIndex, sx, sy);
  drawScene();
}

translateXSlider.addEventListener("input", updateSelectedObject);
translateYSlider.addEventListener("input", updateSelectedObject);
rotateSlider.addEventListener("input", updateSelectedObject);
scaleXSlider.addEventListener("input", updateSelectedObject);
scaleYSlider.addEventListener("input", updateSelectedObject);

// Xử lý sự kiện nút bấm tự động
autoTransformButton.addEventListener("click", () => {
  isAutoTransformEnabled = !isAutoTransformEnabled;
  if (isAutoTransformEnabled) {
    autoTransformButton.textContent = "Tắt Tự động";
    autoTransform();
  } else {
    autoTransformButton.textContent = "Bật Tự động";
  }
});

// Hàm tự động biến đổi
function autoTransform() {
  if (!isAutoTransformEnabled) return;

  const selectedIndex = parseInt(objectSelector.value);

  // Cập nhật tịnh tiến
  let dx = (translateXSlider.value - 50) / 50;
  let dy = (translateYSlider.value - 50) / 50;
  dx += 0.01; // Di chuyển sang phải
  if (dx > 1) dx = -1; // Quay lại vị trí ban đầu
  translateXSlider.value = (dx + 1) * 50;
  updateTranslationMatrix(selectedIndex, dx, dy);

  // Cập nhật góc quay
  let angle = (rotateSlider.value / 100) * Math.PI * 2;
  angle += 0.02; // Xoay thêm một góc nhỏ
  if (angle > Math.PI * 2) angle = 0; // Quay lại góc ban đầu
  rotateSlider.value = (angle / (Math.PI * 2)) * 100;
  updateRotationMatrix(selectedIndex, angle);

  // Cập nhật tỉ lệ
  let sx = scaleXSlider.value / 50;
  let sy = scaleYSlider.value / 50;
  sx += 0.01; // Tăng tỉ lệ X
  sy += 0.01; // Tăng tỉ lệ Y
  if (sx > 2) sx = 0.5; // Quay lại tỉ lệ ban đầu
  if (sy > 2) sy = 0.5; // Quay lại tỉ lệ ban đầu
  scaleXSlider.value = sx * 50;
  scaleYSlider.value = sy * 50;
  updateScaleMatrix(selectedIndex, sx, sy);

  // Vẽ lại cảnh
  drawScene();

  // Lặp lại hàm tự động
  requestAnimationFrame(autoTransform);
}

// Vẽ cảnh ban đầu
drawScene();