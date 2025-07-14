class SharedGL {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext('webgl');
        
        if (!this.gl) {
            alert('Trình duyệt của bạn không hỗ trợ WebGL.');
            throw new Error('WebGL not supported');
        }
        
        // Thiết lập kích thước điểm vẽ
        this.gl.enable(this.gl.PROGRAM_POINT_SIZE);
        this.gl.pointSize = 5.0;
        
        this.initShaders();
        this.setupBuffers();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    initShaders() {
        // Vertex shader
        const vertexShaderSource = `
            attribute vec2 a_position;
            uniform mat3 u_matrix;
            
            void main() {
                vec2 position = (u_matrix * vec3(a_position, 1)).xy;
                gl_Position = vec4(position, 0, 1);
            }
        `;
        
        // Fragment shader
        const fragmentShaderSource = `
            precision mediump float;
            uniform vec4 u_color;
            
            void main() {
                gl_FragColor = u_color;
            }
        `;
        
        this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
        this.gl.useProgram(this.program);
        
        // Lấy vị trí các attribute và uniform
        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.matrixUniformLocation = this.gl.getUniformLocation(this.program, 'u_matrix');
        this.colorUniformLocation = this.gl.getUniformLocation(this.program, 'u_color');
    }
    
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    createProgram(vertexShaderSource, fragmentShaderSource) {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program linking error:', this.gl.getProgramInfoLog(program));
            return null;
        }
        
        return program;
    }
    
    setupBuffers() {
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    
    clear() {
        this.gl.clearColor(1, 1, 1, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
    
    setTransformMatrix(axesMax) {
        const aspectRatio = this.canvas.width / this.canvas.height;
        const scaleX = 1 / (axesMax * aspectRatio);
        const scaleY = 1 / axesMax;
        
        const matrix = [
            scaleX, 0, 0,
            0, scaleY, 0,
            0, 0, 1
        ];
        
        this.gl.uniformMatrix3fv(this.matrixUniformLocation, false, matrix);
    }
    
    drawAxes(axesMin, axesMax) {
        // Dữ liệu trục x và y
        const axesData = new Float32Array([
            axesMin, 0, axesMax, 0, // Trục x
            0, axesMin, 0, axesMax  // Trục y
        ]);
        
        this.gl.bufferData(this.gl.ARRAY_BUFFER, axesData, this.gl.STATIC_DRAW);
        
        // Vẽ trục x
        this.gl.uniform4f(this.colorUniformLocation, 0, 0, 0, 1);
        this.gl.drawArrays(this.gl.LINES, 0, 2);
        
        // Vẽ trục y
        this.gl.drawArrays(this.gl.LINES, 2, 2);
    }
}