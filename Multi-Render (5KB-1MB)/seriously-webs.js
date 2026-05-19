/* global define, require */
(function (root, factory) {
 'use strict';
 if (typeof define === 'function' && define.amd) {
  define(['seriously'], factory);
 } else if (typeof exports === 'object') {
  factory(require('seriously'));
 } else {
  if (!root.Seriously) {
   root.Seriously = { plugin: function (name, opt) { this[name] = opt; } };
  }
  factory(root.Seriously);
 }
}(window, function (Seriously) {
 'use strict';

 var commonShaders = {
  fragment: {
   standard: 'precision mediump float;\nvarying vec2 vTexCoord;\nuniform sampler2D source;\n',
   dual: 'precision mediump float;\nvarying vec2 vTexCoord;\nuniform sampler2D source;\nuniform sampler2D source2;\n',
   triple: 'precision mediump float;\nvarying vec2 vTexCoord;\nuniform sampler2D source;\nuniform sampler2D source2;\nuniform sampler2D source3;\n'
  },
  vertex: {
   standard: 'precision mediump float;\nattribute vec4 position;\nattribute vec2 texCoord;\nuniform mat4 transform;\nvarying vec2 vTexCoord;\nvoid main(void) {\n gl_Position = transform * position;\n vTexCoord = vec2(texCoord.x, 1.0 - texCoord.y);\n}\n'
  }
 };

 Seriously.plugin('brightness-contrast', {
  commonShader: true,
  title: 'Brightness/Contrast',
  shader: function (inputs, w, h) {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float brightness;\nuniform float contrast;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n c.rgb += brightness;\n if (contrast > 0.0) c.rgb = (c.rgb - 0.5) / (1.0 - contrast) + 0.5;\n else c.rgb = (c.rgb - 0.5) * (1.0 + contrast) + 0.5;\n gl_FragColor = clamp(c, 0.0, 1.0);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   brightness: { type: 'number', uniform: 'brightness', defaultValue: 0, min: -1, max: 1 },
   contrast: { type: 'number', uniform: 'contrast', defaultValue: 0, min: -1, max: 1 }
  }
 });

 Seriously.plugin('hue-saturation', {
  commonShader: true,
  title: 'Hue/Saturation',
  shader: function (inputs, w, h) {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float hue;\nuniform float saturation;\nvec3 rgb2hsv(vec3 c) {\n vec4 K = vec4(0.0,-1.0/3.0,2.0/3.0,-1.0);\n vec4 p = mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g));\n vec4 q = mix(vec4(p.xyw,c.r),vec4(c.r,p.yzx),step(p.x,c.r));\n float d=q.x-min(q.w,q.y);\n float e=1.0e-10;\n return vec3(abs(q.z+(q.w-q.y)/(6.0*d+e)),d/(q.x+e),q.x);\n}\nvec3 hsv2rgb(vec3 c) {\n vec4 K=vec4(1.0,2.0/3.0,1.0/3.0,3.0);\n vec3 p=abs(fract(c.xxx+K.xyz)*6.0-K.www);\n return c.z*mix(K.xxx,clamp(p-K.xxx,0.0,1.0),c.y);\n}\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n vec3 hsv = rgb2hsv(c.rgb);\n hsv.x = fract(hsv.x + hue);\n hsv.y = clamp(hsv.y * saturation, 0.0, 1.0);\n gl_FragColor = vec4(hsv2rgb(hsv), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   hue: { type: 'number', uniform: 'hue', defaultValue: 0, min: -1, max: 1 },
   saturation: { type: 'number', uniform: 'saturation', defaultValue: 1, min: 0, max: 4 }
  }
 });

 Seriously.plugin('invert', {
  commonShader: true,
  title: 'Invert',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n gl_FragColor = vec4(mix(c.rgb, 1.0 - c.rgb, amount), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('grayscale', {
  commonShader: true,
  title: 'Grayscale',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float g = dot(c.rgb, vec3(0.299, 0.587, 0.114));\n gl_FragColor = vec4(mix(c.rgb, vec3(g), amount), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('sepia', {
  commonShader: true,
  title: 'Sepia',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float r = dot(c.rgb, vec3(0.393,0.769,0.189));\n float g = dot(c.rgb, vec3(0.349,0.686,0.168));\n float b = dot(c.rgb, vec3(0.272,0.534,0.131));\n gl_FragColor = vec4(mix(c.rgb, vec3(r,g,b), amount), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('blur', {
  commonShader: true,
  title: 'Blur',
  shader: function (inputs, w, h) {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float radius;\nuniform vec2 resolution;\nvoid main(void) {\n vec4 color = vec4(0.0);\n vec2 px = radius / resolution;\n color += texture2D(source, vTexCoord + vec2(-2.0)*px) * 0.0625;\n color += texture2D(source, vTexCoord + vec2(-1.0)*px) * 0.25;\n color += texture2D(source, vTexCoord) * 0.375;\n color += texture2D(source, vTexCoord + vec2(1.0)*px) * 0.25;\n color += texture2D(source, vTexCoord + vec2(2.0)*px) * 0.0625;\n gl_FragColor = color;\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   radius: { type: 'number', uniform: 'radius', defaultValue: 1, min: 0, max: 50 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('gaussian-blur', {
  commonShader: true,
  title: 'Gaussian Blur',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float sigma;\nuniform vec2 direction;\nuniform vec2 resolution;\nvoid main(void) {\n vec4 color = vec4(0.0);\n vec2 px = direction / resolution;\n float weightSum = 0.0;\n for (int i = -8; i <= 8; i++) {\n  float w = exp(-float(i*i) / (2.0 * sigma * sigma));\n  color += texture2D(source, vTexCoord + float(i) * px) * w;\n  weightSum += w;\n }\n gl_FragColor = color / weightSum;\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   sigma: { type: 'number', uniform: 'sigma', defaultValue: 3, min: 0.1, max: 20 },
   direction: { type: 'vector', uniform: 'direction', defaultValue: [1, 0] },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('sharpen', {
  commonShader: true,
  title: 'Sharpen',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nuniform vec2 resolution;\nvoid main(void) {\n vec2 px = 1.0 / resolution;\n vec4 c = texture2D(source, vTexCoord);\n vec4 n = texture2D(source, vTexCoord + vec2(0.0, -px.y));\n vec4 s = texture2D(source, vTexCoord + vec2(0.0, px.y));\n vec4 e = texture2D(source, vTexCoord + vec2(px.x, 0.0));\n vec4 w = texture2D(source, vTexCoord + vec2(-px.x, 0.0));\n gl_FragColor = clamp(c + amount * (4.0*c - n - s - e - w), 0.0, 1.0);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 0.5, min: 0, max: 5 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('emboss', {
  commonShader: true,
  title: 'Emboss',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nuniform vec2 resolution;\nvoid main(void) {\n vec2 px = 1.0 / resolution;\n vec4 c = texture2D(source, vTexCoord);\n vec4 tl = texture2D(source, vTexCoord - px);\n vec4 br = texture2D(source, vTexCoord + px);\n vec4 embossed = vec4(0.5) + (c - tl) * amount;\n gl_FragColor = vec4(embossed.rgb, c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 5 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('edge-detect', {
  commonShader: true,
  title: 'Edge Detect',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float threshold;\nuniform vec2 resolution;\nvoid main(void) {\n vec2 px = 1.0 / resolution;\n float tl = dot(texture2D(source, vTexCoord + vec2(-px.x, -px.y)).rgb, vec3(0.299,0.587,0.114));\n float tm = dot(texture2D(source, vTexCoord + vec2(0.0, -px.y)).rgb, vec3(0.299,0.587,0.114));\n float tr = dot(texture2D(source, vTexCoord + vec2(px.x, -px.y)).rgb, vec3(0.299,0.587,0.114));\n float ml = dot(texture2D(source, vTexCoord + vec2(-px.x, 0.0)).rgb, vec3(0.299,0.587,0.114));\n float mr = dot(texture2D(source, vTexCoord + vec2(px.x, 0.0)).rgb, vec3(0.299,0.587,0.114));\n float bl = dot(texture2D(source, vTexCoord + vec2(-px.x, px.y)).rgb, vec3(0.299,0.587,0.114));\n float bm = dot(texture2D(source, vTexCoord + vec2(0.0, px.y)).rgb, vec3(0.299,0.587,0.114));\n float br = dot(texture2D(source, vTexCoord + vec2(px.x, px.y)).rgb, vec3(0.299,0.587,0.114));\n float gx = -tl - 2.0*ml - bl + tr + 2.0*mr + br;\n float gy = -tl - 2.0*tm - tr + bl + 2.0*bm + br;\n float edge = sqrt(gx*gx + gy*gy);\n gl_FragColor = vec4(vec3(step(threshold, edge)), 1.0);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   threshold: { type: 'number', uniform: 'threshold', defaultValue: 0.1, min: 0, max: 1 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('blend', {
  commonShader: true,
  title: 'Blend',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n gl_FragColor = mix(a, b, amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 0.5, min: 0, max: 1 }
  }
 });

 Seriously.plugin('multiply', {
  commonShader: true,
  title: 'Multiply',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec4 m = a * b;\n gl_FragColor = mix(a, m, amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('screen', {
  commonShader: true,
  title: 'Screen',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec4 s = 1.0 - (1.0 - a) * (1.0 - b);\n gl_FragColor = mix(a, s, amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('overlay', {
  commonShader: true,
  title: 'Overlay',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec3 o = mix(2.0*a.rgb*b.rgb, 1.0-2.0*(1.0-a.rgb)*(1.0-b.rgb), step(0.5, a.rgb));\n gl_FragColor = mix(a, vec4(o, a.a), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('hard-light', {
  commonShader: true,
  title: 'Hard Light',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec3 h = mix(2.0*a.rgb*b.rgb, 1.0-2.0*(1.0-a.rgb)*(1.0-b.rgb), step(0.5, b.rgb));\n gl_FragColor = mix(a, vec4(h, a.a), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('soft-light', {
  commonShader: true,
  title: 'Soft Light',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec3 s = (1.0-2.0*b.rgb)*a.rgb*a.rgb + 2.0*b.rgb*a.rgb;\n gl_FragColor = mix(a, vec4(s, a.a), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('difference', {
  commonShader: true,
  title: 'Difference',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec4 d = abs(a - b);\n gl_FragColor = mix(a, d, amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('exclusion', {
  commonShader: true,
  title: 'Exclusion',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec3 e = a.rgb + b.rgb - 2.0*a.rgb*b.rgb;\n gl_FragColor = mix(a, vec4(e, a.a), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('dodge', {
  commonShader: true,
  title: 'Color Dodge',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec3 d = clamp(a.rgb / (1.0 - b.rgb + 0.001), 0.0, 1.0);\n gl_FragColor = mix(a, vec4(d, a.a), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('burn', {
  commonShader: true,
  title: 'Color Burn',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec3 bn = 1.0 - clamp((1.0 - a.rgb) / (b.rgb + 0.001), 0.0, 1.0);\n gl_FragColor = mix(a, vec4(bn, a.a), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('darken', {
  commonShader: true,
  title: 'Darken',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n gl_FragColor = mix(a, min(a, b), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('lighten', {
  commonShader: true,
  title: 'Lighten',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n gl_FragColor = mix(a, max(a, b), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('vignette', {
  commonShader: true,
  title: 'Vignette',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float size;\nuniform float softness;\nuniform vec3 color;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n vec2 uv = vTexCoord - 0.5;\n float v = smoothstep(size, size - softness, length(uv));\n gl_FragColor = vec4(mix(color, c.rgb, v), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   size: { type: 'number', uniform: 'size', defaultValue: 0.4, min: 0, max: 1 },
   softness: { type: 'number', uniform: 'softness', defaultValue: 0.2, min: 0, max: 1 },
   color: { type: 'vector', uniform: 'color', defaultValue: [0, 0, 0] }
  }
 });

 Seriously.plugin('chromatic-aberration', {
  commonShader: true,
  title: 'Chromatic Aberration',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nvoid main(void) {\n vec2 dir = (vTexCoord - 0.5) * amount;\n float r = texture2D(source, vTexCoord - dir).r;\n float g = texture2D(source, vTexCoord).g;\n float b = texture2D(source, vTexCoord + dir).b;\n float a = texture2D(source, vTexCoord).a;\n gl_FragColor = vec4(r, g, b, a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 0.01, min: 0, max: 0.1 }
  }
 });

 Seriously.plugin('film-grain', {
  commonShader: true,
  title: 'Film Grain',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nuniform float time;\nfloat rand(vec2 co) {\n return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);\n}\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float noise = rand(vTexCoord + fract(time)) * 2.0 - 1.0;\n gl_FragColor = clamp(vec4(c.rgb + noise * amount, c.a), 0.0, 1.0);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 0.05, min: 0, max: 0.5 },
   time: { type: 'number', uniform: 'time', defaultValue: 0 }
  }
 });

 Seriously.plugin('scanlines', {
  commonShader: true,
  title: 'Scanlines',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float frequency;\nuniform float opacity;\nuniform vec2 resolution;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float line = mod(floor(vTexCoord.y * resolution.y / frequency), 2.0);\n gl_FragColor = vec4(c.rgb * mix(1.0, line, opacity), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   frequency: { type: 'number', uniform: 'frequency', defaultValue: 2, min: 1, max: 20 },
   opacity: { type: 'number', uniform: 'opacity', defaultValue: 0.5, min: 0, max: 1 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('pixelate', {
  commonShader: true,
  title: 'Pixelate',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float size;\nuniform vec2 resolution;\nvoid main(void) {\n vec2 px = vec2(size) / resolution;\n vec2 coord = floor(vTexCoord / px) * px + px * 0.5;\n gl_FragColor = texture2D(source, coord);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   size: { type: 'number', uniform: 'size', defaultValue: 8, min: 1, max: 100 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('mosaic', {
  commonShader: true,
  title: 'Mosaic',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform vec2 tiles;\nvoid main(void) {\n vec2 coord = floor(vTexCoord * tiles) / tiles + 0.5 / tiles;\n gl_FragColor = texture2D(source, coord);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   tiles: { type: 'vector', uniform: 'tiles', defaultValue: [20, 20] }
  }
 });

 Seriously.plugin('posterize', {
  commonShader: true,
  title: 'Posterize',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float levels;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n gl_FragColor = vec4(floor(c.rgb * levels) / (levels - 1.0), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   levels: { type: 'number', uniform: 'levels', defaultValue: 4, min: 2, max: 256 }
  }
 });

 Seriously.plugin('threshold', {
  commonShader: true,
  title: 'Threshold',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float threshold;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float lum = dot(c.rgb, vec3(0.299, 0.587, 0.114));\n float t = step(threshold, lum);\n gl_FragColor = vec4(vec3(t), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   threshold: { type: 'number', uniform: 'threshold', defaultValue: 0.5, min: 0, max: 1 }
  }
 });

 Seriously.plugin('solarize', {
  commonShader: true,
  title: 'Solarize',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float threshold;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n vec3 s = mix(c.rgb, 1.0 - c.rgb, step(threshold, c.rgb));\n gl_FragColor = vec4(s, c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   threshold: { type: 'number', uniform: 'threshold', defaultValue: 0.5, min: 0, max: 1 }
  }
 });

 Seriously.plugin('color-balance', {
  commonShader: true,
  title: 'Color Balance',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform vec3 shadows;\nuniform vec3 midtones;\nuniform vec3 highlights;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float lum = dot(c.rgb, vec3(0.299, 0.587, 0.114));\n float sw = clamp(1.0 - lum * 2.0, 0.0, 1.0);\n float hw = clamp(lum * 2.0 - 1.0, 0.0, 1.0);\n float mw = 1.0 - sw - hw;\n vec3 adj = c.rgb + sw * shadows + mw * midtones + hw * highlights;\n gl_FragColor = vec4(clamp(adj, 0.0, 1.0), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   shadows: { type: 'vector', uniform: 'shadows', defaultValue: [0, 0, 0] },
   midtones: { type: 'vector', uniform: 'midtones', defaultValue: [0, 0, 0] },
   highlights: { type: 'vector', uniform: 'highlights', defaultValue: [0, 0, 0] }
  }
 });

 Seriously.plugin('curves', {
  commonShader: true,
  title: 'Curves',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float gamma;\nuniform float lift;\nuniform float gain;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n vec3 adj = lift + (c.rgb) * gain;\n adj = pow(max(adj, 0.0), vec3(1.0 / gamma));\n gl_FragColor = vec4(clamp(adj, 0.0, 1.0), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   gamma: { type: 'number', uniform: 'gamma', defaultValue: 1, min: 0.1, max: 4 },
   lift: { type: 'number', uniform: 'lift', defaultValue: 0, min: -0.5, max: 0.5 },
   gain: { type: 'number', uniform: 'gain', defaultValue: 1, min: 0, max: 4 }
  }
 });

 Seriously.plugin('levels', {
  commonShader: true,
  title: 'Levels',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float inputMin;\nuniform float inputMax;\nuniform float outputMin;\nuniform float outputMax;\nuniform float gamma;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n vec3 adj = (c.rgb - inputMin) / (inputMax - inputMin);\n adj = clamp(adj, 0.0, 1.0);\n adj = pow(adj, vec3(1.0 / gamma));\n adj = adj * (outputMax - outputMin) + outputMin;\n gl_FragColor = vec4(clamp(adj, 0.0, 1.0), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   inputMin: { type: 'number', uniform: 'inputMin', defaultValue: 0, min: 0, max: 1 },
   inputMax: { type: 'number', uniform: 'inputMax', defaultValue: 1, min: 0, max: 1 },
   outputMin: { type: 'number', uniform: 'outputMin', defaultValue: 0, min: 0, max: 1 },
   outputMax: { type: 'number', uniform: 'outputMax', defaultValue: 1, min: 0, max: 1 },
   gamma: { type: 'number', uniform: 'gamma', defaultValue: 1, min: 0.1, max: 4 }
  }
 });

 Seriously.plugin('channel-mixer', {
  commonShader: true,
  title: 'Channel Mixer',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform vec3 rChannel;\nuniform vec3 gChannel;\nuniform vec3 bChannel;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float r = dot(c.rgb, rChannel);\n float g = dot(c.rgb, gChannel);\n float b = dot(c.rgb, bChannel);\n gl_FragColor = vec4(clamp(vec3(r,g,b), 0.0, 1.0), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   rChannel: { type: 'vector', uniform: 'rChannel', defaultValue: [1, 0, 0] },
   gChannel: { type: 'vector', uniform: 'gChannel', defaultValue: [0, 1, 0] },
   bChannel: { type: 'vector', uniform: 'bChannel', defaultValue: [0, 0, 1] }
  }
 });

 Seriously.plugin('lut', {
  commonShader: true,
  title: 'LUT (Color Lookup)',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float strength;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n vec2 lutCoord = vec2(c.r, c.g);\n vec4 lutColor = texture2D(source2, lutCoord);\n gl_FragColor = mix(c, lutColor, strength);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image', title: 'LUT' },
   strength: { type: 'number', uniform: 'strength', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('tint', {
  commonShader: true,
  title: 'Tint',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform vec3 color;\nuniform float amount;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n gl_FragColor = vec4(mix(c.rgb, c.rgb * color, amount), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   color: { type: 'vector', uniform: 'color', defaultValue: [1, 0.8, 0.5] },
   amount: { type: 'number', uniform: 'amount', defaultValue: 0.5, min: 0, max: 1 }
  }
 });

 Seriously.plugin('duotone', {
  commonShader: true,
  title: 'Duotone',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform vec3 shadow;\nuniform vec3 highlight;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float lum = dot(c.rgb, vec3(0.299, 0.587, 0.114));\n gl_FragColor = vec4(mix(shadow, highlight, lum), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   shadow: { type: 'vector', uniform: 'shadow', defaultValue: [0.1, 0.05, 0.3] },
   highlight: { type: 'vector', uniform: 'highlight', defaultValue: [1.0, 0.9, 0.4] }
  }
 });

 Seriously.plugin('vibrance', {
  commonShader: true,
  title: 'Vibrance',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float vibrance;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float avg = (c.r + c.g + c.b) / 3.0;\n float mx = max(max(c.r, c.g), c.b);\n float amt = (mx - avg) * (-vibrance * 3.0);\n c.r += (mx - c.r) * amt;\n c.g += (mx - c.g) * amt;\n c.b += (mx - c.b) * amt;\n gl_FragColor = clamp(c, 0.0, 1.0);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   vibrance: { type: 'number', uniform: 'vibrance', defaultValue: 0.5, min: -1, max: 1 }
  }
 });

 Seriously.plugin('temperature', {
  commonShader: true,
  title: 'Color Temperature',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float temperature;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n c.r += temperature * 0.1;\n c.b -= temperature * 0.1;\n gl_FragColor = clamp(c, 0.0, 1.0);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   temperature: { type: 'number', uniform: 'temperature', defaultValue: 0, min: -1, max: 1 }
  }
 });

 Seriously.plugin('cross-process', {
  commonShader: true,
  title: 'Cross Process',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float r = c.r < 0.5 ? 2.0*c.r*c.r : 1.0-2.0*(1.0-c.r)*(1.0-c.r);\n float g = c.g < 0.5 ? 2.0*c.g*(1.0-c.g) : c.g;\n float b = c.b > 0.5 ? 2.0*c.b*c.b : c.b;\n gl_FragColor = vec4(mix(c.rgb, vec3(r,g,b), amount), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('vintage', {
  commonShader: true,
  title: 'Vintage',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float g = dot(c.rgb, vec3(0.299,0.587,0.114));\n vec3 sepia = vec3(g*1.2, g*0.9, g*0.6);\n vec3 aged = mix(c.rgb, sepia, 0.5);\n vec2 uv = vTexCoord - 0.5;\n float v = smoothstep(0.4, 0.2, length(uv));\n aged *= v;\n gl_FragColor = vec4(mix(c.rgb, aged, amount), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('lomo', {
  commonShader: true,
  title: 'Lomo',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n c.r = pow(c.r, 1.2);\n c.b = pow(c.b, 0.85);\n vec2 uv = vTexCoord - 0.5;\n float v = smoothstep(0.5, 0.3, length(uv * vec2(1.0, 0.8)));\n c.rgb *= mix(0.2, 1.0, v);\n gl_FragColor = mix(texture2D(source, vTexCoord), vec4(clamp(c.rgb,0.0,1.0), c.a), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('infrared', {
  commonShader: true,
  title: 'Infrared',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float ir = c.r * 0.5 + (1.0 - c.g) * 0.5;\n vec3 infrared = vec3(ir, ir * 0.9, ir * 0.7);\n gl_FragColor = vec4(mix(c.rgb, infrared, amount), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('night-vision', {
  commonShader: true,
  title: 'Night Vision',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float lum = dot(c.rgb, vec3(0.299,0.587,0.114));\n vec3 nv = vec3(0.0, lum * 1.5, 0.0);\n gl_FragColor = vec4(mix(c.rgb, nv, amount), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('thermal', {
  commonShader: true,
  title: 'Thermal',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float lum = dot(c.rgb, vec3(0.299,0.587,0.114));\n vec3 thermal;\n if (lum < 0.33) thermal = mix(vec3(0,0,0.5), vec3(0,0.5,1.0), lum*3.0);\n else if (lum < 0.66) thermal = mix(vec3(0,0.5,1.0), vec3(1,1,0), (lum-0.33)*3.0);\n else thermal = mix(vec3(1,1,0), vec3(1,0,0), (lum-0.66)*3.0);\n gl_FragColor = vec4(mix(c.rgb, thermal, amount), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('neon', {
  commonShader: true,
  title: 'Neon',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nuniform float glow;\nuniform vec2 resolution;\nvoid main(void) {\n vec2 px = 1.0 / resolution;\n vec4 c = texture2D(source, vTexCoord);\n vec4 n1 = texture2D(source, vTexCoord + vec2(-px.x, 0));\n vec4 n2 = texture2D(source, vTexCoord + vec2(px.x, 0));\n vec4 n3 = texture2D(source, vTexCoord + vec2(0, -px.y));\n vec4 n4 = texture2D(source, vTexCoord + vec2(0, px.y));\n vec4 edge = abs(c - (n1+n2+n3+n4)*0.25) * glow;\n vec3 neon = c.rgb * 0.05 + edge.rgb;\n gl_FragColor = vec4(mix(c.rgb, neon, amount), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 },
   glow: { type: 'number', uniform: 'glow', defaultValue: 5, min: 0, max: 20 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('glitch', {
  commonShader: true,
  title: 'Glitch',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nuniform float time;\nfloat rand(float n) { return fract(sin(n) * 43758.5453); }\nvoid main(void) {\n vec2 uv = vTexCoord;\n float band = floor(uv.y * 20.0);\n float offset = (rand(band + floor(time * 10.0)) - 0.5) * amount;\n uv.x = fract(uv.x + offset);\n float r = texture2D(source, uv + vec2(amount*0.01, 0)).r;\n float g = texture2D(source, uv).g;\n float b = texture2D(source, uv - vec2(amount*0.01, 0)).b;\n gl_FragColor = vec4(r, g, b, 1.0);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 0.1, min: 0, max: 1 },
   time: { type: 'number', uniform: 'time', defaultValue: 0 }
  }
 });

 Seriously.plugin('warp', {
  commonShader: true,
  title: 'Warp',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nuniform float time;\nvoid main(void) {\n vec2 uv = vTexCoord;\n uv.x += sin(uv.y * 10.0 + time) * amount;\n uv.y += cos(uv.x * 10.0 + time) * amount;\n gl_FragColor = texture2D(source, fract(uv));\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 0.03, min: 0, max: 0.5 },
   time: { type: 'number', uniform: 'time', defaultValue: 0 }
  }
 });

 Seriously.plugin('ripple', {
  commonShader: true,
  title: 'Ripple',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amplitude;\nuniform float frequency;\nuniform float time;\nvoid main(void) {\n vec2 uv = vTexCoord;\n uv.x += sin(uv.y * frequency + time) * amplitude;\n gl_FragColor = texture2D(source, uv);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amplitude: { type: 'number', uniform: 'amplitude', defaultValue: 0.02, min: 0, max: 0.2 },
   frequency: { type: 'number', uniform: 'frequency', defaultValue: 20, min: 1, max: 100 },
   time: { type: 'number', uniform: 'time', defaultValue: 0 }
  }
 });

 Seriously.plugin('twirl', {
  commonShader: true,
  title: 'Twirl',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float angle;\nuniform float radius;\nuniform vec2 center;\nvoid main(void) {\n vec2 uv = vTexCoord - center;\n float dist = length(uv);\n float a = angle * smoothstep(radius, 0.0, dist);\n float s = sin(a);\n float c = cos(a);\n uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);\n gl_FragColor = texture2D(source, uv + center);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   angle: { type: 'number', uniform: 'angle', defaultValue: 1, min: -10, max: 10 },
   radius: { type: 'number', uniform: 'radius', defaultValue: 0.5, min: 0, max: 2 },
   center: { type: 'vector', uniform: 'center', defaultValue: [0.5, 0.5] }
  }
 });

 Seriously.plugin('pinch', {
  commonShader: true,
  title: 'Pinch',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nuniform vec2 center;\nvoid main(void) {\n vec2 uv = vTexCoord - center;\n float dist = length(uv);\n float pinch = pow(dist, 1.0 + amount);\n vec2 offset = normalize(uv) * pinch;\n gl_FragColor = texture2D(source, offset + center);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 0.5, min: -2, max: 2 },
   center: { type: 'vector', uniform: 'center', defaultValue: [0.5, 0.5] }
  }
 });

 Seriously.plugin('bulge', {
  commonShader: true,
  title: 'Bulge',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nuniform float radius;\nuniform vec2 center;\nvoid main(void) {\n vec2 uv = vTexCoord - center;\n float dist = length(uv);\n float mask = smoothstep(radius, 0.0, dist);\n uv *= mix(1.0, 1.0 - amount * mask, 1.0);\n gl_FragColor = texture2D(source, uv + center);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 0.5, min: -1, max: 1 },
   radius: { type: 'number', uniform: 'radius', defaultValue: 0.5, min: 0, max: 1 },
   center: { type: 'vector', uniform: 'center', defaultValue: [0.5, 0.5] }
  }
 });

 Seriously.plugin('lens-distortion', {
  commonShader: true,
  title: 'Lens Distortion',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float k1;\nuniform float k2;\nvoid main(void) {\n vec2 uv = vTexCoord * 2.0 - 1.0;\n float r2 = dot(uv, uv);\n vec2 distorted = uv * (1.0 + k1 * r2 + k2 * r2 * r2);\n vec2 coord = (distorted + 1.0) * 0.5;\n if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0)\n  gl_FragColor = vec4(0.0);\n else\n  gl_FragColor = texture2D(source, coord);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   k1: { type: 'number', uniform: 'k1', defaultValue: 0.2, min: -1, max: 1 },
   k2: { type: 'number', uniform: 'k2', defaultValue: 0, min: -1, max: 1 }
  }
 });

 Seriously.plugin('fisheye', {
  commonShader: true,
  title: 'Fisheye',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nvoid main(void) {\n vec2 uv = vTexCoord * 2.0 - 1.0;\n float r = length(uv);\n float theta = atan(r * amount);\n vec2 distorted = (r > 0.0) ? normalize(uv) * theta / (3.14159 * 0.5) : uv;\n gl_FragColor = texture2D(source, (distorted + 1.0) * 0.5);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 5 }
  }
 });

 Seriously.plugin('mirror', {
  commonShader: true,
  title: 'Mirror',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform int axis;\nvoid main(void) {\n vec2 uv = vTexCoord;\n if (axis == 0) uv.x = 1.0 - uv.x;\n else if (axis == 1) uv.y = 1.0 - uv.y;\n else { uv.x = 1.0 - uv.x; uv.y = 1.0 - uv.y; }\n gl_FragColor = texture2D(source, uv);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   axis: { type: 'number', uniform: 'axis', defaultValue: 0, min: 0, max: 2 }
  }
 });

 Seriously.plugin('kaleidoscope', {
  commonShader: true,
  title: 'Kaleidoscope',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float segments;\nuniform float angle;\nvoid main(void) {\n vec2 uv = vTexCoord - 0.5;\n float r = length(uv);\n float a = atan(uv.y, uv.x) + angle;\n float seg = 3.14159 * 2.0 / segments;\n a = mod(a, seg);\n if (a > seg * 0.5) a = seg - a;\n gl_FragColor = texture2D(source, vec2(cos(a), sin(a)) * r + 0.5);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   segments: { type: 'number', uniform: 'segments', defaultValue: 6, min: 2, max: 32 },
   angle: { type: 'number', uniform: 'angle', defaultValue: 0, min: 0, max: 6.283 }
  }
 });

 Seriously.plugin('zoom-blur', {
  commonShader: true,
  title: 'Zoom Blur',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nuniform vec2 center;\nvoid main(void) {\n vec4 color = vec4(0.0);\n float total = 0.0;\n for (int i = 0; i < 16; i++) {\n  float t = float(i) / 15.0;\n  vec2 uv = mix(vTexCoord, center, t * amount);\n  float w = 1.0 - t;\n  color += texture2D(source, uv) * w;\n  total += w;\n }\n gl_FragColor = color / total;\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 0.3, min: 0, max: 1 },
   center: { type: 'vector', uniform: 'center', defaultValue: [0.5, 0.5] }
  }
 });

 Seriously.plugin('motion-blur', {
  commonShader: true,
  title: 'Motion Blur',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform vec2 direction;\nuniform float samples;\nvoid main(void) {\n vec4 color = vec4(0.0);\n for (int i = 0; i < 16; i++) {\n  float t = (float(i) / 15.0 - 0.5);\n  color += texture2D(source, vTexCoord + direction * t);\n }\n gl_FragColor = color / 16.0;\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   direction: { type: 'vector', uniform: 'direction', defaultValue: [0.05, 0] },
   samples: { type: 'number', uniform: 'samples', defaultValue: 16, min: 2, max: 32 }
  }
 });

 Seriously.plugin('tilt-shift', {
  commonShader: true,
  title: 'Tilt Shift',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float center;\nuniform float range;\nuniform float blurRadius;\nuniform vec2 resolution;\nvoid main(void) {\n float dist = abs(vTexCoord.y - center);\n float blur = smoothstep(range * 0.5, range, dist) * blurRadius;\n vec4 color = vec4(0.0);\n vec2 px = vec2(blur) / resolution;\n color += texture2D(source, vTexCoord + vec2(-2.0,0)*px) * 0.0625;\n color += texture2D(source, vTexCoord + vec2(-1.0,0)*px) * 0.25;\n color += texture2D(source, vTexCoord) * 0.375;\n color += texture2D(source, vTexCoord + vec2(1.0,0)*px) * 0.25;\n color += texture2D(source, vTexCoord + vec2(2.0,0)*px) * 0.0625;\n gl_FragColor = color;\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   center: { type: 'number', uniform: 'center', defaultValue: 0.5, min: 0, max: 1 },
   range: { type: 'number', uniform: 'range', defaultValue: 0.2, min: 0, max: 1 },
   blurRadius: { type: 'number', uniform: 'blurRadius', defaultValue: 4, min: 0, max: 20 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('bokeh', {
  commonShader: true,
  title: 'Bokeh',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float radius;\nuniform vec2 center;\nvoid main(void) {\n float dist = length(vTexCoord - center);\n float blur = dist * radius;\n vec4 color = vec4(0.0);\n float total = 0.0;\n for (int i = -4; i <= 4; i++) {\n  for (int j = -4; j <= 4; j++) {\n   vec2 offset = vec2(float(i), float(j)) * blur * 0.01;\n   if (length(vec2(float(i), float(j))) <= 4.0) {\n    color += texture2D(source, vTexCoord + offset);\n    total += 1.0;\n   }\n  }\n }\n gl_FragColor = color / total;\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   radius: { type: 'number', uniform: 'radius', defaultValue: 0.5, min: 0, max: 2 },
   center: { type: 'vector', uniform: 'center', defaultValue: [0.5, 0.5] }
  }
 });

 Seriously.plugin('unsharp-mask', {
  commonShader: true,
  title: 'Unsharp Mask',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nuniform float radius;\nuniform vec2 resolution;\nvoid main(void) {\n vec2 px = radius / resolution;\n vec4 blur = vec4(0.0);\n blur += texture2D(source, vTexCoord + vec2(-px.x, -px.y)) * 0.0625;\n blur += texture2D(source, vTexCoord + vec2(0, -px.y)) * 0.125;\n blur += texture2D(source, vTexCoord + vec2(px.x, -px.y)) * 0.0625;\n blur += texture2D(source, vTexCoord + vec2(-px.x, 0)) * 0.125;\n blur += texture2D(source, vTexCoord) * 0.25;\n blur += texture2D(source, vTexCoord + vec2(px.x, 0)) * 0.125;\n blur += texture2D(source, vTexCoord + vec2(-px.x, px.y)) * 0.0625;\n blur += texture2D(source, vTexCoord + vec2(0, px.y)) * 0.125;\n blur += texture2D(source, vTexCoord + vec2(px.x, px.y)) * 0.0625;\n vec4 orig = texture2D(source, vTexCoord);\n gl_FragColor = orig + (orig - blur) * amount;\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 5 },
   radius: { type: 'number', uniform: 'radius', defaultValue: 2, min: 0, max: 20 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('median', {
  commonShader: true,
  title: 'Median',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform vec2 resolution;\nvoid main(void) {\n vec2 px = 1.0 / resolution;\n vec4 s0 = texture2D(source, vTexCoord + vec2(-px.x, -px.y));\n vec4 s1 = texture2D(source, vTexCoord + vec2(0.0, -px.y));\n vec4 s2 = texture2D(source, vTexCoord + vec2(px.x, -px.y));\n vec4 s3 = texture2D(source, vTexCoord + vec2(-px.x, 0.0));\n vec4 s4 = texture2D(source, vTexCoord);\n vec4 s5 = texture2D(source, vTexCoord + vec2(px.x, 0.0));\n vec4 s6 = texture2D(source, vTexCoord + vec2(-px.x, px.y));\n vec4 s7 = texture2D(source, vTexCoord + vec2(0.0, px.y));\n vec4 s8 = texture2D(source, vTexCoord + vec2(px.x, px.y));\n gl_FragColor = (s0+s1+s2+s3+s4+s5+s6+s7+s8) / 9.0;\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('dilate', {
  commonShader: true,
  title: 'Dilate',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform vec2 resolution;\nuniform float radius;\nvoid main(void) {\n vec2 px = radius / resolution;\n vec4 maxVal = vec4(0.0);\n for (int i = -2; i <= 2; i++) {\n  for (int j = -2; j <= 2; j++) {\n   maxVal = max(maxVal, texture2D(source, vTexCoord + vec2(float(i), float(j)) * px));\n  }\n }\n gl_FragColor = maxVal;\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] },
   radius: { type: 'number', uniform: 'radius', defaultValue: 1, min: 0, max: 10 }
  }
 });

 Seriously.plugin('erode', {
  commonShader: true,
  title: 'Erode',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform vec2 resolution;\nuniform float radius;\nvoid main(void) {\n vec2 px = radius / resolution;\n vec4 minVal = vec4(1.0);\n for (int i = -2; i <= 2; i++) {\n  for (int j = -2; j <= 2; j++) {\n   minVal = min(minVal, texture2D(source, vTexCoord + vec2(float(i), float(j)) * px));\n  }\n }\n gl_FragColor = minVal;\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] },
   radius: { type: 'number', uniform: 'radius', defaultValue: 1, min: 0, max: 10 }
  }
 });

 Seriously.plugin('noise', {
  commonShader: true,
  title: 'Noise',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nuniform float seed;\nfloat rand(vec2 co) { return fract(sin(dot(co.xy, vec2(12.9898,78.233)) + seed) * 43758.5453); }\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float n = rand(vTexCoord) * amount;\n gl_FragColor = clamp(vec4(c.rgb + n, c.a), 0.0, 1.0);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 0.1, min: 0, max: 1 },
   seed: { type: 'number', uniform: 'seed', defaultValue: 0 }
  }
 });

 Seriously.plugin('perlin-noise', {
  commonShader: true,
  title: 'Perlin Noise',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float scale;\nuniform float amount;\nuniform float time;\nvec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }\nfloat grad(float h, float x, float y) {\n h = mod(h, 4.0);\n if (h < 2.0) return (h < 1.0) ? x : -x;\n return (h < 3.0) ? y : -y;\n}\nfloat noise(vec2 p) {\n vec2 i = floor(p);\n vec2 f = fract(p);\n vec2 u = fade(f);\n float a = fract(sin(dot(i, vec2(127.1,311.7))) * 43758.5453);\n float b = fract(sin(dot(i+vec2(1,0), vec2(127.1,311.7))) * 43758.5453);\n float c = fract(sin(dot(i+vec2(0,1), vec2(127.1,311.7))) * 43758.5453);\n float d = fract(sin(dot(i+vec2(1,1), vec2(127.1,311.7))) * 43758.5453);\n return mix(mix(grad(a*4.0,f.x,f.y),grad(b*4.0,f.x-1.0,f.y),u.x),mix(grad(c*4.0,f.x,f.y-1.0),grad(d*4.0,f.x-1.0,f.y-1.0),u.x),u.y);\n}\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float n = noise(vTexCoord * scale + time) * amount;\n gl_FragColor = clamp(vec4(c.rgb + n, c.a), 0.0, 1.0);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   scale: { type: 'number', uniform: 'scale', defaultValue: 10, min: 1, max: 100 },
   amount: { type: 'number', uniform: 'amount', defaultValue: 0.1, min: 0, max: 1 },
   time: { type: 'number', uniform: 'time', defaultValue: 0 }
  }
 });

 Seriously.plugin('displacement', {
  commonShader: true,
  title: 'Displacement',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float scaleX;\nuniform float scaleY;\nvoid main(void) {\n vec4 d = texture2D(source2, vTexCoord);\n vec2 offset = vec2((d.r - 0.5) * scaleX, (d.g - 0.5) * scaleY);\n gl_FragColor = texture2D(source, vTexCoord + offset);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image', title: 'Displacement Map' },
   scaleX: { type: 'number', uniform: 'scaleX', defaultValue: 0.1, min: -1, max: 1 },
   scaleY: { type: 'number', uniform: 'scaleY', defaultValue: 0.1, min: -1, max: 1 }
  }
 });

 Seriously.plugin('normal-map', {
  commonShader: true,
  title: 'Normal Map',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float strength;\nuniform vec2 resolution;\nvoid main(void) {\n vec2 px = 1.0 / resolution;\n float tl = dot(texture2D(source, vTexCoord + vec2(-px.x, -px.y)).rgb, vec3(0.299,0.587,0.114));\n float tr = dot(texture2D(source, vTexCoord + vec2(px.x, -px.y)).rgb, vec3(0.299,0.587,0.114));\n float bl = dot(texture2D(source, vTexCoord + vec2(-px.x, px.y)).rgb, vec3(0.299,0.587,0.114));\n float br = dot(texture2D(source, vTexCoord + vec2(px.x, px.y)).rgb, vec3(0.299,0.587,0.114));\n float dx = (tr + br - tl - bl) * strength;\n float dy = (bl + br - tl - tr) * strength;\n vec3 normal = normalize(vec3(dx, dy, 1.0)) * 0.5 + 0.5;\n gl_FragColor = vec4(normal, 1.0);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   strength: { type: 'number', uniform: 'strength', defaultValue: 2, min: 0, max: 20 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('relief', {
  commonShader: true,
  title: 'Relief',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nuniform vec2 direction;\nuniform vec2 resolution;\nvoid main(void) {\n vec2 px = direction / resolution;\n vec4 c1 = texture2D(source, vTexCoord - px);\n vec4 c2 = texture2D(source, vTexCoord + px);\n vec4 diff = (c2 - c1) * amount + 0.5;\n gl_FragColor = vec4(diff.rgb, 1.0);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 2, min: 0, max: 10 },
   direction: { type: 'vector', uniform: 'direction', defaultValue: [1, 1] },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('halftone', {
  commonShader: true,
  title: 'Halftone',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float size;\nuniform vec2 resolution;\nvoid main(void) {\n vec2 px = vTexCoord * resolution / size;\n vec2 center = floor(px) + 0.5;\n float dist = length(px - center);\n vec2 uv = center * size / resolution;\n float lum = dot(texture2D(source, uv).rgb, vec3(0.299,0.587,0.114));\n float radius = sqrt(1.0 - lum) * 0.5;\n float circle = step(dist, radius * size * 0.5);\n gl_FragColor = vec4(vec3(1.0 - circle), 1.0);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   size: { type: 'number', uniform: 'size', defaultValue: 8, min: 2, max: 40 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('comic', {
  commonShader: true,
  title: 'Comic',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float edgeStrength;\nuniform float posterLevels;\nuniform vec2 resolution;\nvoid main(void) {\n vec2 px = 1.0 / resolution;\n vec4 c = texture2D(source, vTexCoord);\n vec3 poster = floor(c.rgb * posterLevels) / posterLevels;\n float tl = dot(texture2D(source, vTexCoord - px).rgb, vec3(0.299,0.587,0.114));\n float br = dot(texture2D(source, vTexCoord + px).rgb, vec3(0.299,0.587,0.114));\n float edge = abs(tl - br) * edgeStrength;\n vec3 result = poster * (1.0 - min(edge, 1.0));\n gl_FragColor = vec4(result, c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   edgeStrength: { type: 'number', uniform: 'edgeStrength', defaultValue: 5, min: 0, max: 20 },
   posterLevels: { type: 'number', uniform: 'posterLevels', defaultValue: 6, min: 2, max: 16 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('oil-paint', {
  commonShader: true,
  title: 'Oil Paint',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float radius;\nuniform float levels;\nuniform vec2 resolution;\nvoid main(void) {\n vec2 px = radius / resolution;\n int n = int(radius);\n vec4 meanColors[8];\n float counts[8];\n for (int k = 0; k < 8; k++) { meanColors[k] = vec4(0.0); counts[k] = 0.0; }\n for (int i = -4; i <= 4; i++) {\n  for (int j = -4; j <= 4; j++) {\n   vec4 s = texture2D(source, vTexCoord + vec2(float(i), float(j)) * px * 0.5);\n   int idx = int(dot(s.rgb, vec3(0.299,0.587,0.114)) * 7.0);\n   meanColors[idx] += s;\n   counts[idx] += 1.0;\n  }\n }\n float maxCount = 0.0;\n vec4 result = texture2D(source, vTexCoord);\n for (int k = 0; k < 8; k++) {\n  if (counts[k] > maxCount) { maxCount = counts[k]; result = meanColors[k] / counts[k]; }\n }\n gl_FragColor = result;\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   radius: { type: 'number', uniform: 'radius', defaultValue: 3, min: 1, max: 8 },
   levels: { type: 'number', uniform: 'levels', defaultValue: 8, min: 2, max: 16 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('watercolor', {
  commonShader: true,
  title: 'Watercolor',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float bleed;\nuniform float pigment;\nuniform vec2 resolution;\nvoid main(void) {\n vec2 px = 1.0 / resolution;\n vec4 c = vec4(0.0);\n for (int i = -3; i <= 3; i++) {\n  for (int j = -3; j <= 3; j++) {\n   float w = 1.0 / (1.0 + float(i*i + j*j));\n   c += texture2D(source, vTexCoord + vec2(float(i),float(j)) * px * bleed) * w;\n  }\n }\n c /= c.a;\n vec4 orig = texture2D(source, vTexCoord);\n c.rgb = floor(c.rgb * pigment) / pigment;\n gl_FragColor = vec4(mix(orig.rgb, c.rgb, 0.7), orig.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   bleed: { type: 'number', uniform: 'bleed', defaultValue: 2, min: 0, max: 10 },
   pigment: { type: 'number', uniform: 'pigment', defaultValue: 6, min: 2, max: 16 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('pencil-sketch', {
  commonShader: true,
  title: 'Pencil Sketch',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nuniform vec2 resolution;\nvoid main(void) {\n vec2 px = 1.0 / resolution;\n float c = dot(texture2D(source, vTexCoord).rgb, vec3(0.299,0.587,0.114));\n float n = dot(texture2D(source, vTexCoord + vec2(-px.x,-px.y)).rgb, vec3(0.299,0.587,0.114));\n float e = dot(texture2D(source, vTexCoord + vec2(px.x,-px.y)).rgb, vec3(0.299,0.587,0.114));\n float s = dot(texture2D(source, vTexCoord + vec2(-px.x,px.y)).rgb, vec3(0.299,0.587,0.114));\n float w = dot(texture2D(source, vTexCoord + vec2(px.x,px.y)).rgb, vec3(0.299,0.587,0.114));\n float edge = 1.0 - abs(n+e+s+w - 4.0*c) * amount;\n gl_FragColor = vec4(vec3(edge), 1.0);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 3, min: 0, max: 20 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('stained-glass', {
  commonShader: true,
  title: 'Stained Glass',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float cells;\nuniform float edgeWidth;\nvoid main(void) {\n vec2 uv = vTexCoord * cells;\n vec2 cell = floor(uv);\n vec2 f = fract(uv);\n float minDist = 1.0;\n vec2 minCell = cell;\n for (int i = -1; i <= 1; i++) {\n  for (int j = -1; j <= 1; j++) {\n   vec2 nc = cell + vec2(float(i), float(j));\n   vec2 rp = vec2(fract(sin(dot(nc, vec2(127.1,311.7))) * 43758.5453), fract(sin(dot(nc, vec2(269.5,183.3))) * 43758.5453));\n   float d = length(f - rp - vec2(float(i), float(j)));\n   if (d < minDist) { minDist = d; minCell = nc; }\n  }\n }\n vec2 sampleUV = (minCell + 0.5) / cells;\n vec4 c = texture2D(source, sampleUV);\n float edge = step(edgeWidth, minDist);\n gl_FragColor = vec4(c.rgb * edge, c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   cells: { type: 'number', uniform: 'cells', defaultValue: 10, min: 2, max: 50 },
   edgeWidth: { type: 'number', uniform: 'edgeWidth', defaultValue: 0.05, min: 0, max: 0.3 }
  }
 });

 Seriously.plugin('voronoi', {
  commonShader: true,
  title: 'Voronoi',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float scale;\nvoid main(void) {\n vec2 uv = vTexCoord * scale;\n vec2 cell = floor(uv);\n vec2 f = fract(uv);\n float minDist = 8.0;\n vec2 minCell = cell;\n for (int i = -1; i <= 1; i++) {\n  for (int j = -1; j <= 1; j++) {\n   vec2 nc = cell + vec2(float(i),float(j));\n   vec2 rp = vec2(fract(sin(dot(nc,vec2(127.1,311.7)))*43758.5453),fract(sin(dot(nc,vec2(269.5,183.3)))*43758.5453));\n   float d = length(f - rp - vec2(float(i),float(j)));\n   if (d < minDist) { minDist = d; minCell = nc; }\n  }\n }\n vec2 sampleUV = (minCell + 0.5) / scale;\n gl_FragColor = texture2D(source, clamp(sampleUV, 0.0, 1.0));\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   scale: { type: 'number', uniform: 'scale', defaultValue: 10, min: 2, max: 50 }
  }
 });

 Seriously.plugin('crosshatch', {
  commonShader: true,
  title: 'Crosshatch',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float spacing;\nuniform vec2 resolution;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float lum = dot(c.rgb, vec3(0.299,0.587,0.114));\n vec2 px = vTexCoord * resolution;\n float h1 = mod(px.x + px.y, spacing);\n float h2 = mod(px.x - px.y, spacing);\n float line1 = step(spacing * (1.0-lum), h1);\n float line2 = step(spacing * (1.0-lum) * 0.5, h2);\n float pattern = min(line1, line2);\n gl_FragColor = vec4(vec3(pattern), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   spacing: { type: 'number', uniform: 'spacing', defaultValue: 8, min: 2, max: 30 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('gradient-map', {
  commonShader: true,
  title: 'Gradient Map',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'void main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float lum = dot(c.rgb, vec3(0.299,0.587,0.114));\n gl_FragColor = texture2D(source2, vec2(lum, 0.5));\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image', title: 'Gradient' }
  }
 });

 Seriously.plugin('chroma-key', {
  commonShader: true,
  title: 'Chroma Key',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform vec3 keyColor;\nuniform float threshold;\nuniform float softness;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float diff = distance(c.rgb, keyColor);\n float mask = smoothstep(threshold - softness, threshold + softness, diff);\n vec4 bg = texture2D(source2, vTexCoord);\n gl_FragColor = mix(bg, c, mask);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image', title: 'Background' },
   keyColor: { type: 'vector', uniform: 'keyColor', defaultValue: [0, 1, 0] },
   threshold: { type: 'number', uniform: 'threshold', defaultValue: 0.3, min: 0, max: 1 },
   softness: { type: 'number', uniform: 'softness', defaultValue: 0.1, min: 0, max: 0.5 }
  }
 });

 Seriously.plugin('color-replace', {
  commonShader: true,
  title: 'Color Replace',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform vec3 sourceColor;\nuniform vec3 targetColor;\nuniform float threshold;\nuniform float softness;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float diff = distance(c.rgb, sourceColor);\n float mask = 1.0 - smoothstep(threshold - softness, threshold + softness, diff);\n gl_FragColor = vec4(mix(c.rgb, targetColor, mask), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   sourceColor: { type: 'vector', uniform: 'sourceColor', defaultValue: [1, 0, 0] },
   targetColor: { type: 'vector', uniform: 'targetColor', defaultValue: [0, 0, 1] },
   threshold: { type: 'number', uniform: 'threshold', defaultValue: 0.3, min: 0, max: 1 },
   softness: { type: 'number', uniform: 'softness', defaultValue: 0.1, min: 0, max: 0.5 }
  }
 });

 Seriously.plugin('exposure', {
  commonShader: true,
  title: 'Exposure',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float exposure;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n gl_FragColor = clamp(vec4(c.rgb * pow(2.0, exposure), c.a), 0.0, 1.0);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   exposure: { type: 'number', uniform: 'exposure', defaultValue: 0, min: -5, max: 5 }
  }
 });

 Seriously.plugin('shadow-highlight', {
  commonShader: true,
  title: 'Shadow/Highlight',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float shadowAmount;\nuniform float highlightAmount;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float lum = dot(c.rgb, vec3(0.299,0.587,0.114));\n float shadowMask = smoothstep(0.5, 0.0, lum);\n float highlightMask = smoothstep(0.5, 1.0, lum);\n vec3 adj = c.rgb + shadowMask * shadowAmount - highlightMask * highlightAmount;\n gl_FragColor = vec4(clamp(adj, 0.0, 1.0), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   shadowAmount: { type: 'number', uniform: 'shadowAmount', defaultValue: 0.2, min: -1, max: 1 },
   highlightAmount: { type: 'number', uniform: 'highlightAmount', defaultValue: 0.1, min: -1, max: 1 }
  }
 });

 Seriously.plugin('clarity', {
  commonShader: true,
  title: 'Clarity',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nuniform vec2 resolution;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n vec2 px = 5.0 / resolution;\n vec4 blur = vec4(0.0);\n blur += texture2D(source, vTexCoord + vec2(-px.x, 0)) * 0.25;\n blur += texture2D(source, vTexCoord) * 0.5;\n blur += texture2D(source, vTexCoord + vec2(px.x, 0)) * 0.25;\n vec4 highMid = c - blur;\n float lum = dot(c.rgb, vec3(0.299,0.587,0.114));\n float midMask = 1.0 - abs(lum * 2.0 - 1.0);\n gl_FragColor = clamp(c + highMid * amount * midMask, 0.0, 1.0);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 0.5, min: -1, max: 2 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('dehaze', {
  commonShader: true,
  title: 'Dehaze',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nuniform float transmission;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n vec3 dehazed = (c.rgb - vec3(1.0 - transmission)) / max(transmission, 0.001);\n gl_FragColor = vec4(mix(c.rgb, clamp(dehazed, 0.0, 1.0), amount), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 0.5, min: 0, max: 1 },
   transmission: { type: 'number', uniform: 'transmission', defaultValue: 0.8, min: 0.1, max: 1 }
  }
 });

 Seriously.plugin('hdr', {
  commonShader: true,
  title: 'HDR',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float strength;\nuniform float radius;\nuniform vec2 resolution;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n vec2 px = radius / resolution;\n vec4 blur = vec4(0.0);\n blur += texture2D(source, vTexCoord + vec2(-2)*px) * 0.0625;\n blur += texture2D(source, vTexCoord + vec2(-1)*px) * 0.25;\n blur += texture2D(source, vTexCoord) * 0.375;\n blur += texture2D(source, vTexCoord + vec2(1)*px) * 0.25;\n blur += texture2D(source, vTexCoord + vec2(2)*px) * 0.0625;\n vec4 local = c - blur;\n gl_FragColor = clamp(c + local * strength, 0.0, 1.0);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   strength: { type: 'number', uniform: 'strength', defaultValue: 0.5, min: 0, max: 3 },
   radius: { type: 'number', uniform: 'radius', defaultValue: 20, min: 1, max: 100 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('tone-mapping', {
  commonShader: true,
  title: 'Tone Mapping',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float exposure;\nuniform float whitePoint;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n vec3 x = c.rgb * exposure;\n vec3 mapped = x * (2.51*x + 0.03) / (x * (2.43*x + 0.59) + 0.14);\n mapped /= whitePoint;\n gl_FragColor = vec4(clamp(mapped, 0.0, 1.0), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   exposure: { type: 'number', uniform: 'exposure', defaultValue: 1, min: 0.1, max: 10 },
   whitePoint: { type: 'number', uniform: 'whitePoint', defaultValue: 1, min: 0.1, max: 5 }
  }
 });

 Seriously.plugin('white-balance', {
  commonShader: true,
  title: 'White Balance',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform vec3 whitePoint;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n gl_FragColor = vec4(clamp(c.rgb / whitePoint, 0.0, 1.0), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   whitePoint: { type: 'vector', uniform: 'whitePoint', defaultValue: [1, 1, 1] }
  }
 });

 Seriously.plugin('color-grading', {
  commonShader: true,
  title: 'Color Grading',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform vec3 lift;\nuniform vec3 gamma;\nuniform vec3 gain;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n vec3 g = lift + c.rgb * (gain - lift);\n g = pow(max(g, 0.0), 1.0 / max(gamma, vec3(0.001)));\n gl_FragColor = vec4(clamp(g, 0.0, 1.0), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   lift: { type: 'vector', uniform: 'lift', defaultValue: [0, 0, 0] },
   gamma: { type: 'vector', uniform: 'gamma', defaultValue: [1, 1, 1] },
   gain: { type: 'vector', uniform: 'gain', defaultValue: [1, 1, 1] }
  }
 });

 Seriously.plugin('gamma', {
  commonShader: true,
  title: 'Gamma',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float gamma;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n gl_FragColor = vec4(pow(max(c.rgb, 0.0), vec3(1.0 / gamma)), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   gamma: { type: 'number', uniform: 'gamma', defaultValue: 1, min: 0.1, max: 4 }
  }
 });

 Seriously.plugin('rgb-split', {
  commonShader: true,
  title: 'RGB Split',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform vec2 rOffset;\nuniform vec2 gOffset;\nuniform vec2 bOffset;\nvoid main(void) {\n float r = texture2D(source, vTexCoord + rOffset).r;\n float g = texture2D(source, vTexCoord + gOffset).g;\n float b = texture2D(source, vTexCoord + bOffset).b;\n float a = texture2D(source, vTexCoord).a;\n gl_FragColor = vec4(r, g, b, a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   rOffset: { type: 'vector', uniform: 'rOffset', defaultValue: [-0.01, 0] },
   gOffset: { type: 'vector', uniform: 'gOffset', defaultValue: [0, 0] },
   bOffset: { type: 'vector', uniform: 'bOffset', defaultValue: [0.01, 0] }
  }
 });

 Seriously.plugin('alpha-mask', {
  commonShader: true,
  title: 'Alpha Mask',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform bool invert;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float mask = dot(texture2D(source2, vTexCoord).rgb, vec3(0.299,0.587,0.114));\n if (invert) mask = 1.0 - mask;\n gl_FragColor = vec4(c.rgb, c.a * mask);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image', title: 'Mask' },
   invert: { type: 'boolean', uniform: 'invert', defaultValue: false }
  }
 });

 Seriously.plugin('premultiply', {
  commonShader: true,
  title: 'Premultiply Alpha',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'void main(void) {\n vec4 c = texture2D(source, vTexCoord);\n gl_FragColor = vec4(c.rgb * c.a, c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' }
  }
 });

 Seriously.plugin('unpremultiply', {
  commonShader: true,
  title: 'Unpremultiply Alpha',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'void main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float a = c.a + 0.0001;\n gl_FragColor = vec4(c.rgb / a, c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' }
  }
 });

 Seriously.plugin('set-alpha', {
  commonShader: true,
  title: 'Set Alpha',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float alpha;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n gl_FragColor = vec4(c.rgb, alpha);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   alpha: { type: 'number', uniform: 'alpha', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('gradient', {
  commonShader: true,
  title: 'Gradient',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform vec4 colorA;\nuniform vec4 colorB;\nuniform float angle;\nvoid main(void) {\n float rad = angle * 3.14159 / 180.0;\n vec2 dir = vec2(cos(rad), sin(rad));\n float t = dot(vTexCoord - 0.5, dir) + 0.5;\n gl_FragColor = mix(colorA, colorB, clamp(t, 0.0, 1.0));\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   colorA: { type: 'vector', uniform: 'colorA', defaultValue: [0, 0, 0, 1] },
   colorB: { type: 'vector', uniform: 'colorB', defaultValue: [1, 1, 1, 1] },
   angle: { type: 'number', uniform: 'angle', defaultValue: 0, min: 0, max: 360 }
  }
 });

 Seriously.plugin('radial-gradient', {
  commonShader: true,
  title: 'Radial Gradient',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform vec4 colorA;\nuniform vec4 colorB;\nuniform vec2 center;\nuniform float radius;\nvoid main(void) {\n float t = length(vTexCoord - center) / radius;\n gl_FragColor = mix(colorA, colorB, clamp(t, 0.0, 1.0));\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   colorA: { type: 'vector', uniform: 'colorA', defaultValue: [1, 1, 1, 1] },
   colorB: { type: 'vector', uniform: 'colorB', defaultValue: [0, 0, 0, 0] },
   center: { type: 'vector', uniform: 'center', defaultValue: [0.5, 0.5] },
   radius: { type: 'number', uniform: 'radius', defaultValue: 0.5, min: 0, max: 2 }
  }
 });

 Seriously.plugin('solid-color', {
  commonShader: true,
  title: 'Solid Color',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: 'precision mediump float;\nuniform vec4 color;\nvoid main(void) {\n gl_FragColor = color;\n}\n'
   };
  },
  inputs: {
   color: { type: 'vector', uniform: 'color', defaultValue: [1, 0, 0, 1] }
  }
 });

 Seriously.plugin('checker', {
  commonShader: true,
  title: 'Checkerboard',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: 'precision mediump float;\nvarying vec2 vTexCoord;\nuniform vec4 colorA;\nuniform vec4 colorB;\nuniform vec2 tiles;\nvoid main(void) {\n vec2 c = floor(vTexCoord * tiles);\n float check = mod(c.x + c.y, 2.0);\n gl_FragColor = mix(colorA, colorB, check);\n}\n'
   };
  },
  inputs: {
   colorA: { type: 'vector', uniform: 'colorA', defaultValue: [1, 1, 1, 1] },
   colorB: { type: 'vector', uniform: 'colorB', defaultValue: [0, 0, 0, 1] },
   tiles: { type: 'vector', uniform: 'tiles', defaultValue: [8, 8] }
  }
 });

 Seriously.plugin('stripes', {
  commonShader: true,
  title: 'Stripes',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: 'precision mediump float;\nvarying vec2 vTexCoord;\nuniform vec4 colorA;\nuniform vec4 colorB;\nuniform float frequency;\nuniform float angle;\nvoid main(void) {\n float rad = angle * 3.14159 / 180.0;\n float t = dot(vTexCoord, vec2(cos(rad), sin(rad)));\n float stripe = step(0.5, fract(t * frequency));\n gl_FragColor = mix(colorA, colorB, stripe);\n}\n'
   };
  },
  inputs: {
   colorA: { type: 'vector', uniform: 'colorA', defaultValue: [1, 1, 1, 1] },
   colorB: { type: 'vector', uniform: 'colorB', defaultValue: [0, 0, 0, 1] },
   frequency: { type: 'number', uniform: 'frequency', defaultValue: 10, min: 1, max: 100 },
   angle: { type: 'number', uniform: 'angle', defaultValue: 0, min: 0, max: 360 }
  }
 });

 Seriously.plugin('dots', {
  commonShader: true,
  title: 'Dots Pattern',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: 'precision mediump float;\nvarying vec2 vTexCoord;\nuniform vec4 colorA;\nuniform vec4 colorB;\nuniform float frequency;\nuniform float radius;\nvoid main(void) {\n vec2 grid = fract(vTexCoord * frequency) - 0.5;\n float dot = step(length(grid), radius);\n gl_FragColor = mix(colorB, colorA, dot);\n}\n'
   };
  },
  inputs: {
   colorA: { type: 'vector', uniform: 'colorA', defaultValue: [1, 1, 1, 1] },
   colorB: { type: 'vector', uniform: 'colorB', defaultValue: [0, 0, 0, 1] },
   frequency: { type: 'number', uniform: 'frequency', defaultValue: 10, min: 1, max: 100 },
   radius: { type: 'number', uniform: 'radius', defaultValue: 0.3, min: 0, max: 0.5 }
  }
 });

 Seriously.plugin('crop', {
  commonShader: true,
  title: 'Crop',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform vec4 rect;\nvoid main(void) {\n vec2 uv = vTexCoord * vec2(rect.z - rect.x, rect.w - rect.y) + vec2(rect.x, rect.y);\n if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0)\n  gl_FragColor = vec4(0.0);\n else\n  gl_FragColor = texture2D(source, uv);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   rect: { type: 'vector', uniform: 'rect', defaultValue: [0, 0, 1, 1] }
  }
 });

 Seriously.plugin('transform', {
  commonShader: true,
  title: 'Transform',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform vec2 translate;\nuniform float rotate;\nuniform vec2 scale;\nvoid main(void) {\n vec2 uv = vTexCoord - 0.5;\n float s = sin(rotate);\n float c = cos(rotate);\n uv = vec2(c*uv.x - s*uv.y, s*uv.x + c*uv.y);\n uv /= scale;\n uv += 0.5 - translate;\n if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0)\n  gl_FragColor = vec4(0.0);\n else\n  gl_FragColor = texture2D(source, uv);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   translate: { type: 'vector', uniform: 'translate', defaultValue: [0, 0] },
   rotate: { type: 'number', uniform: 'rotate', defaultValue: 0, min: -3.14159, max: 3.14159 },
   scale: { type: 'vector', uniform: 'scale', defaultValue: [1, 1] }
  }
 });

 Seriously.plugin('flip', {
  commonShader: true,
  title: 'Flip',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform bool flipX;\nuniform bool flipY;\nvoid main(void) {\n vec2 uv = vTexCoord;\n if (flipX) uv.x = 1.0 - uv.x;\n if (flipY) uv.y = 1.0 - uv.y;\n gl_FragColor = texture2D(source, uv);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   flipX: { type: 'boolean', uniform: 'flipX', defaultValue: false },
   flipY: { type: 'boolean', uniform: 'flipY', defaultValue: false }
  }
 });

 Seriously.plugin('tile', {
  commonShader: true,
  title: 'Tile',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform vec2 tiles;\nuniform vec2 offset;\nvoid main(void) {\n vec2 uv = fract(vTexCoord * tiles + offset);\n gl_FragColor = texture2D(source, uv);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   tiles: { type: 'vector', uniform: 'tiles', defaultValue: [2, 2] },
   offset: { type: 'vector', uniform: 'offset', defaultValue: [0, 0] }
  }
 });

 Seriously.plugin('scroll', {
  commonShader: true,
  title: 'Scroll',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform vec2 offset;\nvoid main(void) {\n gl_FragColor = texture2D(source, fract(vTexCoord + offset));\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   offset: { type: 'vector', uniform: 'offset', defaultValue: [0, 0] }
  }
 });

 Seriously.plugin('spin', {
  commonShader: true,
  title: 'Spin',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float angle;\nuniform vec2 center;\nvoid main(void) {\n vec2 uv = vTexCoord - center;\n float s = sin(angle);\n float c = cos(angle);\n uv = vec2(c*uv.x - s*uv.y, s*uv.x + c*uv.y);\n uv += center;\n if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0)\n  gl_FragColor = vec4(0.0);\n else\n  gl_FragColor = texture2D(source, uv);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   angle: { type: 'number', uniform: 'angle', defaultValue: 0, min: -3.14159, max: 3.14159 },
   center: { type: 'vector', uniform: 'center', defaultValue: [0.5, 0.5] }
  }
 });

 Seriously.plugin('perspective', {
  commonShader: true,
  title: 'Perspective',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float tiltX;\nuniform float tiltY;\nvoid main(void) {\n vec2 uv = vTexCoord - 0.5;\n float px = 1.0 + uv.x * tiltX;\n float py = 1.0 + uv.y * tiltY;\n uv = vec2(uv.x / px, uv.y / py) + 0.5;\n if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0)\n  gl_FragColor = vec4(0.0);\n else\n  gl_FragColor = texture2D(source, uv);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   tiltX: { type: 'number', uniform: 'tiltX', defaultValue: 0, min: -2, max: 2 },
   tiltY: { type: 'number', uniform: 'tiltY', defaultValue: 0, min: -2, max: 2 }
  }
 });

 Seriously.plugin('shear', {
  commonShader: true,
  title: 'Shear',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float shearX;\nuniform float shearY;\nvoid main(void) {\n vec2 uv = vTexCoord;\n uv.x += (uv.y - 0.5) * shearX;\n uv.y += (uv.x - 0.5) * shearY;\n if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0)\n  gl_FragColor = vec4(0.0);\n else\n  gl_FragColor = texture2D(source, uv);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   shearX: { type: 'number', uniform: 'shearX', defaultValue: 0, min: -2, max: 2 },
   shearY: { type: 'number', uniform: 'shearY', defaultValue: 0, min: -2, max: 2 }
  }
 });

 Seriously.plugin('polar', {
  commonShader: true,
  title: 'Polar Coordinates',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform bool toPolar;\nvoid main(void) {\n vec2 uv;\n if (toPolar) {\n  vec2 c = vTexCoord * 2.0 - 1.0;\n  float r = length(c);\n  float a = atan(c.y, c.x) / (2.0 * 3.14159) + 0.5;\n  uv = vec2(a, r);\n } else {\n  float angle = (vTexCoord.x - 0.5) * 2.0 * 3.14159;\n  float radius = vTexCoord.y;\n  uv = vec2(cos(angle), sin(angle)) * radius * 0.5 + 0.5;\n }\n gl_FragColor = texture2D(source, fract(uv));\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   toPolar: { type: 'boolean', uniform: 'toPolar', defaultValue: true }
  }
 });

 Seriously.plugin('blend-add', {
  commonShader: true,
  title: 'Blend Add',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n gl_FragColor = clamp(a + b * amount, 0.0, 1.0);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('blend-subtract', {
  commonShader: true,
  title: 'Blend Subtract',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n gl_FragColor = clamp(a - b * amount, 0.0, 1.0);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('blend-divide', {
  commonShader: true,
  title: 'Blend Divide',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec4 d = clamp(a / (b + 0.001), 0.0, 1.0);\n gl_FragColor = mix(a, d, amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('blend-pinlight', {
  commonShader: true,
  title: 'Blend Pin Light',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec3 p;\n for (int i = 0; i < 3; i++) {\n  float ai = (i==0)?a.r:(i==1)?a.g:a.b;\n  float bi = (i==0)?b.r:(i==1)?b.g:b.b;\n  if (bi < 0.5) p[i] = min(ai, 2.0*bi);\n  else p[i] = max(ai, 2.0*bi - 1.0);\n }\n gl_FragColor = mix(a, vec4(p, a.a), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('blend-vivid-light', {
  commonShader: true,
  title: 'Blend Vivid Light',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec3 vl;\n for (int i = 0; i < 3; i++) {\n  float ai = (i==0)?a.r:(i==1)?a.g:a.b;\n  float bi = (i==0)?b.r:(i==1)?b.g:b.b;\n  if (bi < 0.5) vl[i] = 1.0 - clamp((1.0-ai)/(2.0*bi+0.001), 0.0, 1.0);\n  else vl[i] = clamp(ai/(2.0*(1.0-bi)+0.001), 0.0, 1.0);\n }\n gl_FragColor = mix(a, vec4(vl, a.a), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('blend-linear-light', {
  commonShader: true,
  title: 'Blend Linear Light',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec3 ll = clamp(a.rgb + 2.0*b.rgb - 1.0, 0.0, 1.0);\n gl_FragColor = mix(a, vec4(ll, a.a), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('blend-hard-mix', {
  commonShader: true,
  title: 'Blend Hard Mix',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec3 hm = step(1.0, a.rgb + b.rgb);\n gl_FragColor = mix(a, vec4(hm, a.a), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('blend-negation', {
  commonShader: true,
  title: 'Blend Negation',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec3 n = 1.0 - abs(1.0 - a.rgb - b.rgb);\n gl_FragColor = mix(a, vec4(n, a.a), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('blend-phoenix', {
  commonShader: true,
  title: 'Blend Phoenix',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec3 p = min(a.rgb, b.rgb) - max(a.rgb, b.rgb) + 1.0;\n gl_FragColor = mix(a, vec4(p, a.a), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('blend-reflect', {
  commonShader: true,
  title: 'Blend Reflect',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec3 r = clamp(a.rgb * a.rgb / (1.0 - b.rgb + 0.001), 0.0, 1.0);\n gl_FragColor = mix(a, vec4(r, a.a), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('blend-glow', {
  commonShader: true,
  title: 'Blend Glow',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec3 g = clamp(b.rgb * b.rgb / (1.0 - a.rgb + 0.001), 0.0, 1.0);\n gl_FragColor = mix(a, vec4(g, a.a), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('blend-freeze', {
  commonShader: true,
  title: 'Blend Freeze',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec3 f = clamp(1.0 - (1.0-a.rgb)*(1.0-a.rgb)/(b.rgb+0.001), 0.0, 1.0);\n gl_FragColor = mix(a, vec4(f, a.a), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('blend-heat', {
  commonShader: true,
  title: 'Blend Heat',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec3 h = clamp(1.0 - (1.0-b.rgb)*(1.0-b.rgb)/(a.rgb+0.001), 0.0, 1.0);\n gl_FragColor = mix(a, vec4(h, a.a), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('blend-stamp', {
  commonShader: true,
  title: 'Blend Stamp',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec3 s = clamp(2.0*a.rgb + b.rgb - 1.0, 0.0, 1.0);\n gl_FragColor = mix(a, vec4(s, a.a), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('blend-xor', {
  commonShader: true,
  title: 'Blend XOR',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float amount;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec3 x = abs(a.rgb - b.rgb);\n gl_FragColor = mix(a, vec4(x, a.a), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('mix3', {
  commonShader: true,
  title: 'Mix 3 Sources',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.triple +
     'uniform float mix1;\nuniform float mix2;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec4 c = texture2D(source3, vTexCoord);\n float total = mix1 + mix2 + (1.0 - mix1 - mix2);\n gl_FragColor = (a * mix1 + b * mix2 + c * (1.0-mix1-mix2));\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   source3: { type: 'image' },
   mix1: { type: 'number', uniform: 'mix1', defaultValue: 0.33, min: 0, max: 1 },
   mix2: { type: 'number', uniform: 'mix2', defaultValue: 0.33, min: 0, max: 1 }
  }
 });

 Seriously.plugin('transition-fade', {
  commonShader: true,
  title: 'Transition: Fade',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float progress;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n gl_FragColor = mix(a, b, progress);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   progress: { type: 'number', uniform: 'progress', defaultValue: 0, min: 0, max: 1 }
  }
 });

 Seriously.plugin('transition-wipe', {
  commonShader: true,
  title: 'Transition: Wipe',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float progress;\nuniform float angle;\nvoid main(void) {\n float rad = angle * 3.14159 / 180.0;\n float t = dot(vTexCoord - 0.5, vec2(cos(rad), sin(rad))) + 0.5;\n float mask = step(t, progress);\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n gl_FragColor = mix(a, b, mask);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   progress: { type: 'number', uniform: 'progress', defaultValue: 0, min: 0, max: 1 },
   angle: { type: 'number', uniform: 'angle', defaultValue: 0, min: 0, max: 360 }
  }
 });

 Seriously.plugin('transition-dissolve', {
  commonShader: true,
  title: 'Transition: Dissolve',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float progress;\nuniform float seed;\nfloat rand(vec2 co) { return fract(sin(dot(co.xy, vec2(12.9898+seed, 78.233))) * 43758.5453); }\nvoid main(void) {\n float noise = rand(vTexCoord);\n float mask = step(noise, progress);\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n gl_FragColor = mix(a, b, mask);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   progress: { type: 'number', uniform: 'progress', defaultValue: 0, min: 0, max: 1 },
   seed: { type: 'number', uniform: 'seed', defaultValue: 0 }
  }
 });

 Seriously.plugin('transition-zoom', {
  commonShader: true,
  title: 'Transition: Zoom',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float progress;\nvoid main(void) {\n vec2 uv = (vTexCoord - 0.5) / (1.0 - progress + 0.0001) + 0.5;\n if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0)\n  gl_FragColor = texture2D(source2, vTexCoord);\n else\n  gl_FragColor = mix(texture2D(source, uv), texture2D(source2, vTexCoord), progress);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   progress: { type: 'number', uniform: 'progress', defaultValue: 0, min: 0, max: 1 }
  }
 });

 Seriously.plugin('transition-slide', {
  commonShader: true,
  title: 'Transition: Slide',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float progress;\nuniform vec2 direction;\nvoid main(void) {\n vec2 uvA = vTexCoord - direction * progress;\n vec2 uvB = vTexCoord + direction * (1.0 - progress);\n vec4 a = (uvA.x>=0.0&&uvA.x<=1.0&&uvA.y>=0.0&&uvA.y<=1.0) ? texture2D(source, uvA) : vec4(0.0);\n vec4 b = (uvB.x>=0.0&&uvB.x<=1.0&&uvB.y>=0.0&&uvB.y<=1.0) ? texture2D(source2, uvB) : vec4(0.0);\n gl_FragColor = a + b;\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   progress: { type: 'number', uniform: 'progress', defaultValue: 0, min: 0, max: 1 },
   direction: { type: 'vector', uniform: 'direction', defaultValue: [1, 0] }
  }
 });

 Seriously.plugin('transition-circle', {
  commonShader: true,
  title: 'Transition: Circle',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float progress;\nuniform vec2 center;\nvoid main(void) {\n float dist = length(vTexCoord - center);\n float mask = step(dist, progress * 0.8);\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n gl_FragColor = mix(a, b, mask);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   progress: { type: 'number', uniform: 'progress', defaultValue: 0, min: 0, max: 1 },
   center: { type: 'vector', uniform: 'center', defaultValue: [0.5, 0.5] }
  }
 });

 Seriously.plugin('transition-blinds', {
  commonShader: true,
  title: 'Transition: Blinds',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float progress;\nuniform float count;\nuniform bool horizontal;\nvoid main(void) {\n float t = horizontal ? vTexCoord.y : vTexCoord.x;\n float stripe = fract(t * count);\n float mask = step(stripe, progress);\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n gl_FragColor = mix(a, b, mask);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   progress: { type: 'number', uniform: 'progress', defaultValue: 0, min: 0, max: 1 },
   count: { type: 'number', uniform: 'count', defaultValue: 10, min: 1, max: 50 },
   horizontal: { type: 'boolean', uniform: 'horizontal', defaultValue: true }
  }
 });

 Seriously.plugin('transition-ripple', {
  commonShader: true,
  title: 'Transition: Ripple',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float progress;\nuniform float frequency;\nvoid main(void) {\n vec2 uv = vTexCoord;\n float ripple = sin(length(uv - 0.5) * frequency - progress * 10.0) * (1.0-progress) * 0.05;\n uv += ripple;\n vec4 a = texture2D(source, clamp(uv, 0.0, 1.0));\n vec4 b = texture2D(source2, vTexCoord);\n gl_FragColor = mix(a, b, progress);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   progress: { type: 'number', uniform: 'progress', defaultValue: 0, min: 0, max: 1 },
   frequency: { type: 'number', uniform: 'frequency', defaultValue: 20, min: 1, max: 100 }
  }
 });

 Seriously.plugin('transition-flash', {
  commonShader: true,
  title: 'Transition: Flash',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float progress;\nuniform float flashIntensity;\nvoid main(void) {\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n float flash = flashIntensity * (1.0 - abs(progress * 2.0 - 1.0));\n vec4 base = mix(a, b, progress);\n gl_FragColor = clamp(base + flash, 0.0, 1.0);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   progress: { type: 'number', uniform: 'progress', defaultValue: 0, min: 0, max: 1 },
   flashIntensity: { type: 'number', uniform: 'flashIntensity', defaultValue: 1, min: 0, max: 3 }
  }
 });

 Seriously.plugin('transition-glitch', {
  commonShader: true,
  title: 'Transition: Glitch',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float progress;\nfloat rand(float n) { return fract(sin(n) * 43758.5453); }\nvoid main(void) {\n vec2 uv = vTexCoord;\n float band = floor(uv.y * 20.0);\n float glitchAmt = rand(band + floor(progress * 20.0)) * progress;\n uv.x = fract(uv.x + glitchAmt * 0.2 - 0.1);\n vec4 a = texture2D(source, uv);\n vec4 b = texture2D(source2, vTexCoord);\n gl_FragColor = mix(a, b, progress);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   progress: { type: 'number', uniform: 'progress', defaultValue: 0, min: 0, max: 1 }
  }
 });

 Seriously.plugin('transition-burn', {
  commonShader: true,
  title: 'Transition: Burn',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.dual +
     'uniform float progress;\nfloat rand(vec2 co) { return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453); }\nvoid main(void) {\n float noise = rand(vTexCoord + floor(progress * 30.0));\n float edge = smoothstep(progress - 0.1, progress, noise);\n float mask = step(noise, progress);\n vec4 a = texture2D(source, vTexCoord);\n vec4 b = texture2D(source2, vTexCoord);\n vec4 burn = vec4(1.0, 0.5, 0.0, 1.0);\n gl_FragColor = mix(mix(a, burn, edge), b, mask);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   source2: { type: 'image' },
   progress: { type: 'number', uniform: 'progress', defaultValue: 0, min: 0, max: 1 }
  }
 });

 Seriously.plugin('ascii', {
  commonShader: true,
  title: 'ASCII Art',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float cellSize;\nuniform vec2 resolution;\nvoid main(void) {\n vec2 cellPos = floor(vTexCoord * resolution / cellSize) * cellSize / resolution;\n float lum = dot(texture2D(source, cellPos + cellSize * 0.5 / resolution).rgb, vec3(0.299,0.587,0.114));\n vec2 uv = fract(vTexCoord * resolution / cellSize);\n float dotPat = step(abs(uv.x - 0.5) + abs(uv.y - 0.5), lum * 0.5);\n gl_FragColor = vec4(vec3(dotPat), 1.0);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   cellSize: { type: 'number', uniform: 'cellSize', defaultValue: 8, min: 2, max: 32 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('pointillism', {
  commonShader: true,
  title: 'Pointillism',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float dotSize;\nuniform vec2 resolution;\nvoid main(void) {\n vec2 gridPos = floor(vTexCoord * resolution / dotSize);\n vec2 cellCenter = (gridPos + 0.5) * dotSize / resolution;\n vec4 col = texture2D(source, cellCenter);\n float lum = dot(col.rgb, vec3(0.299,0.587,0.114));\n float dist = length(vTexCoord - cellCenter) / (dotSize * 0.5 / resolution.x);\n float dot = step(dist, lum);\n gl_FragColor = mix(vec4(1.0), col, dot);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   dotSize: { type: 'number', uniform: 'dotSize', defaultValue: 6, min: 2, max: 30 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('cubism', {
  commonShader: true,
  title: 'Cubism',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float size;\nuniform vec2 resolution;\nfloat rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453); }\nvoid main(void) {\n vec2 gridPos = floor(vTexCoord * resolution / size);\n float r = rand(gridPos);\n vec2 offset = vec2(rand(gridPos + 0.1), rand(gridPos + 0.2)) * 2.0 - 1.0;\n vec2 sampleUV = (gridPos + 0.5 + offset * 0.3) * size / resolution;\n gl_FragColor = texture2D(source, clamp(sampleUV, 0.0, 1.0));\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   size: { type: 'number', uniform: 'size', defaultValue: 20, min: 5, max: 100 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('dithering', {
  commonShader: true,
  title: 'Dithering',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float levels;\nuniform vec2 resolution;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n vec2 px = vTexCoord * resolution;\n mat4 bayer = mat4(\n  0.0/16.0, 8.0/16.0, 2.0/16.0, 10.0/16.0,\n  12.0/16.0,4.0/16.0,14.0/16.0, 6.0/16.0,\n  3.0/16.0,11.0/16.0, 1.0/16.0, 9.0/16.0,\n  15.0/16.0,7.0/16.0,13.0/16.0, 5.0/16.0\n );\n int ix = int(mod(px.x, 4.0));\n int iy = int(mod(px.y, 4.0));\n float threshold = bayer[iy][ix];\n vec3 quantized = floor(c.rgb * levels + threshold) / levels;\n gl_FragColor = vec4(quantized, c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   levels: { type: 'number', uniform: 'levels', defaultValue: 4, min: 2, max: 16 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('dream', {
  commonShader: true,
  title: 'Dream',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nuniform float time;\nuniform vec2 resolution;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n vec2 uv = vTexCoord;\n uv.x += sin(uv.y * 8.0 + time * 0.5) * amount * 0.02;\n uv.y += cos(uv.x * 8.0 + time * 0.5) * amount * 0.02;\n vec2 px = 3.0 / resolution;\n vec4 blur = vec4(0.0);\n blur += texture2D(source, uv + vec2(-px.x,-px.y)) * 0.25;\n blur += texture2D(source, uv + vec2(px.x,-px.y)) * 0.25;\n blur += texture2D(source, uv + vec2(-px.x,px.y)) * 0.25;\n blur += texture2D(source, uv + vec2(px.x,px.y)) * 0.25;\n gl_FragColor = mix(c, blur * 1.1, amount * 0.5);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 0.5, min: 0, max: 1 },
   time: { type: 'number', uniform: 'time', defaultValue: 0 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('psychedelic', {
  commonShader: true,
  title: 'Psychedelic',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nuniform float time;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n vec3 psy;\n psy.r = sin(c.r * 3.14159 * 2.0 * amount + time) * 0.5 + 0.5;\n psy.g = sin(c.g * 3.14159 * 2.0 * amount + time + 2.094) * 0.5 + 0.5;\n psy.b = sin(c.b * 3.14159 * 2.0 * amount + time + 4.189) * 0.5 + 0.5;\n gl_FragColor = vec4(mix(c.rgb, psy, amount), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 },
   time: { type: 'number', uniform: 'time', defaultValue: 0 }
  }
 });

 Seriously.plugin('ascii-color', {
  commonShader: true,
  title: 'ASCII Art Color',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float cellSize;\nuniform vec2 resolution;\nvoid main(void) {\n vec2 cellPos = floor(vTexCoord * resolution / cellSize) * cellSize / resolution;\n vec4 col = texture2D(source, cellPos + cellSize * 0.5 / resolution);\n float lum = dot(col.rgb, vec3(0.299,0.587,0.114));\n vec2 uv = fract(vTexCoord * resolution / cellSize);\n float dotPat = step(abs(uv.x - 0.5) + abs(uv.y - 0.5), lum * 0.5);\n gl_FragColor = vec4(col.rgb * dotPat, 1.0);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   cellSize: { type: 'number', uniform: 'cellSize', defaultValue: 8, min: 2, max: 32 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('rainbow', {
  commonShader: true,
  title: 'Rainbow',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nuniform float frequency;\nuniform float angle;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float rad = angle * 3.14159 / 180.0;\n float t = dot(vTexCoord, vec2(cos(rad), sin(rad)));\n vec3 rainbow;\n rainbow.r = sin(t * frequency * 6.28) * 0.5 + 0.5;\n rainbow.g = sin(t * frequency * 6.28 + 2.094) * 0.5 + 0.5;\n rainbow.b = sin(t * frequency * 6.28 + 4.189) * 0.5 + 0.5;\n gl_FragColor = vec4(mix(c.rgb, c.rgb * rainbow, amount), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 0.5, min: 0, max: 1 },
   frequency: { type: 'number', uniform: 'frequency', defaultValue: 5, min: 0.1, max: 50 },
   angle: { type: 'number', uniform: 'angle', defaultValue: 0, min: 0, max: 360 }
  }
 });

 Seriously.plugin('color-shift', {
  commonShader: true,
  title: 'Color Shift',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform vec3 shift;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n gl_FragColor = vec4(fract(c.rgb + shift), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   shift: { type: 'vector', uniform: 'shift', defaultValue: [0.1, 0.2, 0.3] }
  }
 });

 Seriously.plugin('color-quantize', {
  commonShader: true,
  title: 'Color Quantize',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float levels;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n gl_FragColor = vec4(round(c.rgb * levels) / levels, c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   levels: { type: 'number', uniform: 'levels', defaultValue: 8, min: 2, max: 256 }
  }
 });

 Seriously.plugin('negate-channel', {
  commonShader: true,
  title: 'Negate Channel',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform bool negR;\nuniform bool negG;\nuniform bool negB;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n if (negR) c.r = 1.0 - c.r;\n if (negG) c.g = 1.0 - c.g;\n if (negB) c.b = 1.0 - c.b;\n gl_FragColor = c;\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   negR: { type: 'boolean', uniform: 'negR', defaultValue: false },
   negG: { type: 'boolean', uniform: 'negG', defaultValue: false },
   negB: { type: 'boolean', uniform: 'negB', defaultValue: false }
  }
 });

 Seriously.plugin('isolate-channel', {
  commonShader: true,
  title: 'Isolate Channel',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform int channel;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float v = (channel == 0) ? c.r : (channel == 1) ? c.g : c.b;\n gl_FragColor = vec4(v, v, v, c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   channel: { type: 'number', uniform: 'channel', defaultValue: 0, min: 0, max: 2 }
  }
 });

 Seriously.plugin('swap-channels', {
  commonShader: true,
  title: 'Swap Channels',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform int orderR;\nuniform int orderG;\nuniform int orderB;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float r = (orderR==0)?c.r:(orderR==1)?c.g:c.b;\n float g = (orderG==0)?c.r:(orderG==1)?c.g:c.b;\n float b = (orderB==0)?c.r:(orderB==1)?c.g:c.b;\n gl_FragColor = vec4(r, g, b, c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   orderR: { type: 'number', uniform: 'orderR', defaultValue: 0, min: 0, max: 2 },
   orderG: { type: 'number', uniform: 'orderG', defaultValue: 1, min: 0, max: 2 },
   orderB: { type: 'number', uniform: 'orderB', defaultValue: 2, min: 0, max: 2 }
  }
 });

 Seriously.plugin('fade-color', {
  commonShader: true,
  title: 'Fade to Color',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform vec4 fadeColor;\nuniform float amount;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n gl_FragColor = mix(c, fadeColor, amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   fadeColor: { type: 'vector', uniform: 'fadeColor', defaultValue: [0, 0, 0, 1] },
   amount: { type: 'number', uniform: 'amount', defaultValue: 0, min: 0, max: 1 }
  }
 });

 Seriously.plugin('luminosity-mask', {
  commonShader: true,
  title: 'Luminosity Mask',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float minLum;\nuniform float maxLum;\nuniform float softness;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float lum = dot(c.rgb, vec3(0.299,0.587,0.114));\n float mask = smoothstep(minLum - softness, minLum + softness, lum) * (1.0 - smoothstep(maxLum - softness, maxLum + softness, lum));\n gl_FragColor = vec4(c.rgb, c.a * mask);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   minLum: { type: 'number', uniform: 'minLum', defaultValue: 0, min: 0, max: 1 },
   maxLum: { type: 'number', uniform: 'maxLum', defaultValue: 1, min: 0, max: 1 },
   softness: { type: 'number', uniform: 'softness', defaultValue: 0.1, min: 0, max: 0.5 }
  }
 });

 Seriously.plugin('color-dodge-map', {
  commonShader: true,
  title: 'Color Dodge Map',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float lum = dot(c.rgb, vec3(0.299,0.587,0.114));\n vec3 dodge = clamp(c.rgb / (1.0 - lum + 0.01), 0.0, 1.0);\n gl_FragColor = vec4(mix(c.rgb, dodge, amount), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 0.5, min: 0, max: 1 }
  }
 });

 Seriously.plugin('retro-crt', {
  commonShader: true,
  title: 'Retro CRT',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float curvature;\nuniform float scanlineIntensity;\nuniform float vignetteIntensity;\nuniform vec2 resolution;\nvoid main(void) {\n vec2 uv = vTexCoord * 2.0 - 1.0;\n vec2 offset = uv.yx * curvature;\n uv += uv * offset * offset;\n uv = uv * 0.5 + 0.5;\n if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) { gl_FragColor = vec4(0.0); return; }\n vec4 c = texture2D(source, uv);\n float line = mod(floor(uv.y * resolution.y), 2.0);\n c.rgb *= mix(1.0, line, scanlineIntensity);\n vec2 vp = uv - 0.5;\n float vig = 1.0 - dot(vp, vp) * vignetteIntensity;\n c.rgb *= max(vig, 0.0);\n gl_FragColor = c;\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   curvature: { type: 'number', uniform: 'curvature', defaultValue: 0.1, min: 0, max: 0.5 },
   scanlineIntensity: { type: 'number', uniform: 'scanlineIntensity', defaultValue: 0.3, min: 0, max: 1 },
   vignetteIntensity: { type: 'number', uniform: 'vignetteIntensity', defaultValue: 1.5, min: 0, max: 5 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('hologram', {
  commonShader: true,
  title: 'Hologram',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nuniform float time;\nuniform vec2 resolution;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float scan = step(0.5, mod(vTexCoord.y * resolution.y * 0.5 + time * 20.0, 1.0));\n float lum = dot(c.rgb, vec3(0.299,0.587,0.114));\n vec3 holo = vec3(0.0, lum * scan, lum * 0.5) * 1.5;\n float edge = abs(vTexCoord.x - 0.5) * 2.0;\n holo *= (1.0 - edge * 0.3);\n gl_FragColor = vec4(mix(c.rgb, holo, amount), c.a * lum);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 },
   time: { type: 'number', uniform: 'time', defaultValue: 0 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

 Seriously.plugin('x-ray', {
  commonShader: true,
  title: 'X-Ray',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float lum = dot(c.rgb, vec3(0.299,0.587,0.114));\n vec3 xray = vec3(1.0 - lum);\n xray = pow(xray, vec3(0.5)) * vec3(0.8, 0.9, 1.0);\n gl_FragColor = vec4(mix(c.rgb, xray, amount), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 }
  }
 });

 Seriously.plugin('deep-fry', {
  commonShader: true,
  title: 'Deep Fry',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nuniform float sharpness;\nuniform float saturation;\nuniform float noise;\nuniform float seed;\nfloat rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898+seed, 78.233))) * 43758.5453); }\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float avg = dot(c.rgb, vec3(0.299,0.587,0.114));\n c.rgb = mix(vec3(avg), c.rgb, saturation);\n c.rgb = (c.rgb - 0.5) * sharpness + 0.5;\n float n = rand(vTexCoord) * noise;\n c.rgb = clamp(c.rgb + n, 0.0, 1.0);\n c.r = pow(c.r, 0.7);\n c.g = pow(c.g, 0.8);\n gl_FragColor = mix(texture2D(source, vTexCoord), clamp(c, 0.0, 1.0), amount);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 },
   sharpness: { type: 'number', uniform: 'sharpness', defaultValue: 5, min: 1, max: 20 },
   saturation: { type: 'number', uniform: 'saturation', defaultValue: 3, min: 0, max: 10 },
   noise: { type: 'number', uniform: 'noise', defaultValue: 0.1, min: 0, max: 1 },
   seed: { type: 'number', uniform: 'seed', defaultValue: 0 }
  }
 });

 Seriously.plugin('matrix', {
  commonShader: true,
  title: 'Matrix',
  shader: function () {
   return {
    vertex: commonShaders.vertex.standard,
    fragment: commonShaders.fragment.standard +
     'uniform float amount;\nuniform float time;\nuniform vec2 resolution;\nvoid main(void) {\n vec4 c = texture2D(source, vTexCoord);\n float lum = dot(c.rgb, vec3(0.299,0.587,0.114));\n vec2 px = floor(vTexCoord * resolution / 8.0);\n float rain = fract(sin(px.x * 127.1 + floor(time * 3.0 + px.x * 0.1)) * 43758.5453);\n float col = fract(sin(px.x * 91.3) * 43758.5453);\n float active = step(0.7, rain);\n float trail = fract(vTexCoord.y - time * 0.3 + col) * active;\n vec3 mtx = vec3(0.0, trail * lum, 0.0);\n gl_FragColor = vec4(mix(c.rgb, mtx, amount), c.a);\n}\n'
   };
  },
  inputs: {
   source: { type: 'image' },
   amount: { type: 'number', uniform: 'amount', defaultValue: 1, min: 0, max: 1 },
   time: { type: 'number', uniform: 'time', defaultValue: 0 },
   resolution: { type: 'vector', uniform: 'resolution', defaultValue: [1280, 720] }
  }
 });

}));
