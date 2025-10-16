import Texture from './texture.js';

const vertex = /* glsl */`
  attribute vec3 position;
  void main() { gl_Position = vec4(position, 1.0); }
`
const fragment = /* glsl */`
  precision highp float;
  uniform vec2 resolution;
  uniform float time;

  void main() {
    vec2 st = gl_FragCoord.xy / resolution.xy;
    st.x *= resolution.x / resolution.y;
    gl_FragColor = vec4(st, 0.5 + 0.5 * sin(time), 1.0);
  }
`

export default class {

  constructor(options) {

    const canvas = options.canvas || document.createElement('canvas');
    const gl = canvas.getContext('webgl');

    const program = createProgram(gl,
      createShader(gl, gl.VERTEX_SHADER, options.vertex || vertex),
      createShader(gl, gl.FRAGMENT_SHADER, options.fragment || fragment)
    );

    const position = {};
    position.location = gl.getAttribLocation(program, 'position');
    position.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, position.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 4, 4, -1]), gl.STATIC_DRAW);

    this.uniforms = Object.assign({
      resolution: {
        type: 'vec2',
        value: [1, 1]
      },
      time: {
        type: 'float',
        value: 0
      },
    }, options.uniforms || {});

    for (let key in this.uniforms) {

      let uniform = this.uniforms[key];
      uniform._type = getUniformType(uniform.type);
      uniform._location = gl.getUniformLocation(program, key);
      uniform._isMatrix = uniform._type.includes('Matrix');

      if (uniform.value instanceof Image || uniform.value instanceof HTMLCanvasElement) {
        uniform._isImage = true;
        uniform._value = new Texture(gl, uniform.value, uniform.wrapS, uniform.wrapT, uniform.filter, uniform.flipY);
        uniform.update = () => uniform._value.update();
      }
    }

    this.gl = gl;
    this.program = program;
    this.position = position;
    this.raf = undefined;
    this.dpr = options.dpr || 1;
    this.update = this.update.bind(this);
    this.render = options.render?.bind(this);
  }

  resize(width, height) {
    width ??= window.innerWidth
    height ??= window.innerHeight;

    const gl = this.gl;
    const scaledWidth = Math.floor(width * this.dpr);
    const scaledHeight = Math.floor(height * this.dpr);

    gl.canvas.width = scaledWidth;
    gl.canvas.height = scaledHeight;
    gl.canvas.style.width = `${width}px`;
    gl.canvas.style.height = `${height}px`;
    gl.viewport(0, 0, scaledWidth, scaledHeight);

    this.uniforms.resolution.value[0] = scaledWidth;
    this.uniforms.resolution.value[1] = scaledHeight;
  }

  start() {
    this.raf ??= requestAnimationFrame(this.update);
  }

  stop() {
    this.raf = cancelAnimationFrame(this.raf);
  }

  update(time) {
    this.raf = requestAnimationFrame(this.update);
    const gl = this.gl;
    let textureID = 0

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.enableVertexAttribArray(this.position.location);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.position.buffer);
    gl.vertexAttribPointer(this.position.location, 2, gl.FLOAT, false, 0, 0);

    this.uniforms.time.value = time / 1000;
    this.render?.(this.uniforms.time.value);

    const n = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {

      let name = gl.getActiveUniform(this.program, i).name;
      let uniform = this.uniforms[name];

      if (uniform._isImage) {
        gl.uniform1i(uniform._location, textureID);
        gl.activeTexture(gl.TEXTURE0 + textureID);
        gl.bindTexture(gl.TEXTURE_2D, uniform._value.texture);
        textureID++;
      } else if (uniform._isMatrix) {
        gl[uniform._type](uniform._location, false, uniform.value);
      } else {
        gl[uniform._type](uniform._location, uniform.value);
      }
    }

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  destroy() {
    this.stop();

    const gl = this.gl;
    const n = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);

    for (let i = 0; i < n; i++) {
      let name = gl.getActiveUniform(this.program, i).name;
      let uniform = this.uniforms[name];
      if (uniform._isImage) uniform._value.destroy();
    }

    gl.deleteBuffer(this.position.buffer);
    gl.deleteProgram(this.program);
    gl.canvas.remove();
  }
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) return shader;

  console.error(`[Shader] ${type} shader error: ${gl.getShaderInfoLog(shader)}`);
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) return program;

  console.error(`[Shader] program error: ${gl.getProgramInfoLog(program)}`);
  gl.deleteProgram(program);
}

function getUniformType(type) {
  switch (type) {
    case 'int':
    case 'sampler2D':
      return 'uniform1i';
    case 'float':
      return 'uniform1f';
    case 'mat2':
    case 'mat3':
    case 'mat4':
      let mat = type.charAt(3);
      return `uniformMatrix${mat}fv`;
    case 'vec2':
    case 'vec3':
    case 'vec4':
      let vec = type.charAt(3);
      return `uniform${vec}fv`;
    default:
      console.warn(`[Shader] unknown uniform type: ${type}`);
      return;
  }
}
