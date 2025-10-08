import type INode                from "../../../core/Node/INode";
import type Node                 from "../../../core/Node/Node";
import type IScene               from "../../../core/Scene/IScene";
import type { IProgramRenderer } from "../../ProgramProxy";



export default class TextureProgramRenderer implements IProgramRenderer<Node>
{
    
    
    private nodes: INode[] = [];


    /**
     * 
     * @param gl 
     * @param buffer 
     * @param location 
     * @param data 
     */
    private handleBuffer(gl: WebGLRenderingContext, buffer: WebGLBuffer, location: number, data: number[]): void
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    }

    
    /**
     * 
     * @param gl 
     * @param program 
     * @param scene 
     */
    public render(gl: WebGLRenderingContext, program: WebGLProgram, scene: IScene): void 
    {
        const texture = gl.createTexture();

        const projectionMatrixUniform = gl.getUniformLocation(program, 'uMatP');
        const cameraMatrixUniform     = gl.getUniformLocation(program, 'uMatV');
        const localMatrixUniform      = gl.getUniformLocation(program, 'uMat');
        const textureLocation         = gl.getUniformLocation(program, 'uTexture');

        const positionAttributeLocation = gl.getAttribLocation(program, "aPos");
        const vertexBuffer              = gl.createBuffer();

        const texPositionAttributeLocation = gl.getAttribLocation(program, "aTexPos");
        const texVertexBuffer              = gl.createBuffer();

        gl.uniformMatrix3fv(projectionMatrixUniform, false, scene.getProjectionMatrix().elements);
        gl.uniformMatrix3fv(cameraMatrixUniform,     false, scene.getCameraMatrix().elements);

        this.nodes = scene.getViewportNodes('TEXTURE');

        for (let i = 0; i < this.nodes.length; i++)
        {
            this.handleBuffer(gl, vertexBuffer, positionAttributeLocation, this.nodes[i].getGeometry());
            this.handleBuffer(gl, texVertexBuffer, texPositionAttributeLocation, [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);

            gl.uniformMatrix3fv(localMatrixUniform, false, this.nodes[i].getLocalMatrix().elements);

            const image = this.nodes[i].getTexture();

            if (image)
            {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

                gl.uniform1i(textureLocation, 0);
            }

            gl.drawArrays(gl.TRIANGLES, 0, this.nodes[i].getGeometry().length / 2);
        }

        // gl.deleteBuffer(texVertexBuffer);
        // gl.deleteBuffer(vertexBuffer);
        gl.deleteTexture(texture);
    }

}