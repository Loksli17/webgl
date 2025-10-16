import type IScene                               from "../core/Scene/IScene";
import type { IProgramProxy, IShaderProgramDTO } from "./ProgramProxy";
import ProgramProxy                              from "./ProgramProxy";
import { makeShader, makeShaderProgram }         from "./utils";



export default class Renderer<T, N>
{

    private programs: IProgramProxy<T, N>[];
    private gl      : WebGLRenderingContext;


    constructor(gl: WebGLRenderingContext, programsDTO: IShaderProgramDTO<T>[])
    {
        this.programs = this.makeShaderPrograms(gl, programsDTO);
        this.gl       = gl;
    }


    public makeShaderPrograms(gl: WebGLRenderingContext, programsDTO: IShaderProgramDTO<T>[]): IProgramProxy<T, N>[]
    {
        const proxy: IProgramProxy<T, N>[] = [];
        
        for (let i = 0; i < programsDTO.length; i++)
        {
            const vertexShader   = makeShader(gl, programsDTO[i].vShaderSource, gl.VERTEX_SHADER);
            const fragmentShader = makeShader(gl, programsDTO[i].fShaderSource, gl.FRAGMENT_SHADER);

            if (!vertexShader)
            {
                console.error(`Error with vertex shader of program with name ${programsDTO[i].type}`);
                return [];
            }

            if (!fragmentShader)
            {
                console.error(`Error with fragment shader of program with name ${programsDTO[i].type}`);
                return [];
            }

            const program = makeShaderProgram(gl, vertexShader, fragmentShader);

            if (!program) return [];

            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);

            proxy.push(new ProgramProxy(program, programsDTO[i].type, programsDTO[i].renderer));
        }

        return proxy;
    }


    /**
     * 
     * @param gl 
     * @param scene 
     */
    private renderScene(scene: IScene)
    {
        const sceneColor = scene.getColor();

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clearColor(sceneColor.r, sceneColor.g, sceneColor.b, sceneColor.a);
        
        //* 3d z-coord
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }


    /**
     * 
     * @param gl 
     * @param scene 
     */
    public render(scene: IScene)
    {
        this.renderScene(scene);

        for (let i = 0; i < this.programs.length; i++)
        {
            this.gl.useProgram(this.programs[i].getGlProgram());
            
            this.programs[i].getRenderer().render(
                this.gl,
                this.programs[i].getGlProgram(),
                scene,
            );
        }
    }
}