class BezierMode {
    constructor(sharedGL, controlPointsTextarea) {
        this.gl = sharedGL;
        this.controlPointsTextarea = controlPointsTextarea;
        this.axesMin = -10;
        this.axesMax = 10;
    }
    
    calculateBezierPoint(controlPoints, t) {
        const n = controlPoints.length - 1;
        let x = 0, y = 0;
        
        for (let i = 0; i <= n; i++) {
            const binomial = this.binomialCoefficient(n, i);
            const term = binomial * Math.pow(1 - t, n - i) * Math.pow(t, i);
            x += controlPoints[i][0] * term;
            y += controlPoints[i][1] * term;
        }
        
        return [x, y];
    }
    
    binomialCoefficient(n, k) {
        let coeff = 1;
        for (let i = 1; i <= k; i++) {
            coeff *= (n - k + i) / i;
        }
        return coeff;
    }
    
    createBezierData(controlPoints, segments = 100) {
        const data = [];
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const point = this.calculateBezierPoint(controlPoints, t);
            data.push(point[0], point[1]);
        }
        
        return new Float32Array(data);
    }
    
    parseControlPoints() {
        const text = this.controlPointsTextarea.value.trim();
        if (!text) return [];
        
        const lines = text.split('\n');
        const controlPoints = [];
        
        for (const line of lines) {
            const parts = line.split(',');
            if (parts.length === 2) {
                const x = parseFloat(parts[0]);
                const y = parseFloat(parts[1]);
                if (!isNaN(x) && !isNaN(y)) {
                    controlPoints.push([x, y]);
                }
            }
        }
        
        return controlPoints;
    }
    
    drawControlPoints(controlPoints) {
        const pointData = [];
        
        for (const point of controlPoints) {
            pointData.push(point[0], point[1]);
        }
        
        this.gl.gl.bufferData(this.gl.gl.ARRAY_BUFFER, new Float32Array(pointData), this.gl.gl.STATIC_DRAW);
        this.gl.gl.uniform4f(this.gl.colorUniformLocation, 0, 0, 1, 1);
        this.gl.gl.drawArrays(this.gl.gl.POINTS, 0, controlPoints.length);
        
        // Vẽ đường nối
        this.gl.gl.uniform4f(this.gl.colorUniformLocation, 0.7, 0.7, 0.7, 1);
        this.gl.gl.drawArrays(this.gl.gl.LINE_STRIP, 0, controlPoints.length);
    }
    
    draw() {
        const controlPoints = this.parseControlPoints();
        if (controlPoints.length < 2) {
            alert('Cần ít nhất 2 điểm điều khiển');
            return;
        }
        
        const bezierData = this.createBezierData(controlPoints);
        
        this.gl.clear();
        this.gl.setTransformMatrix(this.axesMax);
        this.gl.drawAxes(this.axesMin, this.axesMax);
        
        // Vẽ đường cong Bezier
        this.gl.gl.bufferData(this.gl.gl.ARRAY_BUFFER, bezierData, this.gl.gl.STATIC_DRAW);
        this.gl.gl.uniform4f(this.gl.colorUniformLocation, 0, 0.8, 0, 1);
        this.gl.gl.drawArrays(this.gl.gl.LINE_STRIP, 0, bezierData.length / 2);
        
        // Vẽ điểm điều khiển
        this.drawControlPoints(controlPoints);
    }
}