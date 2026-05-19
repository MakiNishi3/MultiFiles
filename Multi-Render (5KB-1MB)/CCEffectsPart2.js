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

function shader(vs, fs, inputs) {
return {
shader: function (inputs, shaderSource) {
shaderSource.vertex = vs;
shaderSource.fragment = fs;
},
inputs: inputs
};
}

Seriously.plugin('ccdistort', shader(
'precision mediump float;attribute vec2 position;varying vec2 vTexCoord;void main(){vTexCoord=position*0.5+0.5;gl_Position=vec4(position,0.0,1.0);}',
'precision mediump float;varying vec2 vTexCoord;uniform sampler2D source;uniform float strength;void main(){vec2 uv=vTexCoord;uv+=sin(uv.yx*10.0)*0.01*strength;gl_FragColor=texture2D(source,uv);}',
{ source:{type:'image'}, strength:{type:'number',defaultValue:1,min:0,max:5} }
));

Seriously.plugin('cclenscorrection', shader(
'attribute vec2 position;varying vec2 vTexCoord;void main(){vTexCoord=position*0.5+0.5;gl_Position=vec4(position,0.0,1.0);}',
'precision mediump float;varying vec2 vTexCoord;uniform sampler2D source;uniform float k;void main(){vec2 uv=vTexCoord*2.0-1.0;float r=dot(uv,uv);uv*=1.0+k*r;gl_FragColor=texture2D(source,uv*0.5+0.5);}',
{ source:{type:'image'}, k:{type:'number',defaultValue:0.2,min:-1,max:1} }
));

Seriously.plugin('ccsolarize', shader(
'attribute vec2 position;varying vec2 vTexCoord;void main(){vTexCoord=position*0.5+0.5;gl_Position=vec4(position,0.0,1.0);}',
'precision mediump float;varying vec2 vTexCoord;uniform sampler2D source;void main(){vec4 c=texture2D(source,vTexCoord);c.rgb=step(0.5,c.rgb)*c.rgb+(1.0-step(0.5,c.rgb))*(1.0-c.rgb);gl_FragColor=c;}',
{ source:{type:'image'} }
));

Seriously.plugin('ccsketch', shader(
'attribute vec2 position;varying vec2 vTexCoord;void main(){vTexCoord=position*0.5+0.5;gl_Position=vec4(position,0.0,1.0);}',
'precision mediump float;varying vec2 vTexCoord;uniform sampler2D source;void main(){float g=dot(texture2D(source,vTexCoord).rgb,vec3(0.299,0.587,0.114));gl_FragColor=vec4(vec3(1.0-g),1.0);}',
{ source:{type:'image'} }
));

Seriously.plugin('ccsharpen', shader(
'attribute vec2 position;varying vec2 vTexCoord;void main(){vTexCoord=position*0.5+0.5;gl_Position=vec4(position,0.0,1.0);}',
'precision mediump float;varying vec2 vTexCoord;uniform sampler2D source;uniform float amount;void main(){vec2 px=vec2(1.0)/vec2(textureSize(source,0));vec4 c=texture2D(source,vTexCoord)* (1.0+4.0*amount);c-=texture2D(source,vTexCoord+vec2(px.x,0.0))*amount;c-=texture2D(source,vTexCoord-vec2(px.x,0.0))*amount;c-=texture2D(source,vTexCoord+vec2(0.0,px.y))*amount;c-=texture2D(source,vTexCoord-vec2(0.0,px.y))*amount;gl_FragColor=c;}',
{ source:{type:'image'}, amount:{type:'number',defaultValue:1,min:0,max:5} }
));

Seriously.plugin('ccrgbdisplacement', shader(
'attribute vec2 position;varying vec2 vTexCoord;void main(){vTexCoord=position*0.5+0.5;gl_Position=vec4(position,0.0,1.0);}',
'precision mediump float;varying vec2 vTexCoord;uniform sampler2D source;uniform float shift;void main(){float r=texture2D(source,vTexCoord+vec2(shift,0.0)).r;float g=texture2D(source,vTexCoord).g;float b=texture2D(source,vTexCoord-vec2(shift,0.0)).b;gl_FragColor=vec4(r,g,b,1.0);}',
{ source:{type:'image'}, shift:{type:'number',defaultValue:0.01,min:0,max:0.1} }
));

Seriously.plugin('cctwirl', shader(
'attribute vec2 position;varying vec2 vTexCoord;void main(){vTexCoord=position*0.5+0.5;gl_Position=vec4(position,0.0,1.0);}',
'precision mediump float;varying vec2 vTexCoord;uniform sampler2D source;uniform float strength;void main(){vec2 uv=vTexCoord-0.5;float r=length(uv);float a=atan(uv.y,uv.x)+strength*r;uv=vec2(cos(a),sin(a))*r;gl_FragColor=texture2D(source,uv+0.5);}',
{ source:{type:'image'}, strength:{type:'number',defaultValue:2,min:0,max:10} }
));

Seriously.plugin('ccsqueeze', shader(
'attribute vec2 position;varying vec2 vTexCoord;void main(){vTexCoord=position*0.5+0.5;gl_Position=vec4(position,0.0,1.0);}',
'precision mediump float;varying vec2 vTexCoord;uniform sampler2D source;uniform float factor;void main(){vec2 uv=vTexCoord;uv.y=pow(uv.y,factor);gl_FragColor=texture2D(source,uv);}',
{ source:{type:'image'}, factor:{type:'number',defaultValue:1.5,min:0.1,max:5} }
));

Seriously.plugin('ccshake', shader(
'attribute vec2 position;varying vec2 vTexCoord;void main(){vTexCoord=position*0.5+0.5;gl_Position=vec4(position,0.0,1.0);}',
'precision mediump float;varying vec2 vTexCoord;uniform sampler2D source;uniform float time;void main(){vec2 uv=vTexCoord+vec2(sin(time*10.0)*0.01,cos(time*15.0)*0.01);gl_FragColor=texture2D(source,uv);}',
{ source:{type:'image'}, time:{type:'number'} }
));

Seriously.plugin('cccustomseriouslyplugin', shader(
'attribute vec2 position;varying vec2 vTexCoord;void main(){vTexCoord=position*0.5+0.5;gl_Position=vec4(position,0.0,1.0);}',
'precision mediump float;varying vec2 vTexCoord;uniform sampler2D source;uniform float mixAmount;void main(){vec4 c=texture2D(source,vTexCoord);gl_FragColor=mix(c,vec4(c.bgr,1.0),mixAmount);}',
{ source:{type:'image'}, mixAmount:{type:'number',defaultValue:0.5,min:0,max:1} }
));

return Seriously;

}));
