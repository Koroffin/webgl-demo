import "./style.css";
import { Slider } from "./slider";

const vertexShaderSourceCode = `#version 300 es
precision mediump float;

in vec2 vertexPosition;

void main () {
  gl_Position = vec4(vertexPosition, 0.0, 1.0);
}`;

const fragmentShaderSourceCode = `#version 300 es
precision mediump float;

out vec4 color;

void main () {
  color = vec4(1.0, 0.0, 0.0, 1.0);
}`;


const main = () => {
  const canvas = document.getElementById("mainCanvas");

  if (!canvas) {
    throw new Error("Canvas not found");
  }

  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("mainCanvas should be a canvas");
  }

  const gl = canvas.getContext("webgl2");

  if (!gl) {
    throw new Error("WebGL2 is not supported");
  }

  const coordsSlidersArray = [
    new Slider("X1", 0.0),
    new Slider("Y1", 0.5),
    new Slider("X2", -0.5),
    new Slider("Y2", -0.5),
    new Slider("X3", 0.5),
    new Slider("Y3", -0.5),
  ];

  let verticesBuffer: WebGLBuffer;
  let vertices: number[];
  const bindBuffer = () => {
    vertices = coordsSlidersArray.map(slider => slider.value);
    verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  }

  bindBuffer();

  coordsSlidersArray.forEach(slider => {
    slider.bind(() => {
      bindBuffer();
      draw();
    });
  });

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);

  if (!vertexShader) {
    throw new Error("Cannot create vertex shader");
  }

  gl.shaderSource(vertexShader, vertexShaderSourceCode);
  gl.compileShader(vertexShader);

  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    throw new Error(`Vertex shader compile error: ${gl.getShaderInfoLog(vertexShader)}`);
  }

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  if (!fragmentShader) {
    throw new Error("Cannot create fragment shader");
  }

  gl.shaderSource(fragmentShader, fragmentShaderSourceCode);
  gl.compileShader(fragmentShader);

  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    throw new Error(`Fragment shader compile error: ${gl.getShaderInfoLog(fragmentShader)}`);
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Cannot link the program: ${gl.getProgramInfoLog(program)}`);
  }

  const vertexPositionAttribLocation = gl.getAttribLocation(program, "vertexPosition");
  if (vertexPositionAttribLocation < 0) {
    throw new Error("vertexPosition attribute not found");
  }

  const viewportWidthSlider = new Slider("Viewport width", canvas.clientWidth, 100, canvas.clientWidth);
  const viewportHeightSlider = new Slider("Viewport height", canvas.clientHeight, 100, canvas.clientHeight);

  const draw = () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.viewport(0, 0, viewportWidthSlider.value, viewportHeightSlider.value);

    gl.useProgram(program);
    gl.enableVertexAttribArray(vertexPositionAttribLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.vertexAttribPointer(
      vertexPositionAttribLocation,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
  }

  viewportWidthSlider.bind(draw);
  viewportHeightSlider.bind(draw);

  draw();
}

main();