import type IRGBAColor from "../color";
import type INode      from "../Node/INode";


export default interface IScene
{
    setColor(color: IRGBAColor): void;
    getColor()                 : IRGBAColor;

    insertNode(node: INode): boolean;
    removeNode(node: INode): boolean;

    getViewportNodes(): INode[];
}