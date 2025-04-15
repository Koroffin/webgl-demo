import "./style.css";

const vertexShaderSource = `#version 300 es
precision mediump float;

in vec2 position;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

out vec4 color;

void main() {
    color = vec4(1.0, 0.0, 0.0, 1.0);
}`;

const main = () => {
    const canvas = document.getElementById("mainCanvas");

    if (!canvas) {
        throw new Error("Canvas not found");
    }

    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error("Canvas is not an HTMLCanvasElement");
    }

    const gl = canvas.getContext("webgl2");

    if (!gl) {
        throw new Error("WebGL2 is not supported");
    }

    const vertices = [
        0.5, 0.0,
        -0.5, -0.5,
        0.5, -0.5
    ];
    const verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) {
        throw new Error("Shaders cannot be created");
    }

    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.shaderSource(fragmentShader, fragmentShaderSource);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw new Error(`${gl.getShaderInfoLog(vertexShader)}`);
    }
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw new Error(`${gl.getShaderInfoLog(fragmentShader)}`);
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(`${gl.getProgramInfoLog(program)}`);
    }

    const positionLocation = gl.getAttribLocation(program, "position");
    if (positionLocation < 0) {
        throw new Error("position attribute not found");
    }

    const draw = () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.useProgram(program);
        gl.enableVertexAttribArray(positionLocation);

        gl.vertexAttribPointer(
            positionLocation,
            2,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    draw();
}

main();