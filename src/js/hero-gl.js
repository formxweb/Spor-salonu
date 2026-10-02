import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './utils.js';

/*
 * Hero arka planı için hafif bir WebGL katmanı (kütüphanesiz).
 * - İmleç çevresinde dalgalı kırılma + renk ayrışması (chromatic aberration)
 * - Kırmızı neonların "nefes alması", çapraz ışık süpürmesi, film greni
 * - Kaydırdıkça yakınlaşma ve kararma
 * WebGL yoksa veya "hareketi azalt" açıksa CSS'teki <img> görünür kalır.
 */

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

export function initHeroGL({ hero, src }) {
  const api = { reveal() {} };
  if (!hero || prefersReducedMotion) return api;

  const canvas = hero.querySelector('.hero__canvas');
  const gl = canvas?.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
  if (!gl) return api;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return api;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return api;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = Object.fromEntries(
    ['uTex', 'uRes', 'uImg', 'uMouse', 'uTime', 'uVel', 'uScroll', 'uReveal'].map((name) => [
      name,
      gl.getUniformLocation(program, name),
    ]),
  );

  const state = {
    ready: false,
    visible: true,
    revealRequested: false,
    reveal: 0,
    scroll: 0,
    vel: 0,
    mouse: { x: 0.5, y: 0.5 },
    target: { x: 0.5, y: 0.5 },
    lastMove: -Infinity,
    img: { w: 1920, h: 1080 },
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  const startReveal = () => {
    gsap.to(state, { reveal: 1, duration: 2.4, ease: 'power3.out' });
  };

  api.reveal = () => {
    state.revealRequested = true;
    if (state.ready) startReveal();
  };

  // Görsel: küçük ekranlarda daha hafif sürüm.
  const image = new Image();
  image.decoding = 'async';
  image.src = window.innerWidth <= 1000 && src.small ? src.small : src.large;
  image
    .decode()
    .then(() => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.uniform1i(u.uTex, 0);
      state.img = { w: image.naturalWidth, h: image.naturalHeight };
      state.ready = true;
      hero.classList.add('is-gl');
      if (state.revealRequested) startReveal();
    })
    .catch(() => {});

  // İmleç takibi
  let lastX = 0;
  let lastY = 0;
  hero.addEventListener('pointermove', (e) => {
    const rect = hero.getBoundingClientRect();
    state.target.x = (e.clientX - rect.left) / rect.width;
    state.target.y = 1 - (e.clientY - rect.top) / rect.height;
    const speed = Math.hypot(e.clientX - lastX, e.clientY - lastY);
    state.vel = Math.min(1, state.vel + speed / 260);
    lastX = e.clientX;
    lastY = e.clientY;
    state.lastMove = performance.now();
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

  const start = performance.now();
  const frame = (now) => {
    requestAnimationFrame(frame);
    if (!state.ready || !state.visible || document.hidden) return;

    const t = (now - start) / 1000;

    // Fare hareketsizse odak noktası yavaşça kendi kendine gezinir (mobil dahil).
    if (now - state.lastMove > 2500) {
      state.target.x = 0.5 + Math.sin(t * 0.27) * 0.22;
      state.target.y = 0.55 + Math.cos(t * 0.35) * 0.14;
    }

    state.mouse.x += (state.target.x - state.mouse.x) * 0.06;
    state.mouse.y += (state.target.y - state.mouse.y) * 0.06;
    state.vel *= 0.94;

    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    gl.uniform2f(u.uImg, state.img.w, state.img.h);
    gl.uniform2f(u.uMouse, state.mouse.x, state.mouse.y);
    gl.uniform1f(u.uTime, t);
    gl.uniform1f(u.uVel, state.vel);
    gl.uniform1f(u.uScroll, state.scroll);
    gl.uniform1f(u.uReveal, state.reveal);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };
  requestAnimationFrame(frame);

  return api;
}
