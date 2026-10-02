import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, prefersReducedMotion } from '../lib/dom.js';

// Full-screen shader over the hero photo: cursor ripple, chromatic aberration,
// pulsing neon and grain. Without WebGL (or with reduced motion) the plain <img> stays.

const VERT = /* glsl */ `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;

uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uImg;
uniform vec2 uMouse;
uniform float uTime;
uniform float uVel;
uniform float uScroll;
uniform float uReveal;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec2 cover(vec2 uv) {
  float rs = uRes.x / uRes.y;
  float ri = uImg.x / uImg.y;
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;

  float zoom = mix(1.32, 1.07, uReveal) + uScroll * 0.2;
  vec2 st = (cover(uv) - 0.5) / zoom + 0.5;
  st += (uMouse - 0.5) * vec2(-0.022, -0.016);

  vec2 p = vec2(uv.x * aspect, uv.y);
  vec2 m = vec2(uMouse.x * aspect, uMouse.y);
  float d = distance(p, m);
  float falloff = smoothstep(0.42, 0.0, d);
  vec2 dir = normalize(p - m + 0.0001);
  float wave = sin(d * 26.0 - uTime * 3.2) * 0.5 + 0.5;
  vec2 disp = dir * falloff * (0.006 + 0.035 * uVel) * wave;
  disp.x /= aspect;
  st -= disp;

  float ca = 0.0016 + falloff * uVel * 0.014 + uScroll * 0.012;
  vec2 caOff = (uv - 0.5) * ca + disp * 0.6;
  vec3 col;
  col.r = texture2D(uTex, st + caOff).r;
  col.g = texture2D(uTex, st).g;
  col.b = texture2D(uTex, st - caOff).b;

  float redness = clamp(col.r - max(col.g, col.b), 0.0, 1.0);
  col += vec3(1.0, 0.04, 0.04) * redness * (0.22 + 0.18 * sin(uTime * 1.4));

  float band = abs(fract((uv.x + uv.y * 0.55) * 0.5 - uTime * 0.035) - 0.5);
  col += vec3(1.0, 0.25, 0.25) * smoothstep(0.07, 0.0, band) * 0.045;

  col += vec3(0.9, 0.04, 0.04) * falloff * (0.06 + uVel * 0.12);

  float vig = smoothstep(1.3, 0.2, length((uv - 0.5) * vec2(aspect * 0.75, 1.0)));
  col *= mix(0.42, 1.0, vig);

  col += (hash(uv * uRes + fract(uTime * 7.0) * 91.0) - 0.5) * 0.045;
  col *= uReveal * (1.0 - uScroll * 0.6);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('[hero-gl]', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function initHeroGL(hero) {
  const fallback = { reveal() {} };
  if (prefersReducedMotion) return fallback;

  const canvas = $('.hero__canvas', hero);
  const photo = $('.hero__img', hero);
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
  if (!gl) return fallback;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return fallback;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return fallback;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uniforms = Object.fromEntries(
    ['uTex', 'uRes', 'uImg', 'uMouse', 'uTime', 'uVel', 'uScroll', 'uReveal'].map((name) => [
      name,
      gl.getUniformLocation(program, name),
    ]),
  );

  const state = {
    ready: false,
    visible: true,
    revealQueued: false,
    reveal: 0,
    scroll: 0,
    velocity: 0,
    pointer: { x: 0.5, y: 0.5 },
    target: { x: 0.5, y: 0.5 },
    lastPointerMove: -Infinity,
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    gl.uniform2f(uniforms.uRes, width, height);
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  const fadeIn = () => gsap.to(state, { reveal: 1, duration: 2.4, ease: 'power3.out' });

  photo
    .decode()
    .then(() => {
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, photo);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.uniform1i(uniforms.uTex, 0);
      gl.uniform2f(uniforms.uImg, photo.naturalWidth, photo.naturalHeight);

      state.ready = true;
      hero.classList.add('is-gl');
      if (state.revealQueued) fadeIn();
    })
    .catch(() => {});

  let lastX = 0;
  let lastY = 0;
  hero.addEventListener('pointermove', ({ clientX, clientY }) => {
    const rect = hero.getBoundingClientRect();
    state.target.x = (clientX - rect.left) / rect.width;
    state.target.y = 1 - (clientY - rect.top) / rect.height;
    state.velocity = Math.min(1, state.velocity + Math.hypot(clientX - lastX, clientY - lastY) / 260);
    state.lastPointerMove = performance.now();
    lastX = clientX;
    lastY = clientY;
  });

  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    onUpdate: (self) => {
      state.scroll = self.progress;
    },
  });

  new IntersectionObserver(([entry]) => {
    state.visible = entry.isIntersecting;
  }).observe(hero);

  const startTime = performance.now();
  const render = (now) => {
    requestAnimationFrame(render);
    if (!state.ready || !state.visible || document.hidden) return;

    const time = (now - startTime) / 1000;

    // Idle drift keeps the effect alive on touch screens and when the pointer rests.
    if (now - state.lastPointerMove > 2500) {
      state.target.x = 0.5 + Math.sin(time * 0.27) * 0.22;
      state.target.y = 0.55 + Math.cos(time * 0.35) * 0.14;
    }

    state.pointer.x += (state.target.x - state.pointer.x) * 0.06;
    state.pointer.y += (state.target.y - state.pointer.y) * 0.06;
    state.velocity *= 0.94;

    gl.uniform2f(uniforms.uMouse, state.pointer.x, state.pointer.y);
    gl.uniform1f(uniforms.uTime, time);
    gl.uniform1f(uniforms.uVel, state.velocity);
    gl.uniform1f(uniforms.uScroll, state.scroll);
    gl.uniform1f(uniforms.uReveal, state.reveal);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };
  requestAnimationFrame(render);

  return {
    reveal() {
      state.revealQueued = true;
      if (state.ready) fadeIn();
    },
  };
}
