class GraphMode {
    constructor(sharedGL) {
        this.gl = sharedGL;
        this.axesMin = -10;
        this.axesMax = 10;
        this.graphMinX = -5;
        this.graphMaxX = 5;
        this.segments = 200;
        
        this.graphData = this.createGraphData(
            x => Math.sin(x), 
            this.graphMinX, 
            this.graphMaxX, 
            this.segments
        );
    }
    
    createGraphData(func, minX, maxX, segments) {
        const data = [];
        const step = (maxX - minX) / segments;
        
        for (let i = 0; i <= segments; i++) {
            const x = minX + i * step;
            const y = func(x);
            data.push(x, y);
        }
        
        return new Float32Array(data);
    }
    
    draw() {
        this.gl.clear();
        this.gl.setTransformMatrix(this.axesMax);
        this.gl.drawAxes(this.axesMin, this.axesMax);
        
        // Vẽ đồ thị
        this.gl.gl.bufferData(this.gl.gl.ARRAY_BUFFER, this.graphData, this.gl.gl.STATIC_DRAW);
        this.gl.gl.uniform4f(this.gl.colorUniformLocation, 1, 0, 0, 1);
        this.gl.gl.drawArrays(this.gl.gl.LINE_STRIP, 0, this.graphData.length / 2);
    }
}