class pathfinder{
    //parameters
    missing_functions = new Set();
    pi_degree = Math.PI / 180;
    AllPointsMap = new Map();
    Extremes = { x: Infinity, y: Infinity, X: -Infinity, Y: -Infinity };
    slack = 0.01;
    Elements = new Map();
    svgNS = 'http://www.w3.org/2000/svg';
    RAW_Image = ''
    //Alle elementen
    color = 'white';
    stroke_width = 0.2;
constructor(svgNS,object,blocks=new Map()){

    this.svgNS = svgNS;
    this.blocks = blocks;
    this.function_handler(object, this.DataToParse);

}

line(element){//done
    const { AcDbEntity, AcDbLine } = element;

    const {
        [60]: invisible,
        [8]:  layername,
        [48]: linetype_scale
    } = AcDbEntity || {};

    const {
        [10]: x1,
        [20]: y1,
        [11]: x2,
        [21]: y2,
        [39]: stroke_width = this.stroke_width,
    } = AcDbLine || {};

    const line = document.createElementNS(this.svgNS, "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke-width", stroke_width);
            line.setAttribute("stroke", this.color);
    line.setAttribute("stroke-linecap", 'round');

    const index = this.addElement(element);
    this.addLine(x1,y1,x2,y2,index);
    this.addSVG(line,index);

}

arc(element){//done
    const { AcDbEntity, AcDbCircle, AcDbArc } = element;

    const {
        [60]: invisible,
        [8]: layername,
        [48]: linetype_scale
    } = AcDbEntity || {};

    const {
        [10]:x,
        [20]:y,
        [40]:r,
    } = AcDbCircle || {};

    const {
        [50]:StartAngle,
        [51]:EndAngle,
        [39]:stroke_width = this.stroke_width,
    } = AcDbArc || {};

    const path = document.createElementNS(this.svgNS, "path");
    path.setAttribute("stroke-width", stroke_width);
     path.setAttribute("stroke", this.color);
    path.setAttribute("fill", 'none');

    const radianStart = StartAngle * this.pi_degree;
    const radianEnd = EndAngle * this.pi_degree;

    const radius_x = -r;
    const radius_y = -r;
    const startX = x - radius_x * Math.cos(radianStart);
    const startY = y - radius_y * Math.sin(radianStart);
    const endX = (x - (radius_x) * Math.cos(radianEnd)) ;
    const endY = (y - (radius_y) * Math.sin(radianEnd));

    const largeArcFlag = EndAngle - StartAngle <= 180 ? 0 : 1;

    const d = [
        `M ${endX} ${endY}`,
        `A ${radius_x} ${radius_y} 1 ${largeArcFlag} 0 ${startX} ${startY}`
    ].join(' ');

    path.setAttribute("d", pathData);

    const index = this.addElement(element);
    //this.addLine(x1,y1,x2,y2,index);
    this.addPoint(startX, startY,[index]);
    this.addPoint(endX, endY,[index]);
    this.addSVG(path,index);
}
mline(element){//done
    const { AcDbEntity, AcDbMline } = element;

    const {
        [60]: invisible,
        [8]: layername,
        [48]: linetype_scale
    } = AcDbEntity || {};

    const {
        [10]:startXOffset,
        [11]:vertexX,
        [12]:directionX,
        [13]:miterX,

        [20]:startYOffset,
        [21]:vertexY,
        [22]:directionY,
        [23]:miterY,

        [39]:stroke_width = this.stroke_width,
        [41]:scale,
        [42]:areaFill,
        [74]:scale_par,
        [75]:areaFill_par,
    } = AcDbMline || {};


    const index = this.addElement(element);
    //this.addLine(x1,y1,x2,y2,index);

    let startIndex = vertexX.findIndex((x, i) => x === startXOffset && vertexY[i] === startYOffset);

    if (startIndex === -1) {
        console.warn("Start offset not found in vertex data.");
        startIndex = 0;
    }

    let dasharr=[]
    let currentX = vertexX[startIndex];
    let currentY = vertexY[startIndex];
    let currentDirectionX = directionX[startIndex];
    let currentDirectionY = directionY[startIndex];
    let currentMiterX = miterX[startIndex];
    let currentMiterY = miterY[startIndex];

    // Remove the starting point data
    vertexX.splice(startIndex, 1);
    vertexY.splice(startIndex, 1);
    directionX.splice(startIndex, 1);
    directionY.splice(startIndex, 1);
    miterX.splice(startIndex, 1);
    miterY.splice(startIndex, 1);
    scale.splice(startIndex, scale_par[startIndex]);
    scale_par.splice(startIndex,1);

    let path = `M ${currentX} ${currentY}`;



    while (directionX.length > 0) {
        let nextIndex = vertexX.findIndex((x, i) => {
            let dx, dy
            if(x > currentX){
                dx = 1;
            }
            if(x < currentX){
                dx = -1;
            }
            if(x == currentX){
                dx = 0;
            }
            if(vertexY[i] > currentY){
                dy = 1;
            }
            if(vertexY[i] < currentY){
                dy = -1;
            }
            if(vertexY[i] == currentY){
                dy = 0;
            }

            //const dy = vertexY[i] - currentY;
            return dx === currentDirectionX && dy === currentDirectionY;
        });

        if (nextIndex === -1) {
            console.warn("Next point not found.");
            nextIndex = 0;
        }

        // create a variable for the sum and initialize it
        let sum = 0;
        let i = 0
        // iterate over each item in the array
        for (; i < nextIndex-1; i++ ) {
            sum += scale_par[i]; // number of elements that are done for
        };

        let distance_from = 1;

        switch(scale_par[nextIndex]){
            case 0:

                break;
            case 1:
                distance_from = scale[0+sum]

            case 2 :
                distance_from= scale[1+sum]

            case 3 :
                distance_from =scale[2+sum]

        }
        if(distance_from){dasharr.push(distance_from)}
        if(scale_par[nextIndex]>3){
            console.log("alternating not added jet")
        }
        this.addLine(currentX,currentY,vertexX[nextIndex],vertexY[nextIndex],index);
        currentX = vertexX[nextIndex];
        currentY = vertexY[nextIndex];
        currentDirectionX = directionX[nextIndex];
        currentDirectionY = directionY[nextIndex];
        currentMiterX = miterX[nextIndex];
        currentMiterY = miterY[nextIndex];

        path += ` L ${currentX} ${currentY}`;



        vertexX.splice(nextIndex, 1);
        vertexY.splice(nextIndex, 1);
        directionX.splice(nextIndex, 1);
        directionY.splice(nextIndex, 1);
        miterX.splice(nextIndex, 1);
        miterY.splice(nextIndex, 1);
        scale_par.splice(nextIndex, 1);
        scale.splice(sum, scale_par[nextIndex]);
        scale_par.splice(nextIndex,1);

    }
    const pathElement = document.createElementNS(this.svgNS, "path");

    pathElement.setAttribute("d", path);
    //pathElement.setAttribute("stroke-opacity", 0.2);
    pathElement.setAttribute("stroke-dasharray", dasharr);
    pathElement.setAttribute("stroke", this.color);
    pathElement.setAttribute("stroke-width", stroke_width);
    pathElement.setAttribute("fill","none");
    this.addSVG(pathElement,index)
}
lwpolyline(element){//done}
}
circle(element){
    const { AcDbEntity, AcDbCircle } = element;

    const {
        [60]: invisible,
        [8]: layername,
        [48]: linetype_scale
    } = AcDbEntity || {};

    const {
        [10]:x,
        [20]:y,
        [39]:stroke_width = this.stroke_width,
        [40]:r,
    } = AcDbCircle || {};

    const circle = document.createElementNS(this.svgNS, "circle");
    circle.setAttribute("stroke-width", stroke_width);
        circle.setAttribute("stroke", this.color);
    circle.setAttribute("fill", 'none');
}
INSERT_BLOCKS(){}
INSERT_ENTITIES(){}

