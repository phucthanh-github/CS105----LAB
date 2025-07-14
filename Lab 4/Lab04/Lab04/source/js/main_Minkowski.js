function main() {
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // Setup GLSL program
  var program = webglUtils.createProgramFromScripts(gl, [
    "vertex-shader-2d",
    "fragment-shader-2d",
  ]);

  // Look up where the vertex data needs to go
  var positionLocation = gl.getAttribLocation(program, "a_position");

  // Lookup uniforms
  var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  var colorLocation = gl.getUniformLocation(program, "u_color");

  // Create a buffer to put positions in
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  function generateMinkowski(iteration) {
    if (iteration === 0) {
      const size = 300;
      const offsetX = (canvas.width - size) / 2;
      const offsetY = (canvas.height - size) / 2;

      return [
        offsetX, offsetY,                // Top-left
        offsetX + size, offsetY,         // Top-right
        offsetX + size, offsetY + size,  // Bottom-right
        offsetX, offsetY + size,         // Bottom-left
        offsetX, offsetY                 // Back to start (to close the path)
      ];
    }

    const previousPoints = generateMinkowski(iteration - 1);
    const newPoints = [];

    for (let i = 0; i < previousPoints.length - 2; i += 2) {
      const x1 = previousPoints[i];
      const y1 = previousPoints[i + 1];
      const x2 = previousPoints[i + 2];
      const y2 = previousPoints[i + 3];

      // Calculate the Minkowski transformation for this segment
      const dx = x2 - x1;
      const dy = y2 - y1;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);
      const unitX = dx / segmentLength;
      const unitY = dy / segmentLength;

      // Perpendicular unit vector
      const perpX = -unitY;
      const perpY = unitX;

      // divide a line segment into 4 equal parts
      const step = segmentLength / 4;

      // Start point
      var currentX = x1;
      var currentY = y1;
      newPoints.push(currentX, currentY);

      // First segment
      currentX += unitX * step;
      currentY += unitY * step;
      newPoints.push(currentX, currentY);

      // Turn down segment
      currentX += perpX * step;
      currentY += perpY * step;
      newPoints.push(currentX, currentY);

      // Straight segment
      currentX += unitX * step;
      currentY += unitY * step;
      newPoints.push(currentX, currentY);

      // Turn up segment
      currentX -= perpX * step * 2;
      currentY -= perpY * step * 2;
      newPoints.push(currentX, currentY);
      
      // Middle segment
      currentX += unitX * step;
      currentY += unitY * step;
      newPoints.push(currentX, currentY);

      // Turn down segment
      currentX += perpX * step;
      currentY += perpY * step;
      newPoints.push(currentX, currentY);

      // Straight segment
      currentX += unitX * step;
      currentY += unitY * step;
      newPoints.push(currentX, currentY);

      // End point
      newPoints.push(x2, y2);
    }

    return newPoints;
  }

  // Draw the scene.
  function drawScene(iteration) {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);

    const points = generateMinkowski(iteration);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionLocation);

    // Draw each object
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,  new Float32Array(points), gl.STATIC_DRAW);

    // Tell the attribute how to get data out of positionBuffer
    var size = 2; // 2 components per iteration
    var type = gl.FLOAT; // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0; // 0 = move forward size * sizeof(type) each iteration
    var offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    // Set the resolution
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // Set the color
    gl.uniform4fv(colorLocation, [0, 0, 0, 1]);

    gl.drawArrays(gl.LINE_STRIP, 0, points.length / 2);
  }

  const iterationSlider = document.getElementById("iteration");
  const iterationValue = document.getElementById("iterationValue");

  iterationSlider.addEventListener("input", function () {
    iterationValue.textContent = this.value;
    drawScene(parseInt(this.value));
  });

  drawScene(parseInt(iterationSlider.value));
}

main();
