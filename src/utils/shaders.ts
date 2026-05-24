const vertShaderDefault = `#version 300 es
precision highp float;

layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aColor;

out vec3 outColor;

void main() {
  gl_Position = vec4(aPos, 1.0);
  outColor = aColor;
}
`;

const fragShaderDefault = `#version 300 es
precision highp float;

in vec3 outColor;
out vec4 FragColor;

uniform vec3 iResolution;
uniform float iTime;

void main() {

  vec2 uv = gl_FragCoord.xy / iResolution.xy;

  FragColor = vec4(uv.x, abs(sin(iTime)), uv.y, 1.0);
}
`;

export { vertShaderDefault, fragShaderDefault };
