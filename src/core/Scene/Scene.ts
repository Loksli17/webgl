import type IRGBAColor from "../color";
import type INode      from "../Node/INode";
import type IScene     from "./IScene";



export default class Scene implements IScene
{

    private color: IRGBAColor = { r: 0, g: 0, b: 0, a: 1 };
    private nodes: INode[]    = [];

    public setColor(color: IRGBAColor): void 
    {
        this.color = color
    }


    public getColor(): IRGBAColor 
    {
        return this.color;
    }

    
    public insertNode(node: INode): boolean 
    {
        this.nodes.push(node);
        return true;
    }
    

    public removeNode(node: INode): boolean 
    {
       const index = this.nodes.indexOf(node);
       const res   = this.nodes.splice(index, 1);

       if (res.length) return true;

       return false;
    }


    public getViewportNodes(): INode[] 
    {
        return this.nodes;    
    }

}