 attrib(element){
    return this.text(element)
}

 text(element) {//done
    const { AcDbEntity, AcDbText } = element;

    const {
        [60]: invisible,
        [8]: layername,
        [48]: linetype_scale
    } = AcDbEntity || {};

    const {
        [1]: text,
        [7]: font = "Arial",
        [10]: x,
        [20]: y,
        [40]: font_size,
        [50]: rotation = 0,
        [71]: mirror = 0,
        /*2 = Text is backward (mirrored in X)
         4 = Text is upside down (mirrored in Y) */
        [72]: horizon = 0,
        /*0 = Left
         1 = Center                           *
         2 = Right
         3 = Aligned (if vertical alignment = 0)
         4 = Middle (if vertical alignment = 0)
         5 = Fit (if vertical alignment = 0) */
        [73]: vertical = 0,
      /*0 = Baseline
        1 = Bottom
        2 = Middle
        3 = Top*/
    } = AcDbText || {};


    const TEXT = document.createElementNS(this.svgNS, "text");
   let scale_x;
   let  scale_y;
    switch(mirror){
        case(2):
            scale_x = 1;
            scale_y = -1;
        break;
        case(4):
            scale_x = -1;
            scale_y = 1;
        break;
        default:
            scale_x = 1;
            scale_y = -1;
    }


    switch(horizon){
        case(0):
            TEXT.setAttribute("text-anchor", "start");
            break;
        case(1):
            TEXT.setAttribute("text-anchor", "middle");
            break;
        case(2):
            TEXT.setAttribute("text-anchor", "end");
            break;
        case(3):
            TEXT.setAttribute("text-anchor", "middle");
            break;
        case(4):
            TEXT.setAttribute("text-anchor", "middle");
            break;
        case(5):
            TEXT.setAttribute("text-anchor", "middle");
            break;
        default:
            TEXT.setAttribute("text-anchor", "start");
    }

    switch(vertical){
        case(0):
            TEXT.setAttribute("dominant-baseline", "auto");
            break;
        case(1):
            TEXT.setAttribute("dominant-baseline", "hanging");
            break;
        case(2):
            TEXT.setAttribute("dominant-baseline", "middle");
            break;
        case(3):
            TEXT.setAttribute("dominant-baseline", "top");
            break;
        default:
            TEXT.setAttribute("dominant-baseline", "auto");
    }

    TEXT.setAttribute("text-anchor", "start");
    TEXT.setAttribute("transform", `scale(${scale_x} ${scale_y}) translate(${x} ${-y}) rotate(${rotation})`);
    TEXT.setAttribute("fill", this.color);


    TEXT.setAttribute("font-family", font);

    TEXT.setAttribute("font-size", font_size);
    TEXT.setAttribute("stroke-width", 0.1);
    TEXT.textContent = text;
    const index = this.addElement(TEXT);
    this.addSVG(TEXT,index)

}

