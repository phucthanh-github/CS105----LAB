function flatten(arr) {
    return new Float32Array(arr.flat());
}

function createProgram(gl, vSrc, fSrc) {
    function compile(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }
    const vShader = compile(gl.VERTEX_SHADER, vSrc);
    const fShader = compile(gl.FRAGMENT_SHADER, fSrc);
    const program = gl.createProgram();
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    return program;
}
// Hàm tính trung điểm (khi s=0.5)
function mix(u, v, s) {
    return [
        (1 - s) * u[0] + s * v[0],
        (1 - s) * u[1] + s * v[1]
    ];
}

// === VẼ TAM GIÁC ===
function drawTriangle() {
    const canvas = document.getElementById("glcanvas");
    const gl = canvas.getContext("webgl");
    if (!gl) {
        alert("WebGL not supported!");
        return;
    }

    const depth = parseInt(document.getElementById("depth").value);
    const triangles = [];
    // Khởi tạo tam giác đều
    const vertices = [
        [-1, -1],
        [0, 1],
        [1, -1]
    ];
    // Hàm đệ quy chia tam giác
    // Nhận đầu vào là tọa độ ba đỉnh tam giác và cấp đệ quy
    function divideTriangle(a, b, c, depth) {
        if (depth === 0) { // Nếu cấp đệ quy đã hết thì vẽ ba điểm
            triangles.push(a, b, c);
        } else { // Ngược lại, nếu cấp đệ quy khác 0, gọi hàm tính trung điểm
            // Chia thành 3 tam giác con bằng cách nối trung điểm
            const ab = mix(a, b, 0.5);
            const bc = mix(b, c, 0.5);
            const ca = mix(c, a, 0.5);
            // Giảm cấp đệ quy và tiếp tục gọi hàm đệ quy
            divideTriangle(a, ab, ca, depth - 1);
            divideTriangle(ab, b, bc, depth - 1);
            divideTriangle(ca, bc, c, depth - 1);
        }
    }
    // Gọi hàm để vẽ tam giác 
    divideTriangle(vertices[0], vertices[1], vertices[2], depth);

    const vertexShaderSource = `
        attribute vec2 aPosition;
        void main() {
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
    `;
    const fragmentShaderSource = `
        void main() {
            gl_FragColor = vec4(0.2, 0.4, 1.0, 1.0); // màu xanh lam
        }
    `;

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangles), gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, triangles.length);
}

// === VẼ HÌNH VUÔNG ===
function drawCarpet() {
    const canvas = document.getElementById("glcanvas");
    const gl = canvas.getContext("webgl");
    if (!gl) {
        alert("WebGL not supported!");
        return;
    }

    const depth = parseInt(document.getElementById("depth").value);
    const squares = [];

    // Hàm đệ quy
    // x, y: tọa độ góc dưới bên trái của hình vuông
    // size: độ dài cạnh hình vuông hiện tại
    // depth: số cấp đệ quy
    function divideSquare(x, y, size, depth) {
        // Nếu depth (cấp đệ quy) = 0 thì vẽ hình vuông bằng cách ghép hai tam giác
        if (depth === 0) {
            // Góc dưới bên trái
            const x1 = x, y1 = y;
            // Góc dưới bên phải
            const x2 = x + size, y2 = y;
            // Góc trên bên phải
            const x3 = x + size, y3 = y + size;
            // Góc trên bên trái
            const x4 = x, y4 = y + size;
            // Ghép hai tam giác 
            squares.push(
                [x1, y1], [x2, y2], [x3, y3],
                [x1, y1], [x3, y3], [x4, y4]
            );

        // Nếu depth != 0, chia hình vuông thành 9 hình vuông bằng nhau
        } else {
            // newSize: độ dài cạnh của mỗi hình vuông nhỏ bằng 1/3 hình vuông ban đầu
            const newSize = size / 3;
            // Duyệt từng hình vuông nhỏ
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    // Bỏ qua hình vuông chính giữa
                    if (row === 1 && col === 1) continue;
                    // tính lại tọa độ góc dưới bên trái của hình vuông con
                    const newX = x + col * newSize;
                    const newY = y + row * newSize;
                    // gọi hàm đệ quy với depth - 1 để cập nhật tọa độ
                    divideSquare(newX, newY, newSize, depth - 1);
                }
            }
        }
    }
    // Gọi hàm để vẽ hình vuông
    divideSquare(-1, -1, 2, depth);

    const vertexShaderSource = `
        attribute vec2 aPosition;
        void main() {
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
    `;
    const fragmentShaderSource = `
        void main() {
            gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0); // màu đỏ
        }
    `;

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(squares), gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, squares.length);
}
