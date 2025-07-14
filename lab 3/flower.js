class FlowerMode {
    constructor(sharedGL, petalInput) {
        this.gl = sharedGL;
        this.petalInput = petalInput;
        this.axesMin = -1.5;
        this.axesMax = 1.5;
    }

    // Tạo dữ liệu cho 1 cánh hoa
    createSinglePetal(segments = 100) {
        const data = [];
        const step = (2 * Math.PI) / segments;
        
        for (let i = 0; i <= segments; i++) {
            const t = i * step;
            // Phương trình tham số cho 1 cánh hoa
            const x = Math.cos(5 * t) * Math.cos(t);
            const y = Math.cos(5 * t) * Math.sin(t);
            data.push(x, y);
        }
        
        return new Float32Array(data);
    }

    // Tạo dữ liệu cho toàn bộ bông hoa với n cánh
    createFlowerData(petalCount, segments = 100) {
        const data = [];
        
        // Nếu chỉ 1 cánh thì không cần xoay
        if (petalCount === 1) {
            return this.createSinglePetal(segments);
        }
        
        // Tạo từng cánh hoa với góc xoay tương ứng
        const angleStep = (2 * Math.PI) / petalCount;
        const singlePetal = this.createSinglePetal(segments);
        
        for (let p = 0; p < petalCount; p++) {
            const angle = p * angleStep;
            
            for (let i = 0; i < singlePetal.length; i += 2) {
                const x = singlePetal[i];
                const y = singlePetal[i+1];
                // Xoay điểm theo góc
                const rotatedX = x * Math.cos(angle) - y * Math.sin(angle);
                const rotatedY = x * Math.sin(angle) + y * Math.cos(angle);
                data.push(rotatedX, rotatedY);
            }
        }
        
        return new Float32Array(data);
    }

    draw() {
        const petalCount = parseInt(this.petalInput.value) || 5;
        
        if (petalCount < 1 || petalCount > 20) {
            alert('Số cánh hoa phải từ 1 đến 20');
            return;
        }

        const flowerData = this.createFlowerData(petalCount);
        
        // Xóa canvas và thiết lập lại WebGL state
        this.gl.gl.clearColor(1, 1, 1, 1);
        this.gl.gl.clear(this.gl.gl.COLOR_BUFFER_BIT);
        
        // Thiết lập ma trận biến đổi
        this.gl.setTransformMatrix(this.axesMax);
        
        // Vẽ trục tọa độ
        this.gl.drawAxes(this.axesMin, this.axesMax);
        
        // Vẽ bông hoa
        this.gl.gl.bufferData(this.gl.gl.ARRAY_BUFFER, flowerData, this.gl.gl.STATIC_DRAW);
        this.gl.gl.uniform4f(this.gl.colorUniformLocation, 0.8, 0.2, 0.5, 1); // Màu hồng
        this.gl.gl.drawArrays(this.gl.gl.LINE_STRIP, 0, flowerData.length / 2);
    }
}