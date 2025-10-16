const CONSTANTS = {
  clamp   : 'CLAMP_TO_EDGE',
  mirror  : 'MIRRORED_REPEAT',
  repeat  : 'REPEAT',
  nearest : 'NEAREST',
  linear  : 'LINEAR',
};

export default class Texture {

  constructor(gl, image, wrapS, wrapT, filter, flipY) {
    const texture = gl.createTexture();

    this.gl = gl;
    this.texture = texture;
    this.image = image;
    this.flipY = flipY;
    this.wrapS = gl[CONSTANTS[wrapS]];
    this.wrapT = gl[CONSTANTS[wrapT]];
    this.filter = gl[CONSTANTS[filter]];

    if (image.complete && image.width && image.height || image instanceof Image === false) {
      this.update();
    } else {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
      image.addEventListener('load', () => this.update(), {once: true});
    }
  }

  update() {
    const gl = this.gl;
    const image = this.image;

    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    if (this.flipY === true) {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    }

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS || gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT || gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.filter || gl.LINEAR);
  }

  destroy() {
    this.update = noop => noop;
    this.image.removeEventListener('load', this.onLoad);
    this.gl.deleteTexture(this.texture);
  }
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}
