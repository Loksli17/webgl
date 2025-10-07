import type Matrix3x3  from "../../math/Matrix3x3";
import type Vec2       from "../../math/Vector2";
import type IRGBAColor from "../color";



export default interface INode
{
    getGeometry()   : number[];
    getLocalMatrix(): Matrix3x3;

    getSize()          : Vec2;
    setSize(size: Vec2): this;

    getColor(): IRGBAColor;
    
    updateGeometry   (bb: Vec2[], m: Matrix3x3): this;
    updateBoundingBox(size: Vec2, m: Matrix3x3): this;
}