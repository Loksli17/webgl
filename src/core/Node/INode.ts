import type Matrix3x3 from "../../math/Matrix3x3";
import type Vec2      from "../../math/Vector2";



export default interface INode
{
    getGeometry()   : number[];
    getLocalMatrix(): Matrix3x3;

    getSize()          : Vec2;
    setSize(size: Vec2): this;
    
    updateGeometry   (bb: Vec2[])              : this;
    updateBoundingBox(size: Vec2, m: Matrix3x3): this;
}