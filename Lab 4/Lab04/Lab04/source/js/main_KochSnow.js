class KochSnowflakeApp {
    /**
     * Constructor của class KochSnowflakeApp.
     * @param {string} canvasId - ID của phần tử canvas trong DOM.
     */
    constructor(canvasId) {
        // Lấy tham chiếu đến các phần tử DOM dựa trên ID
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext('webgl'); // Lấy ngữ cảnh WebGL từ canvas
        this.iterationSlider = document.getElementById('iteration-slider');
        this.iterationValueDisplay = document.getElementById('iteration-value');
        this.resetButton = document.getElementById('reset-button');
        this.messageBox = document.getElementById('message-box');

        // Khởi tạo trạng thái của ứng dụng
        this.currentIteration = parseInt(this.iterationSlider.value); // Lấy giá trị ban đầu của cấp độ lặp từ thanh trượt
        this.points = []; // Mảng lưu trữ các đỉnh của bông tuyết Koch
        this.positionBuffer = null; // Buffer WebGL để lưu trữ vị trí các đỉnh
        this.program = null; // Chương trình shader WebGL
        this.positionAttributeLocation = null; // Vị trí của thuộc tính (attribute) vị trí đỉnh trong shader
        this.colorUniformLocation = null; // Vị trí của biến uniform màu trong shader
        this.kochColor = [1.0, 0.0, 0.0, 1.0]; // Màu đỏ (R, G, B, Alpha) để vẽ bông tuyết

        // Kiểm tra xem WebGL có được hỗ trợ hay không
        if (!this.gl) {
            this.messageBox.textContent = 'Trình duyệt của bạn không hỗ trợ WebGL.';
            throw new Error('WebGL không được hỗ trợ');
        }

        // Gọi các phương thức khởi tạo và thiết lập ban đầu
        this.init();
        this.resizeCanvas();

        // Gắn các trình xử lý sự kiện
        window.addEventListener('resize', this.resizeCanvas.bind(this)); // Cập nhật kích thước canvas khi cửa sổ thay đổi
        this.iterationSlider.addEventListener('input', this.handleIterationChange.bind(this)); // Xử lý khi giá trị thanh trượt thay đổi
        this.resetButton.addEventListener('click', this.reset.bind(this)); // Xử lý khi nút reset được click
    }

    /**
     * Phương thức khởi tạo WebGL, tạo shader, chương trình và buffer ban đầu.
     */
    init() {
        // Nguồn của vertex shader (chương trình đổ bóng đỉnh)
        const vertexShaderSource = `
            attribute vec4 aVertexPosition; // Thuộc tính nhận vị trí của mỗi đỉnh

            void main() {
                gl_Position = aVertexPosition; // Gán vị trí đỉnh cho đầu ra của shader
            }
        `;

        // Nguồn của fragment shader (chương trình đổ bóng màu)
        const fragmentShaderSource = `
            precision mediump float; // Độ chính xác số thực trung bình
            uniform vec4 uColor; // Biến uniform nhận màu để vẽ

            void main() {
                gl_FragColor = uColor; // Gán màu cho mỗi fragment (pixel)
            }
        `;

        // Tạo và biên dịch các shader
        const vertexShader = this.createShader(this.gl, this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        // Tạo chương trình shader và liên kết các shader đã biên dịch
        this.program = this.createProgram(this.gl, vertexShader, fragmentShader);

        // Lấy vị trí của các thuộc tính và uniform trong chương trình shader
        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, 'aVertexPosition');
        this.colorUniformLocation = this.gl.getUniformLocation(this.program, 'uColor');

        // Sử dụng chương trình shader đã tạo
        this.gl.useProgram(this.program);

        // Thiết lập giá trị cho uniform màu
        this.gl.uniform4fv(this.colorUniformLocation, this.kochColor);

        // Tạo buffer để lưu trữ dữ liệu vị trí đỉnh
        this.positionBuffer = this.gl.createBuffer();

        // Vẽ bông tuyết Koch ban đầu
        this.drawKochSnowflake();
    }

    /**
     * Phương thức điều chỉnh kích thước canvas và viewport WebGL cho phù hợp với kích thước cửa sổ.
     */
    resizeCanvas() {
        const size = Math.min(window.innerWidth, window.innerHeight) * 0.8; // Tính kích thước dựa trên kích thước cửa sổ (tối đa 80%)
        this.canvas.width = size;
        this.canvas.height = size;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height); // Thiết lập viewport WebGL
        this.drawKochSnowflake(); // Vẽ lại bông tuyết khi kích thước thay đổi
    }

    /**
     * Hàm tiện ích để tạo và biên dịch một shader WebGL.
     * @param {WebGLRenderingContext} gl - Ngữ cảnh WebGL.
     * @param {number} type - Loại shader (gl.VERTEX_SHADER hoặc gl.FRAGMENT_SHADER).
     * @param {string} source - Mã nguồn của shader.
     * @returns {WebGLShader} Shader đã được biên dịch.
     * @throws {Error} Nếu quá trình biên dịch shader thất bại.
     */
    createShader(gl, type, source) {
        const shader = gl.createShader(type); // Tạo một shader mới
        gl.shaderSource(shader, source); // Gán mã nguồn cho shader
        gl.compileShader(shader); // Biên dịch shader

        // Kiểm tra trạng thái biên dịch
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const message = `Lỗi shader: ${gl.getShaderInfoLog(shader)}`;
            this.messageBox.textContent = message;
            gl.deleteShader(shader); // Xóa shader nếu biên dịch thất bại
            throw new Error(message);
        }
        return shader; // Trả về shader đã biên dịch thành công
    }

    /**
     * Hàm tiện ích để tạo một chương trình shader WebGL và liên kết các shader.
     * @param {WebGLRenderingContext} gl - Ngữ cảnh WebGL.
     * @param {WebGLShader} vertexShader - Vertex shader đã biên dịch.
     * @param {WebGLShader} fragmentShader - Fragment shader đã biên dịch.
     * @returns {WebGLProgram} Chương trình shader đã được liên kết.
     * @throws {Error} Nếu quá trình liên kết chương trình thất bại.
     */
    createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram(); // Tạo một chương trình shader mới
        gl.attachShader(program, vertexShader); // Gắn vertex shader vào chương trình
        gl.attachShader(program, fragmentShader); // Gắn fragment shader vào chương trình
        gl.linkProgram(program); // Liên kết các shader trong chương trình

        // Kiểm tra trạng thái liên kết
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const message = `Lỗi chương trình: ${gl.getProgramInfoLog(program)}`;
            this.messageBox.textContent = message;
            gl.deleteProgram(program); // Xóa chương trình nếu liên kết thất bại
            throw new Error(message);
        }
        return program; // Trả về chương trình shader đã liên kết thành công
    }

    /**
     * Tính toán các điểm của một đoạn đường cong Koch đệ quy.
     * @param {number[]} start - Điểm bắt đầu của đoạn thẳng [x, y].
     * @param {number[]} end - Điểm kết thúc của đoạn thẳng [x, y].
     * @param {number} iteration - Cấp độ lặp (số lần chia nhỏ và tạo hình).
     * @returns {number[][]} Mảng các điểm tạo nên đường cong Koch.
     */
    kochCurve(start, end, iteration) {
        if (iteration === 0) {
            return [start, end]; // Trường hợp cơ sở: trả về đoạn thẳng ban đầu
        }

        // Tính toán các điểm chia trên đoạn thẳng
        const dx = end[0] - start[0];
        const dy = end[1] - start[1];

        const p1 = [start[0] + dx / 3, start[1] + dy / 3]; // Điểm 1/3
        const p3 = [end[0] - dx / 3, end[1] - dy / 3]; // Điểm 2/3
        const p2 = [ // Điểm tạo đỉnh tam giác đều ở giữa
            p1[0] + (dx / 6) + (Math.sqrt(3) / 6) * dy,
            p1[1] + (dy / 6) - (Math.sqrt(3) / 6) * dx
        ];

        // Gọi đệ quy cho 4 đoạn thẳng mới
        const segment1 = this.kochCurve(start, p1, iteration - 1);
        const segment2 = this.kochCurve(p1, p2, iteration - 1);
        const segment3 = this.kochCurve(p2, p3, iteration - 1);
        const segment4 = this.kochCurve(p3, end, iteration - 1);

        // Kết hợp các điểm của 4 đoạn thẳng (loại bỏ điểm cuối trùng lặp)
        return [...segment1.slice(0, -1), ...segment2.slice(0, -1), ...segment3.slice(0, -1), ...segment4];
    }

    /**
     * Tính toán các điểm tạo nên hình bông tuyết Koch bằng cách áp dụng đường cong Koch cho ba cạnh của một tam giác đều.
     * @param {number} iteration - Cấp độ lặp.
     * @returns {number[][]} Mảng các điểm của bông tuyết Koch.
     */
    kochSnowflake(iteration) {
        const radius = 0.5; // Bán kính đường tròn ngoại tiếp tam giác đều
    
        // Sử dụng góc để định vị các đỉnh của tam giác đều
        const angleTop = Math.PI / 2;             // 90 độ (đỉnh trên)
        const angleBottomRight = angleTop + 2 * Math.PI / 3; // 90 + 120 = 210 độ
        const angleBottomLeft = angleTop - 2 * Math.PI / 3;  // 90 - 120 = -30 độ (hoặc +240 = 330 độ)
    
        const points = [
            [radius * Math.cos(angleTop), radius * Math.sin(angleTop)],         // Đỉnh trên
            [radius * Math.cos(angleBottomRight), radius * Math.sin(angleBottomRight)], // Đỉnh dưới bên phải
            [radius * Math.cos(angleBottomLeft), radius * Math.sin(angleBottomLeft)]   // Đỉnh dưới bên trái
        ];
    
        let snowflakePoints = [];
        snowflakePoints = snowflakePoints.concat(this.kochCurve(points[0], points[1], iteration).slice(0, -1));
        snowflakePoints = snowflakePoints.concat(this.kochCurve(points[1], points[2], iteration).slice(0, -1));
        snowflakePoints = snowflakePoints.concat(this.kochCurve(points[2], points[0], iteration));
    
        return snowflakePoints;
    }

    /**
     * Vẽ bông tuyết Koch lên canvas WebGL.
     */
    drawKochSnowflake() {
        // Tính toán các điểm dựa trên cấp độ lặp hiện tại
        this.points = this.kochSnowflake(this.currentIteration);
        const positionData = new Float32Array(this.points.flat()); // Chuyển mảng 2D thành mảng 1D kiểu Float32Array

        // Gán dữ liệu vị trí vào buffer WebGL
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positionData, this.gl.STATIC_DRAW); // STATIC_DRAW vì dữ liệu không thay đổi thường xuyên

        // Bật thuộc tính vị trí đỉnh
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);

        // Thiết lập cách WebGL đọc dữ liệu vị trí từ buffer
        this.gl.vertexAttribPointer(
            this.positionAttributeLocation, // Vị trí thuộc tính
            2,                             // Số lượng giá trị trên mỗi đỉnh (x, y)
            this.gl.FLOAT,                  // Kiểu dữ liệu
            false,                          // Không cần chuẩn hóa
            0,                              // Kích thước bước (0 vì dữ liệu liền kề)
            0                               // Offset từ đầu buffer
        );

        // Xóa canvas với màu trắng
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // Vẽ các đường thẳng liên tiếp từ các điểm đã tính toán
        this.gl.drawArrays(this.gl.LINE_STRIP, 0, this.points.length);

        // Cập nhật thông báo hiển thị cấp độ và số điểm
        this.messageBox.textContent = `Đã vẽ bông tuyết Koch với cấp độ ${this.currentIteration}. Số điểm: ${this.points.length}`;
    }

    /**
     * Xử lý sự kiện khi giá trị của thanh trượt cấp độ thay đổi.
     */
    handleIterationChange() {
        this.currentIteration = parseInt(this.iterationSlider.value); // Lấy giá trị mới từ thanh trượt
        this.iterationValueDisplay.textContent = this.currentIteration; // Cập nhật hiển thị giá trị cấp độ
        this.drawKochSnowflake(); // Vẽ lại bông tuyết với cấp độ mới
    }

    /**
     * Xử lý sự kiện khi nút reset được click, đặt cấp độ về 0.
     */
    reset() {
        this.iterationSlider.value = 0; // Đặt giá trị thanh trượt về 0
        this.currentIteration = 0; // Đặt cấp độ hiện tại về 0
        this.iterationValueDisplay.textContent = this.currentIteration; // Cập nhật hiển thị giá trị cấp độ
        this.drawKochSnowflake(); // Vẽ lại bông tuyết ở cấp độ 0
        this.messageBox.textContent = 'Đã reset về cấp độ 0.'; // Cập nhật thông báo
    }
}

// Khởi tạo ứng dụng khi toàn bộ DOM đã được tải
document.addEventListener('DOMContentLoaded', () => {
    new KochSnowflakeApp('kochCanvas'); // Tạo một instance mới của class KochSnowflakeApp, truyền ID của canvas
});