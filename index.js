var Scene = /** @class */ (function () {
    function Scene() {
        this.color = { r: 0, g: 0, b: 0, a: 1 };
        this.nodes = [];
    }
    Scene.prototype.render = function () {
    };
    Scene.prototype.setColor = function (color) {
        this.color = color;
    };
    Scene.prototype.getColor = function () {
        return this.color;
    };
    Scene.prototype.insertNode = function (node) {
        this.nodes.push(node);
        return true;
    };
    Scene.prototype.removeNode = function (node) {
        var index = this.nodes.indexOf(node);
        var res = this.nodes.splice(index, 1);
        if (res.length)
            return true;
        return false;
    };
    return Scene;
}());
var Engine = /** @class */ (function () {
    function Engine() {
        this.scenes = [];
        this.activeSceneIndex = 0;
    }
    ;
    Engine.Instance = function () {
        return this.instance || (this.instance = new this());
    };
    Engine.prototype.insertScene = function (scene) {
        this.scenes.push(scene);
    };
    Engine.prototype.getActiveScene = function () {
        return this.scenes[this.activeSceneIndex] || null;
    };
    return Engine;
}());
var fragmentShader = "\n    void main(void)\n    {\n        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n    }\n";
var vertexShader = "\n    attribute vec3 aVertexPosition;\n\n    uniform mat4 uMVMatrix;\n    uniform mat4 uPMatrix;\n\n    void main(void)\n    {\n        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n    }\n";
/**
 *
 * @param gl
 * @param source
 * @param type
 * @returns
 */
var makeShader = function (gl, source, type) {
    var shader = gl.createShader(type);
    if (!shader)
        return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("Fragment shader wasn't compile " + gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
};
/**
 *
 * @param gl
 * @param fShader
 * @param vShader
 * @returns
 */
var makeShaderProgram = function (gl, fShader, vShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.warn("Shader program has not been inited");
        return null;
    }
    return program;
};
var render = function (scene, gl) {
    if (!gl)
        return;
    var sceneColor = scene.getColor();
    gl.clearColor(sceneColor.r, sceneColor.g, sceneColor.b, sceneColor.a);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
};
var main = function () {
    var canvas = document.querySelector('#canvas-gl');
    var gl = canvas.getContext('webgl');
    var scene = new Scene();
    Engine.Instance().insertScene(scene);
    requestAnimationFrame(function () {
        if (gl)
            render(scene, gl);
    });
};
main();
