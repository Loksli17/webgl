import Matrix3x3  from "../../math/Matrix3x3";
import Vec2       from "../../math/Vector2";
import type INode from "./INode";



export default class Node implements INode
{    
    private geometry   : number[];
    private localMatrix: Matrix3x3;
    private boundingBox: [Vec2, Vec2, Vec2, Vec2];
    
    private size: Vec2;

    
    constructor(
        size: Vec2, 
        pos : Vec2 = new Vec2(0, 0)
    )
    {
        this.size        = new Vec2(size.x, size.y);
        this.localMatrix = new Matrix3x3();
        this.geometry    = [0, 0, 0, 0, 0, 0];

        this.localMatrix.elements[6] = pos.x;
        this.localMatrix.elements[7] = pos.y;

        this.boundingBox = [
            new Vec2(0, 0), 
            new Vec2(0, 0), 
            new Vec2(0, 0), 
            new Vec2(0, 0)
        ];

        this.updateBoundingBox(this.size, this.localMatrix);
        this.updateGeometry(this.boundingBox);
    }

    
    public getSize(): Vec2 
    {
        return this.size;
    }


    public getGeometry(): number[] 
    {
        return this.geometry;
    }


    public getLocalMatrix(): Matrix3x3 
    {
        return this.localMatrix;
    }


    public setSize(): this
    {
        return this;
    }


    public updateBoundingBox(size: Vec2, m: Matrix3x3): this
    {
        this.boundingBox[0].set(0, 0).applyMatrix(m);
        this.boundingBox[1].set(size.x, 0).applyMatrix(m);
        this.boundingBox[2].set(size.x, size.y).applyMatrix(m);
        this.boundingBox[3].set(0, size.y).applyMatrix(m);
        
        return this;
    }


    public updateGeometry(bb: Vec2[]): this 
    {        
        //todo calc without position
        
        this.geometry[0] = bb[0].x;
        this.geometry[1] = bb[0].y;

        this.geometry[2] = bb[1].x;
        this.geometry[3] = bb[1].y;

        this.geometry[4] = bb[3].x;
        this.geometry[5] = bb[3].y;

        this.geometry[6] = bb[3].x;
        this.geometry[7] = bb[3].y;
        
        this.geometry[8] = bb[1].x;
        this.geometry[9] = bb[1].y;

        this.geometry[10] = bb[2].x;
        this.geometry[11] = bb[2].y;
        
        return this;
    }
    
}