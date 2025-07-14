class HermitMode {
    constructor(sharedGL, hermitParamsTextarea) {
        this.gl = sharedGL;
        this.hermitParamsTextarea = hermitParamsTextarea;
        this.axesMin = -10;
        this.axesMax = 10;
    }

    // Tính điểm trên đường cong Hermit
    calculateHermitPoint(p0, t0, p1, t1, t) {
        const t2 = t * t;
        const t3 = t2 * t;
        
        // Các hệ số Hermit
        const h1 = 2*t3 - 3*t2 + 1;
        const h2 = -2*t3 + 3*t2;
        const h3 = t3 - 2*t2 + t;
        const h4 = t3 - t2;
        
        // Tính toán điểm
        const x = h1*p0[0] + h2*p1[0] + h3*t0[0] + h4*t1[0];
        const y = h1*p0[1] + h2*p1[1] + h3*t0[1] + h4*t1[1];
        
        return [x, y];
    }

    // Tạo dữ liệu đường cong Hermit
    createHermitData(params, segments = 100) {
        const data = [];
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const point = this.calculateHermitPoint(
                params.p0, 
                params.t0, 
                params.p1, 
                params.t1, 
                t
            );
            data.push(point[0], point[1]);
        }
        
        return new Float32Array(data);
    }

    // Phân tích tham số từ textarea
    parseHermitParams() {
        const text = this.hermitParamsTextarea.value.trim();
        if (!text) return null;
        
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 4) {
            alert('Cần nhập đủ 4 giá trị cho đường cong Hermit');
            return null;
        }
        
        try {
            const p0 = lines[0].split(',').map(Number);
            const t0 = lines[1].split(',').map(Number);
            const p1 = lines[2].split(',').map(Number);
            const t1 = lines[3].split(',').map(Number);
            
            if (p0.length !== 2 || t0.length !== 2 || p1.length !== 2 || t1.length !== 2) {
                throw new Error('Mỗi giá trị phải có 2 thành phần (x,y)');
            }
            
            return {
                p0: p0,
                t0: t0,
                p1: p1,
                t1: t1
            };
        } catch (e) {
            alert('Định dạng nhập liệu không đúng: ' + e.message);
            return null;
        }
    }

    // Vẽ các điểm và vector điều khiển
    drawControlElements(params) {
        const pointData = [params.p0[0], params.p0[1], params.p1[0], params.p1[1]];
        
        // Vẽ điểm đầu và cuối
        this.gl.gl.bufferData(this.gl.gl.ARRAY_BUFFER, new Float32Array(pointData), this.gl.gl.STATIC_DRAW);
        this.gl.gl.uniform4f(this.gl.colorUniformLocation, 0, 0, 1, 1); // Màu xanh dương
        this.gl.gl.drawArrays(this.gl.gl.POINTS, 0, 2);
        
        // Vẽ vector tiếp tuyến tại điểm đầu
        const t0Data = [
            params.p0[0], params.p0[1],
            params.p0[0] + params.t0[0], params.p0[1] + params.t0[1]
        ];
        this.gl.gl.bufferData(this.gl.gl.ARRAY_BUFFER, new Float32Array(t0Data), this.gl.gl.STATIC_DRAW);
        this.gl.gl.uniform4f(this.gl.colorUniformLocation, 1, 0, 0, 1); // Màu đỏ
        this.gl.gl.drawArrays(this.gl.gl.LINES, 0, 2);
        
        // Vẽ vector tiếp tuyến tại điểm cuối
        const t1Data = [
            params.p1[0], params.p1[1],
            params.p1[0] + params.t1[0], params.p1[1] + params.t1[1]
        ];
        this.gl.gl.bufferData(this.gl.gl.ARRAY_BUFFER, new Float32Array(t1Data), this.gl.gl.STATIC_DRAW);
        this.gl.gl.drawArrays(this.gl.gl.LINES, 0, 2);
    }

    // Vẽ đường cong Hermit
    draw() {
        const params = this.parseHermitParams();
        if (!params) return;
        
        const hermitData = this.createHermitData(params);
        
        // Xóa canvas và thiết lập lại WebGL state
        this.gl.gl.clearColor(1, 1, 1, 1);
        this.gl.gl.clear(this.gl.gl.COLOR_BUFFER_BIT);
        
        // Thiết lập ma trận biến đổi
        this.gl.setTransformMatrix(this.axesMax);
        
        // Vẽ trục tọa độ
        this.gl.drawAxes(this.axesMin, this.axesMax);
        
        // Vẽ đường cong Hermit
        this.gl.gl.bufferData(this.gl.gl.ARRAY_BUFFER, hermitData, this.gl.gl.STATIC_DRAW);
        this.gl.gl.uniform4f(this.gl.colorUniformLocation, 0.5, 0, 0.8, 1); // Màu tím
        this.gl.gl.drawArrays(this.gl.gl.LINE_STRIP, 0, hermitData.length / 2);
        
        // Vẽ các điểm và vector điều khiển
        this.drawControlElements(params);
    }
}