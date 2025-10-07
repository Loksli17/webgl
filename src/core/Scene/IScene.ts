import type IRGBAColor    from "../color";
import type INode         from "../Node/INode";
import type { NODE_TYPE } from "../Node/NodeType";


export default interface IScene
{
    setColor(color: IRGBAColor): void;
    getColor()                 : IRGBAColor;

    insertNode(node: INode): boolean;
    removeNode(node: INode): boolean;

    getViewportNodes(type: NODE_TYPE): INode[];
}