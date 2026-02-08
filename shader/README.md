# Shader

A lightweight WebGL shader class, inspired by [standalone-shader](https://github.com/ayamflow/standalone-shader).

```bash
npm install @tmbr/shader
```

## Options

| Option     | Type                | Description
| ---------- | ------------------- | ------------------------------
| `canvas`   | `HTMLCanvasElement` | Canvas element to render to (defaults to creating one)
| `vertex`   | `string`            | Vertex shader GLSL source (defaults to fullscreen triangle)
| `fragment` | `string`            | Fragment shader GLSL source (defaults to an animated gradient)
| `dpr`      | `number`            | Device pixel ratio (defaults to 1)
| `render`   | `function`          | Callback invoked on each frame with `time` in seconds, bound to shader instance
| `uniforms` | `object`            | Custom uniform definitions (see below)

### Uniforms

Each uniform is defined with a `type` and `value`. The `resolution` (`vec2`) and `time` (`float`) uniforms are provided by default and can be overridden.

| Type                   | Value
| ---------------------- | ------------------------------
| `int`                  | `number`
| `float`                | `number`
| `vec2`, `vec3`, `vec4` | `number[]`
| `mat2`, `mat3`, `mat4` | `number[]`
| `sampler2D`            | `Image` or `HTMLCanvasElement`

`sampler2D` texture uniforms support additional options:

| Option   | Values                      | Default
| -------- | --------------------------- | -------------
| `wrapS`  | `clamp`, `mirror`, `repeat` | `clamp`
| `wrapT`  | `clamp`, `mirror`, `repeat` | `clamp`
| `filter` | `nearest`, `linear`         | `linear`
| `flipY`  | `boolean`                   | `false`

## Methods

| Method                  | Description
| ----------------------- | -------------------------------------------------------
| `resize(width, height)` | Resize the canvas (defaults to window width and height)
| `start()`               | Start the render loop
| `stop()`                | Stop the render loop
| `destroy()`             | Stop rendering and clean up all WebGL resources

## Examples

```js
import Shader from '@tmbr/shader';

const shader = new Shader({
  canvas: document.getElementById('canvas'),
  uniforms: {
    speed: {type: 'float', value: 2.0}
  },
  fragment: `
  precision highp float;
  uniform vec2 resolution;
  uniform float time;
  uniform float speed;

  void main() {
    vec2 st = gl_FragCoord.xy / resolution.xy;
    gl_FragColor = vec4(st, 0.5 + 0.5 * sin(time * speed), 1.0);
  }`
});

shader.resize();
shader.start();
```

```js
// image texture
const image = new Image();
image.src = './texture.jpg';

const shader = new Shader({
  canvas: document.querySelector('canvas'),
  dpr: Math.min(window.devicePixelRatio, 2),
  uniforms: {
    img: {
      type: 'sampler2D',
      value: image,
      flipY: true
    }
  },
  fragment: `
  precision highp float;
  uniform vec2 resolution;
  uniform float time;
  uniform sampler2D img;

  void main() {
    vec2 st = gl_FragCoord.xy / resolution.xy;
    st.x += 0.05 * sin(10.0 * st.y + time * 2.0);
    gl_FragColor = texture2D(img, st);
  }`
});

shader.resize(400, 400);
shader.start();
```
