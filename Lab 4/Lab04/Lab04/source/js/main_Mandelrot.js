function flatten(arr){
    return new Float32Array(arr.flat());
}

function createProgram(gl, vSrc, fSrc) {
    function compile(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    const vShader = compile(gl.VERTEX_SHADER, vSrc);
    const fShader = compile(gl.FRAGMENT_SHADER, fSrc);

    if (!vShader || !fShader) {
        return null;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        gl.deleteShader(vShader);
        gl.deleteShader(fShader);
        return null;
    }
    return program;
}

function main(){
    const canvas = document.getElementById("canvas");
    const gl = canvas.getContext("webgl");
    const maxIterations = 100;
    if(!gl){return;}

    function parseComplex(cString)
    {
        var match = cString.match(/(-?\d+(\.\d+)?)([+-])(\d+(\.\d+)?)i/);
        if (!match) return null;
        const real = parseFloat(match[1]);
        const imag = parseFloat((match[3] === '+' ? 1 : -1) * parseFloat(match[4]));
        return { real, imag };
    }

    function getCValue(){
        var cValue = document.getElementById("cValue");
        return cValue.value;
    }

    function drawMandelbrot() {
        const vertexShaderSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;
    
        const fragmentShaderSource = `
            precision mediump float;
    
            uniform vec2 u_resolution;
            uniform int u_maxIterations;

            vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
                return a + b*cos( 6.28318*(c*t+d) );
            }

            void main() {
                vec2 c = (gl_FragCoord.xy - u_resolution / 2.0) * 4.0 / u_resolution.x;
                vec2 z = vec2(0.0, 0.0);
                int iterations = 0;
                for (int i = 0; i < 100; i++) {
                    if(i >= u_maxIterations) break;
                    vec2 zTemp = vec2(z.x * z.x - z.y * z.y + c.x, 2.0 * z.x * z.y + c.y);
                    z = zTemp;
                    if (dot(z, z) > 4.0) {
                        iterations = i;
                        break;
                    }
                }
    
                if (iterations == u_maxIterations) {
                    gl_FragColor = vec4(vec3(0.0), 1.0);
                } else {
                    gl_FragColor = vec4(vec3(float(iterations)) / float(u_maxIterations), 1.0);
                }
            }
        `;
    
        const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
        gl.useProgram(program);
    
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [-1, -1, 1, -1, -1, 1, 1, 1];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        const positionLocation = gl.getAttribLocation(program, "a_position");
        const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        const maxIterationsLocation = gl.getUniformLocation(program, "u_maxIterations");
    
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
    
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform1i(maxIterationsLocation, maxIterations);
    
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function drawJulia(){
        const c = parseComplex(getCValue());
        if(!c){
            alert("c not valid!"); return;
        }
        const vertexShaderSource = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
        `;
        const fragmentShaderSource = `
        precision mediump float;

        uniform vec2 u_resolution;
        uniform vec2 u_c;
        uniform int u_maxIterations;

        vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
            return a + b*cos( 6.28318*(c*t+d) );
        }

        void main() {
            vec2 z = (gl_FragCoord.xy - u_resolution / 2.0) * 4.0 / u_resolution.x;
            int iterations = 0;
            for (int i = 0; i < 100; i++) { // Change u_maxIterations to 100
                if(i >= u_maxIterations) break; // Add conditional break
                float zRealTemp = z.x * z.x - z.y * z.y + u_c.x;
                z.y = 2.0 * z.x * z.y + u_c.y;
                z.x = zRealTemp;
                if (z.x * z.x + z.y * z.y > 4.0) {
                    iterations = i;
                    break;
                }
            }

            if (iterations == u_maxIterations) {
                gl_FragColor = vec4(vec3(0.0), 1.0);
            } else {
                gl_FragColor = vec4(vec3(float(iterations)) / float(u_maxIterations), 1.0);
            }
        }
        `;
        const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
        gl.useProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [-1, -1, 1, -1, -1, 1, 1, 1];
        gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, "a_position");
        const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        const maxIterationsLocation = gl.getUniformLocation(program, "u_maxIterations");
        const cLocation = gl.getUniformLocation(program, "u_c");    
        
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        gl.viewport(0,0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        
        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(cLocation, c.real, c.imag);
        gl.uniform1i(maxIterationsLocation, maxIterations);
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    const drawMandelbrotBtn = document.getElementById("drawMandelbrotBtn");
    const drawJuliaBtn = document.getElementById("drawJuliaBtn");

    drawMandelbrotBtn.addEventListener("click", function(){
        drawMandelbrot();
    });
    drawJuliaBtn.addEventListener("click", function(){
        drawJulia();
    });
}

main();