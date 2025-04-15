import "./style.css";

const vertexShaderSource = `#version 300 es
precision mediump float;

in vec2 position;
in vec3 color;

uniform vec2 u_offset;

out vec3 frag_color;

void main() {
    vec2 realPosition = position + u_offset;
    gl_Position = vec4(realPosition, 0.0, 1.0);
    frag_color = color;
}`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

in vec3 frag_color;

out vec4 color;

void main() {
    color = vec4(frag_color, 1.0);
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
        0.0, 0.5,
        -0.5, -0.5,
        0.5, -0.5
    ];
    const verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const colors = [
        255, 0, 0,
        0, 255, 0,
        0, 0, 255,
    ];
    const colorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(colors), gl.STATIC_DRAW);

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

    const colorLocation = gl.getAttribLocation(program, "color");
    if (colorLocation < 0) {
        throw new Error("color attribute not found");
    }

    const offsetLocation = gl.getUniformLocation(program, "u_offset");
    if (!offsetLocation) {
        throw new Error("offset uniform not found");
    }

    const draw = () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.useProgram(program);

        gl.uniform2fv(offsetLocation, [ 0.5, 0.0 ]);

        gl.enableVertexAttribArray(positionLocation);
        gl.enableVertexAttribArray(colorLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
        gl.vertexAttribPointer(
            positionLocation,
            2,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
        gl.vertexAttribPointer(
            colorLocation,
            3,
            gl.UNSIGNED_BYTE,
            true,
            0,
            0,
        );

        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    draw();
}

main();