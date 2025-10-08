import type INode                from "../../../core/Node/INode";
import type Node                 from "../../../core/Node/Node";
import type IScene               from "../../../core/Scene/IScene";
import type { IProgramRenderer } from "../../ProgramProxy";



export default class ColorProgramRenderer implements IProgramRenderer<Node>
{
    
    
    private nodes: INode[] = [];

    
    /**
     * 
     * @param gl 
     * @param program 
     * @param scene 
     */
    public render(gl: WebGLRenderingContext, program: WebGLProgram, scene: IScene): void 
    {
        const projectionMatrixUniform = gl.getUniformLocation(program, 'uMatP');
        const cameraMatrixUniform     = gl.getUniformLocation(program, 'uMatV');
        const localMatrixUniform      = gl.getUniformLocation(program, 'uMat');
        const colorUniform            = gl.getUniformLocation(program, 'uColor');
        
        const positionAttributeLocation = gl.getAttribLocation(program, "aPos");
        const vertexBuffer              = gl.createBuffer();

        gl.uniformMatrix3fv(projectionMatrixUniform, false, scene.getProjectionMatrix().elements);
        gl.uniformMatrix3fv(cameraMatrixUniform,     false, scene.getCameraMatrix().elements);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        this.nodes = scene.getViewportNodes('COLOR');

        for (let i = 0; i < this.nodes.length; i++)
        {   
            gl.bufferData(
                gl.ARRAY_BUFFER, 
                new Float32Array(this.nodes[i].getGeometry()), 
                gl.STATIC_DRAW
            );
            
            gl.uniformMatrix3fv(
                localMatrixUniform, 
                false, 
                this.nodes[i].getLocalMatrix().elements
            );

            gl.uniform4f(
                colorUniform, 
                this.nodes[i].getColor().r, 
                this.nodes[i].getColor().g, 
                this.nodes[i].getColor().b, 
                this.nodes[i].getColor().a
            );
            
            gl.drawArrays(gl.TRIANGLES, 0, this.nodes[i].getGeometry().length / 2);
        }
    }

}