 mtext(element) {
    const { AcDbEntity, AcDbMText } = element;
    return this.text({AcDbEntity, AcDbText:AcDbMText});
}

 insert(element){//done
   const { AcDbEntity, AcDbBlockReference } = element;
   const {
       [60]: invisible,
       [8]: layername,
       [48]: linetype_scale
   } = AcDbEntity || {};

   const {
       [2]: naam,
       [10]: x,
       [20]: y,
       [41]: scale_x = 1,
       [42]: scale_y = 1,
       [50]: rotation = 0
   } = AcDbBlockReference || {};

    //if(this.blocks.has(naam)){
        const index = this.addElement(element);
        const INSERT = document.createElementNS(this.svgNS, "use");
        INSERT.setAttribute("href", `#${naam}`);
        INSERT.setAttribute("x", x);
        INSERT.setAttribute("y", y);
        INSERT.setAttribute("transform", `scale(${scale_x} ${scale_y}) translate(${x} ${y}) rotate(${rotation})`);
        this.addSVG(INSERT,index);
    //}

    }

GlobalData = {
    LINE: this.line.bind(this),
    ARC: this.arc.bind(this),
    MLINE: this.mline.bind(this),
    LWPOLYLINE: this.lwpolyline.bind(this),
    CIRCLE: this.circle.bind(this),
    TEXT: this.text.bind(this),
    //ATTDEF: this.attdef.bind(this),
    ATTRIB: this.attrib.bind(this),
    //MTEXT: this.mtext.bind(this),
    INSERT: this.insert.bind(this),
    //AcDbBlockBegin: this.AcDbBlockBegin.bind(this)
}
DataToParse = {
    BLOCKS: {
        INSERT: this.INSERT_BLOCKS.bind(this),
        ...this.GlobalData
    },
    ENTITIES: {
        INSERT: this.INSERT_ENTITIES.bind(this),
        ...this.GlobalData
    }

}
addLine(x1, y1, x2, y2, Index) {
    const element = this.getElement(Index);
    if(!element.line){
        element.line = {
            x1,
            y1,
            x2,
            y2,
            dx: x2 - x1,
            dy: y2 - y1,
            ddxy: x2 * y1 - x1 * y2
        };
    }



    this.addPoint(x1, y1,[Index],"");
    this.addPoint(x2, y2,[Index],"");

    this.Elements.forEach((elements, key) => {
        if (key != Index && elements.line) {
            this.DoLinesHit(
                element.line,
                elements.line,
                key,
                Index,
            );
        }});
}


function_handler(object, objectHandlers) {
    for (const [key, values] of Object.entries(object)) {
        if (objectHandlers[key]) {
            //has the same key

            if (Array.isArray(values)) {
                //output.push()
                values.map((x) => {
                    objectHandlers[key](x);
                });
                //.filter(item => item !== undefined);
            } else {
                if (objectHandlers[key]) {
               // console.log(JSON.stringify(values[key]))
               // console.log(key)
                //objectHandlers[key](values[key]);
                this.function_handler(values, objectHandlers[key])
                }
                //objectHandlers[key](values);
            }
            continue;
        }
        if (typeof values == "object" && !Array.isArray(values)) {
            this.missing_functions.add(key);
        }
    }
};

addPoint(x, y, pointerArray, caller = "none") {
    this.updateExtremes(x, y);

    pointerArray.forEach((value) => {
        if(value == undefined) {console.log(caller) }});

    //if the points Map has a not has x,
    //add the x and set a new map to it


    if (!this.AllPointsMap.has(x)) {
        this.AllPointsMap.set(x, new Map());
    }

    //Add the this x point to a constant
    const yMap = this.AllPointsMap.get(x);

    //if this y map not has this y
    //add this y and create a new set
    if (!yMap.has(y)) {
        yMap.set(y, new Set());
    }

    //add to this y in the y map the lookup element
    const yMapSet = yMap.get(y);
    pointerArray.forEach((item) => yMapSet.add(item));

}

getElement(Index){
    if(!this.Elements.has(Index)){
        console.log("error");
    }
    return this.Elements.get(Index);
}
/**add a element to the group and return the index
 */
addElement(element) {
    const index = this.Elements.size;
    this.Elements.set(index,{orginal:element});
    return index;
}

updateExtremes(x, y) {
    this.Extremes = {
        x: Math.min(this.Extremes.x, x),
        X: Math.max(this.Extremes.X, x),
        y: Math.min(this.Extremes.y, y),
        Y: Math.max(this.Extremes.Y, y),
    };
}

addSVG(svg,Index){
    const element = this.getElement(Index);
    if(!element.svg){
        element.svg = new Set();
    }
    element.svg.add(svg);
    this.RAW_Image.appendChild(svg);

    const container = document.getElementById('my-svg');
    console.log(svg)
    container.appendChild(svg)


}
DoLinesHit(a, b, indexForA, indexForB) {
    const { x1: x1, y1: y1, x2: x2, y2: y2 } = a;
    const { x1: x3, y1: y3, x2: x4, y2: y4 } = b;
    //TODO: here must be the element to compare.
    //So A must be a full range of elements and the difference  is the dx and dy
    let t = (y3 - y1) * a.dx - a.dy * (x3 - x1);
    let y = (y4 - y1) * a.dx - a.dy * (x4 - x1);
    let u = (y4 - y1) * b.dx - b.dy * (x4 - x1);
    let i = (y4 - y2) * b.dx - b.dy * (x4 - x2);

    //this can be trown away bc of the point check with slack
    if (i > -this.slack && i < this.slack) {
        i = 0;
    }
    if (u > -this.slack && u < this.slack) {
        u = 0;
    }
    if (y > -this.slack && y < this.slack) {
        y = 0;
    }
    if (t > -this.slack && t < this.slack) {
        t = 0;
    }

    //on the same direction not crossing
    if (t == 0 && u == 0 && y == 0 && i == 0) {
        return -1;
    }
    if ((t == 0 && y == 0) || (u == 0 && i == 0)) {
        return -1;
    }
    if (t == y && u == i) {
        return -1;
    }

    //passing trough each other without landing on the line
    if (Math.sign(t) == -Math.sign(y) && Math.sign(u) == -Math.sign(i)) {
        //TODO x2 * y1 - x1 * y2 and (x4 * y3 - y4 * x3) can be a stored parameter of a and b
        const x = (a.ddxy * b.dx - b.ddxy * a.dx) / (a.dx * b.dy - b.dx * a.dy);
        const k = a.dx * (x - x1) + y1;
        //add this to the point map with the given elements both!!

        this.addPoint(x, k, [indexForA, indexForB], "crossign");
        return;
    }

    //one point on the line
    if ((t * y == 0 || t * y == -0) && Math.sign(u) == -Math.sign(i)) {
        if (t == 0 || t == -0) {
            //x3 y3 hits the line
            //add point x3 y3 with element a
            this.addPoint(x3, y3, [indexForA, indexForB], "crossignA");
        }
        if (y == 0 || y == -0) {
            //x4 y4 hits the line
            this.addPoint(x4, y4, [indexForA, indexForB], "crossignA");
        }
        return;
    }
    if ((u * i == 0 || u * i == -0) && Math.sign(t) == -Math.sign(y)) {
        if (u == 0 || u == -0) {
            //x1 y1 hits the line
            //add point x1 y1 with element b
            this.addPoint(x1, y1, [indexForA, indexForB], "crossigB");
        }
        if (i == 0 || i == -0) {
            //x2 y2 hits the line
            //add point x2 y2 with element b
            this.addPoint(x2, y2, [indexForA, indexForB], "crossignB");
        }
        return;
    }

    return -1;
}
}
