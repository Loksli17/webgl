import type IRGBAColor    from "../color";
import type INode         from "../Node/INode";
import type { NODE_TYPE } from "../Node/NodeType";
import type IScene        from "./IScene";



export default class Scene implements IScene
{

    private color: IRGBAColor = { r: 0.9, g: 0.9, b: 0.9, a: 1 };
    
    private nodes: Map<NODE_TYPE, INode[]> = new Map([
        ['COLOR',   []],
        ['TEXTURE', []],
    ]);

    
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
        this.nodes.get(node.getType())?.push(node);
        return true;
    }
    

    public removeNode(node: INode): boolean 
    {
        const arr = this.nodes.get(node.getType());
        
        if (!arr) return false;

        const index = arr.indexOf(node);
        const res   = arr.splice(index, 1);

        if (res.length) return true;

        return false;
    }


    public getViewportNodes(type: NODE_TYPE): INode[] 
    {
        return this.nodes.get(type) || [];
    }

}