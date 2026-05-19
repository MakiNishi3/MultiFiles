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
		vertex: 'precision mediump float;\nattribute vec4 position;\nattribute vec2 texCoord;\nuniform mat4 transform;\nvarying vec2 vTexCoord;\nvoid main(void) {\ngl_Position = transform * position;\nvTexCoord = vec2(texCoord.x, 1.0 - texCoord.y);\n}',
		common: 'precision mediump float;\nvarying vec2 vTexCoord;\nuniform sampler2D source;\nuniform vec2 resolution;\n'
	};

	// 1. Invert
	Seriously.plugin('invert', {
		commonShader: true,
		shader: function (inputs, shaderSource) {
			shaderSource.vertex = commonShaders.vertex;
			shaderSource.fragment = commonShaders.common +
				'void main(void) {\n' +
				'vec4 c = texture2D(source, vTexCoord);\n' +
				'gl_FragColor = vec4(1.0 - c.r, 1.0 - c.g, 1.0 - c.b, c.a);\n' +
				'}\n';
			return shaderSource;
		},
		inputs: {
			source: { type: 'image', uniform: 'source' }
		},
		title: 'Invert'
	});

	// 2. Grayscale
	Seriously.plugin('grayscale', {
		commonShader: true,
		shader: function (inputs, shaderSource) {
			shaderSource.vertex = commonShaders.vertex;
			shaderSource.fragment = commonShaders.common +
				'void main(void) {\n' +
				'vec4 c = texture2D(source, vTexCoord);\n' +
				'float g = dot(c.rgb, vec3(0.299, 0.587, 0.114));\n' +
				'gl_FragColor = vec4(g, g, g, c.a);\n' +
				'}\n';
			return shaderSource;
		},
		inputs: {
			source: { type: 'image', uniform: 'source' }
		},
		title: 'Grayscale'
	});

	// 3. Brightness / Contrast
	Seriously.plugin('brightnesscontrast', {
		commonShader: true,
		shader: function (inputs, shaderSource) {
			shaderSource.vertex = commonShaders.vertex;
			shaderSource.fragment = commonShaders.common +
				'uniform float brightness;\n' +
				'uniform float contrast;\n' +
				'void main(void) {\n' +
				'vec4 c = texture2D(source, vTexCoord);\n' +
				'vec3 col = c.rgb + brightness;\n' +
				'col = (col - 0.5) * (contrast + 1.0) + 0.5;\n' +
				'gl_FragColor = vec4(clamp(col, 0.0, 1.0), c.a);\n' +
				'}\n';
			return shaderSource;
		},
		inputs: {
			source:     { type: 'image',  uniform: 'source' },
			brightness: { type: 'number', uniform: 'brightness', defaultValue: 0.0, min: -1.0, max: 1.0 },
			contrast:   { type: 'number', uniform: 'contrast',   defaultValue: 0.0, min: -1.0, max: 1.0 }
		},
		title: 'Brightness / Contrast'
	});

	// 4. Hue / Saturation
	Seriously.plugin('huesaturation', {
		commonShader: true,
		shader: function (inputs, shaderSource) {
			shaderSource.vertex = commonShaders.vertex;
			shaderSource.fragment = commonShaders.common +
				'uniform float hue;\n' +
				'uniform float saturation;\n' +
				'vec3 rgb2hsv(vec3 c) {\n' +
				'vec4 K = vec4(0.0,-1.0/3.0,2.0/3.0,-1.0);\n' +
				'vec4 p = mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g));\n' +
				'vec4 q = mix(vec4(p.xyw,c.r),vec4(c.r,p.yzx),step(p.x,c.r));\n' +
				'float d=q.x-min(q.w,q.y); float e=1.0e-10;\n' +
				'return vec3(abs(q.z+(q.w-q.y)/(6.0*d+e)),d/(q.x+e),q.x);\n' +
				'}\n' +
				'vec3 hsv2rgb(vec3 c) {\n' +
				'vec4 K=vec4(1.0,2.0/3.0,1.0/3.0,3.0);\n' +
				'vec3 p=abs(fract(c.xxx+K.xyz)*6.0-K.www);\n' +
				'return c.z*mix(K.xxx,clamp(p-K.xxx,0.0,1.0),c.y);\n' +
				'}\n' +
				'void main(void) {\n' +
				'vec4 col = texture2D(source, vTexCoord);\n' +
				'vec3 hsv = rgb2hsv(col.rgb);\n' +
				'hsv.x = fract(hsv.x + hue);\n' +
				'hsv.y = clamp(hsv.y * (1.0 + saturation), 0.0, 1.0);\n' +
				'gl_FragColor = vec4(hsv2rgb(hsv), col.a);\n' +
				'}\n';
			return shaderSource;
		},
		inputs: {
			source:     { type: 'image',  uniform: 'source' },
			hue:        { type: 'number', uniform: 'hue',        defaultValue: 0.0, min: -1.0, max: 1.0 },
			saturation: { type: 'number', uniform: 'saturation', defaultValue: 0.0, min: -1.0, max: 1.0 }
		},
		title: 'Hue / Saturation'
	});

	// 5. Blur (box)
	Seriously.plugin('blur', {
		commonShader: true,
		shader: function (inputs, shaderSource) {
			shaderSource.vertex = commonShaders.vertex;
			shaderSource.fragment = commonShaders.common +
				'uniform float amount;\n' +
				'void main(void) {\n' +
				'vec4 sum = vec4(0.0);\n' +
				'vec2 px = amount / resolution;\n' +
				'for(int x=-2;x<=2;x++) for(int y=-2;y<=2;y++) {\n' +
				'sum += texture2D(source, vTexCoord + vec2(float(x),float(y))*px);\n' +
				'}\n' +
				'gl_FragColor = sum / 25.0;\n' +
				'}\n';
			return shaderSource;
		},
		inputs: {
			source: { type: 'image',  uniform: 'source' },
			amount: { type: 'number', uniform: 'amount', defaultValue: 1.0, min: 0.0, max: 20.0 }
		},
		title: 'Blur'
	});

	// 6. Sepia
	Seriously.plugin('sepia', {
		commonShader: true,
		shader: function (inputs, shaderSource) {
			shaderSource.vertex = commonShaders.vertex;
			shaderSource.fragment = commonShaders.common +
				'uniform float amount;\n' +
				'void main(void) {\n' +
				'vec4 c = texture2D(source, vTexCoord);\n' +
				'float r = dot(c.rgb, vec3(0.393,0.769,0.189));\n' +
				'float g = dot(c.rgb, vec3(0.349,0.686,0.168));\n' +
				'float b = dot(c.rgb, vec3(0.272,0.534,0.131));\n' +
				'gl_FragColor = vec4(mix(c.rgb, vec3(r,g,b), amount), c.a);\n' +
				'}\n';
			return shaderSource;
		},
		inputs: {
			source: { type: 'image',  uniform: 'source' },
			amount: { type: 'number', uniform: 'amount', defaultValue: 1.0, min: 0.0, max: 1.0 }
		},
		title: 'Sepia'
	});

	// 7. Vignette
	Seriously.plugin('vignette', {
		commonShader: true,
		shader: function (inputs, shaderSource) {
			shaderSource.vertex = commonShaders.vertex;
			shaderSource.fragment = commonShaders.common +
				'uniform float size;\n' +
				'uniform float amount;\n' +
				'void main(void) {\n' +
				'vec4 c = texture2D(source, vTexCoord);\n' +
				'vec2 uv = vTexCoord - 0.5;\n' +
				'float d = length(uv);\n' +
				'float v = smoothstep(size, size - 0.3, d);\n' +
				'gl_FragColor = vec4(c.rgb * mix(1.0, v, amount), c.a);\n' +
				'}\n';
			return shaderSource;
		},
		inputs: {
			source: { type: 'image',  uniform: 'source' },
			size:   { type: 'number', uniform: 'size',   defaultValue: 0.5, min: 0.0, max: 1.0 },
			amount: { type: 'number', uniform: 'amount', defaultValue: 1.0, min: 0.0, max: 1.0 }
		},
		title: 'Vignette'
	});

	// 8. Pixelate
	Seriously.plugin('pixelate', {
		commonShader: true,
		shader: function (inputs, shaderSource) {
			shaderSource.vertex = commonShaders.vertex;
			shaderSource.fragment = commonShaders.common +
				'uniform float size;\n' +
				'void main(void) {\n' +
				'vec2 px = size / resolution;\n' +
				'vec2 uv = floor(vTexCoord / px) * px + px * 0.5;\n' +
				'gl_FragColor = texture2D(source, uv);\n' +
				'}\n';
			return shaderSource;
		},
		inputs: {
			source: { type: 'image',  uniform: 'source' },
			size:   { type: 'number', uniform: 'size',   defaultValue: 8.0, min: 1.0, max: 64.0 }
		},
		title: 'Pixelate'
	});

	// 9. Posterize
	Seriously.plugin('posterize', {
		commonShader: true,
		shader: function (inputs, shaderSource) {
			shaderSource.vertex = commonShaders.vertex;
			shaderSource.fragment = commonShaders.common +
				'uniform float levels;\n' +
				'void main(void) {\n' +
				'vec4 c = texture2D(source, vTexCoord);\n' +
				'gl_FragColor = vec4(floor(c.rgb * levels) / levels, c.a);\n' +
				'}\n';
			return shaderSource;
		},
		inputs: {
			source: { type: 'image',  uniform: 'source' },
			levels: { type: 'number', uniform: 'levels', defaultValue: 4.0, min: 2.0, max: 16.0 }
		},
		title: 'Posterize'
	});

	// 10. Threshold
	Seriously.plugin('threshold', {
		commonShader: true,
		shader: function (inputs, shaderSource) {
			shaderSource.vertex = commonShaders.vertex;
			shaderSource.fragment = commonShaders.common +
				'uniform float threshold;\n' +
				'void main(void) {\n' +
				'vec4 c = texture2D(source, vTexCoord);\n' +
				'float g = dot(c.rgb, vec3(0.299,0.587,0.114));\n' +
				'float v = step(threshold, g);\n' +
				'gl_FragColor = vec4(v, v, v, c.a);\n' +
				'}\n';
			return shaderSource;
		},
		inputs: {
			source:    { type: 'image',  uniform: 'source' },
			threshold: { type: 'number', uniform: 'threshold', defaultValue: 0.5, min: 0.0, max: 1.0 }
		},
		title: 'Threshold'
	});

	// 11. Color Overlay
	Seriously.plugin('coloroverlay', {
		commonShader: true,
		shader: function (inputs, shaderSource) {
			shaderSource.vertex = commonShaders.vertex;
			shaderSource.fragment = commonShaders.common +
				'uniform vec4 color;\n' +
				'uniform float amount;\n' +
				'void main(void) {\n' +
				'vec4 c = texture2D(source, vTexCoord);\n' +
				'gl_FragColor = mix(c, vec4(color.rgb, c.a), amount * color.a);\n' +
				'}\n';
			return shaderSource;
		},
		inputs: {
			source: { type: 'image',  uniform: 'source' },
			color:  { type: 'color',  uniform: 'color',  defaultValue: [1.0, 0.0, 0.0, 1.0] },
			amount: { type: 'number', uniform: 'amount', defaultValue: 0.5, min: 0.0, max: 1.0 }
		},
		title: 'Color Overlay'
	});

	// 12. Flip
	Seriously.plugin('flip', {
		commonShader: true,
		shader: function (inputs, shaderSource) {
			shaderSource.vertex = commonShaders.vertex;
			shaderSource.fragment = commonShaders.common +
				'uniform bool horizontal;\n' +
				'uniform bool vertical;\n' +
				'void main(void) {\n' +
				'vec2 uv = vTexCoord;\n' +
				'if(horizontal) uv.x = 1.0 - uv.x;\n' +
				'if(vertical)   uv.y = 1.0 - uv.y;\n' +
				'gl_FragColor = texture2D(source, uv);\n' +
				'}\n';
			return shaderSource;
		},
		inputs: {
			source:     { type: 'image',   uniform: 'source' },
			horizontal: { type: 'boolean', uniform: 'horizontal', defaultValue: false },
			vertical:   { type: 'boolean', uniform: 'vertical',   defaultValue: false }
		},
		title: 'Flip'
	});

	// 13. Crop
	Seriously.plugin('crop', {
		commonShader: true,
		shader: function (inputs, shaderSource) {
			shaderSource.vertex = commonShaders.vertex;
			shaderSource.fragment = commonShaders.common +
				'uniform vec4 rect;\n' +
				'void main(void) {\n' +
				'vec2 uv = rect.xy + vTexCoord * rect.zw;\n' +
				'if(uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {\n' +
				'gl_FragColor = vec4(0.0);\n' +
				'} else {\n' +
				'gl_FragColor = texture2D(source, uv);\n' +
				'}\n' +
				'}\n';
			return shaderSource;
		},
		inputs: {
			source: { type: 'image', uniform: 'source' },
			rect:   { type: 'vec4',  uniform: 'rect',   defaultValue: [0.0, 0.0, 1.0, 1.0] }
		},
		title: 'Crop'
	});

	// 14. Chromatic Aberration
	Seriously.plugin('chromaticaberration', {
		commonShader: true,
		shader: function (inputs, shaderSource) {
			shaderSource.vertex = commonShaders.vertex;
			shaderSource.fragment = commonShaders.common +
				'uniform float amount;\n' +
				'void main(void) {\n' +
				'vec2 dir = (vTexCoord - 0.5) * amount / resolution;\n' +
				'float r = texture2D(source, vTexCoord - dir).r;\n' +
				'float g = texture2D(source, vTexCoord).g;\n' +
				'float b = texture2D(source, vTexCoord + dir).b;\n' +
				'gl_FragColor = vec4(r, g, b, texture2D(source, vTexCoord).a);\n' +
				'}\n';
			return shaderSource;
		},
		inputs: {
			source: { type: 'image',  uniform: 'source' },
			amount: { type: 'number', uniform: 'amount', defaultValue: 3.0, min: 0.0, max: 20.0 }
		},
		title: 'Chromatic Aberration'
	});

	// 15. Scanlines
	Seriously.plugin('scanlines', {
		commonShader: true,
		shader: function (inputs, shaderSource) {
			shaderSource.vertex = commonShaders.vertex;
			shaderSource.fragment = commonShaders.common +
				'uniform float count;\n' +
				'uniform float intensity;\n' +
				'void main(void) {\n' +
				'vec4 c = texture2D(source, vTexCoord);\n' +
				'float line = mod(floor(vTexCoord.y * count), 2.0);\n' +
				'gl_FragColor = vec4(c.rgb * mix(1.0, line, intensity), c.a);\n' +
				'}\n';
			return shaderSource;
		},
		inputs: {
			source:    { type: 'image',  uniform: 'source' },
			count:     { type: 'number', uniform: 'count',     defaultValue: 240.0, min: 10.0, max: 1080.0 },
			intensity: { type: 'number', uniform: 'intensity', defaultValue: 0.5,   min: 0.0,  max: 1.0 }
		},
		title: 'Scanlines'
	});

	// 16. Noise
	Seriously.plugin('noise', {
		commonShader: true,
		shader: function (inputs, shaderSource) {
			shaderSource.vertex = commonShaders.vertex;
			shaderSource.fragment = commonShaders.common +
				'uniform float amount;\n' +
				'uniform float seed;\n' +
				'float rand(vec2 co) {\n' +
				'return fract(sin(dot(co, vec2(12.9898,78.233)) + seed) * 43758.5453);\n' +
				'}\n' +
				'void main(void) {\n' +
				'vec4 c = texture2D(source, vTexCoord);\n' +
				'float n = rand(vTexCoord) * 2.0 - 1.0;\n' +
				'gl_FragColor = vec4(clamp(c.rgb + n * amount, 0.0, 1.0), c.a);\n' +
				'}\n';
			return shaderSource;
		},
		inputs: {
			source: { type: 'image',  uniform: 'source' },
			amount: { type: 'number', uniform: 'amount', defaultValue: 0.1, min: 0.0, max: 1.0 },
			seed:   { type: 'number', uniform: 'seed',   defaultValue: 0.0, min: 0.0, max: 100.0 }
		},
		title: 'Noise'
	});

	// 17. Blend (two sources)
	Seriously.plugin('blend', {
		commonShader: true,
		shader: function (inputs, shaderSource) {
			shaderSource.vertex = commonShaders.vertex;
			shaderSource.fragment = commonShaders.common +
				'uniform sampler2D overlay;\n' +
				'uniform float amount;\n' +
				'void main(void) {\n' +
				'vec4 a = texture2D(source,  vTexCoord);\n' +
				'vec4 b = texture2D(overlay, vTexCoord);\n' +
				'gl_FragColor = mix(a, b, amount * b.a);\n' +
				'}\n';
			return shaderSource;
		},
		inputs: {
			source:  { type: 'image',  uniform: 'source' },
			overlay: { type: 'image',  uniform: 'overlay' },
			amount:  { type: 'number', uniform: 'amount',  defaultValue: 0.5, min: 0.0, max: 1.0 }
		},
		title: 'Blend'
	});

	// 18. Displacement Map
	Seriously.plugin('displacement', {
		commonShader: true,
		shader: function (inputs, shaderSource) {
			shaderSource.vertex = commonShaders.vertex;
			shaderSource.fragment = commonShaders.common +
				'uniform sampler2D map;\n' +
				'uniform float scaleX;\n' +
				'uniform float scaleY;\n' +
				'void main(void) {\n' +
				'vec4 d = texture2D(map, vTexCoord);\n' +
				'vec2 offset = (d.rg - 0.5) * vec2(scaleX, scaleY) / resolution;\n' +
				'gl_FragColor = texture2D(source, vTexCoord + offset);\n' +
				'}\n';
			return shaderSource;
		},
		inputs: {
			source: { type: 'image',  uniform: 'source' },
			map:    { type: 'image',  uniform: 'map' },
			scaleX: { type: 'number', uniform: 'scaleX', defaultValue: 20.0, min: -100.0, max: 100.0 },
			scaleY: { type: 'number', uniform: 'scaleY', defaultValue: 20.0, min: -100.0, max: 100.0 }
		},
		title: 'Displacement Map'
	});

	// 19. Emboss
	Seriously.plugin('emboss', {
		commonShader: true,
		shader: function (inputs, shaderSource) {
			shaderSource.vertex = commonShaders.vertex;
			shaderSource.fragment = commonShaders.common +
				'uniform float amount;\n' +
				'void main(void) {\n' +
				'vec2 px = 1.0 / resolution;\n' +
				'vec4 c  = texture2D(source, vTexCoord);\n' +
				'vec4 tl = texture2D(source, vTexCoord + vec2(-px.x, -px.y));\n' +
				'vec4 br = texture2D(source, vTexCoord + vec2( px.x,  px.y));\n' +
				'vec3 emboss = (c.rgb - tl.rgb + br.rgb) * amount + 0.5;\n' +
				'gl_FragColor = vec4(clamp(emboss, 0.0, 1.0), c.a);\n' +
				'}\n';
			return shaderSource;
		},
		inputs: {
			source: { type: 'image',  uniform: 'source' },
			amount: { type: 'number', uniform: 'amount', defaultValue: 1.0, min: 0.0, max: 5.0 }
		},
		title: 'Emboss'
	});

	// 20. Edge Detection
	Seriously.plugin('edge', {
		commonShader: true,
		shader: function (inputs, shaderSource) {
			shaderSource.vertex = commonShaders.vertex;
			shaderSource.fragment = commonShaders.common +
				'uniform float threshold;\n' +
				'void main(void) {\n' +
				'vec2 px = 1.0 / resolution;\n' +
				'float c  = dot(texture2D(source, vTexCoord).rgb,               vec3(0.299,0.587,0.114));\n' +
				'float n  = dot(texture2D(source, vTexCoord+vec2(0.0, px.y)).rgb,  vec3(0.299,0.587,0.114));\n' +
				'float e  = dot(texture2D(source, vTexCoord+vec2(px.x,0.0)).rgb,   vec3(0.299,0.587,0.114));\n' +
				'float ne = dot(texture2D(source, vTexCoord+vec2(px.x,px.y)).rgb,  vec3(0.299,0.587,0.114));\n' +
				'float gx = (c - e) * 2.0 + (n - ne);\n' +
				'float gy = (c - n) * 2.0 + (e - ne);\n' +
				'float edge = sqrt(gx*gx + gy*gy);\n' +
				'float v = step(threshold, edge);\n' +
				'gl_FragColor = vec4(v, v, v, texture2D(source, vTexCoord).a);\n' +
				'}\n';
			return shaderSource;
		},
		inputs: {
			source:    { type: 'image',  uniform: 'source' },
			threshold: { type: 'number', uniform: 'threshold', defaultValue: 0.1, min: 0.0, max: 1.0 }
		},
		title: 'Edge Detection'
	});

}));
