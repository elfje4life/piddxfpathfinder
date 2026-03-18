class EntityFunctions {
    missing_functions = new Set();
    pi_degree = Math.PI / 180;

    Line = (line, output) => {
    const { [10]: x1, [11]: x2, [20]: y1, [21]: y2 } = line.AcDbLine;
    const Index = output.addElement(line);
    output.addLine(x1, y1, x2, y2, Index);
    };


    INSERT = (insert, output) => {
    const {
        [2]: href,
        [10]: x,
        [20]: y,
        [41]: scale_x =1,
        [42]: scale_y=1,
        [50]: rotation=0,
    } = insert.AcDbBlockReference;
    //output = this.file.BLOCKS[href];
    this.function_handler(insert, this.EntityFunctions, output);
    //console.log(output)
    output.Extremes.x +=x;
    output.Extremes.y +=y;
    output.Extremes.X +=x;
    output.Extremes.Y +=y;
    output.extra = {href,x,y,scale_x,scale_y,rotation};
    };

    Mline = (mline, output) => {
    const {
        [11]: [...x],
        [21]: [...y],
        [12]: [...directionX],
        [22]: [...directionY],
        [10]: startXOffset,
        [20]: startYOffset,
    } = mline.AcDbMline;

    const Index = output.addElement(mline);

    //there is nothing that can go wrong there are just two lines
    if (x.length == 2) {
        output.addLine(x[0], y[0], x[1], y[1], Index);
    }

    let startIndex = x.findIndex(
        (x, i) => x === startXOffset && y[i] === startYOffset,
    );

    if (startIndex === -1) {
        //console.warn("Start offset not found in vertex data.");
        startIndex = 0;
    }

    let currentX = x[startIndex];
    let currentY = y[startIndex];
    let currentDirectionX = directionX[startIndex];
    let currentDirectionY = directionY[startIndex];

    // Remove the starting point data
    x.splice(startIndex, 1);
    y.splice(startIndex, 1);
    directionX.splice(startIndex, 1);
    directionY.splice(startIndex, 1);

    //let points = [{x:currentX, y:currentY}]

    while (directionX.length > 0) {
        //find the next point on the direction
        let nextIndex = x.findIndex((x, i) => {
            let dx = Math.sign(x - currentX);
            let dy = Math.sign(y[i] - currentY);
            return dx === currentDirectionX && dy === currentDirectionY;
        });

        if (nextIndex === -1) {
            nextIndex = 0;
        }

        currentX = x[nextIndex];
        currentY = y[nextIndex];
        currentDirectionX = directionX[nextIndex];
        currentDirectionY = directionY[nextIndex];

        output.addLine(currentX, currentY, x[nextIndex], y[nextIndex], Index);

        x.splice(nextIndex, 1);
        y.splice(nextIndex, 1);
        directionX.splice(nextIndex, 1);
        directionY.splice(nextIndex, 1);
    }
    };

    Arc = (arc, output) => {
    const {
        AcDbEntity: { [60]: invisible },
        AcDbArc: { [50]: degreeStart },
        AcDbArc: { [51]: degreeEnd },
        AcDbCircle: { [10]: x },
        AcDbCircle: { [20]: y },
        AcDbCircle: { [40]: radius },
    } = arc;

    const Index = output.addElement(arc);

    const radianStart = -degreeStart * this.pi_degree;
    const radianEnd = -degreeEnd * this.pi_degree;

    let startX = x + radius * Math.cos(radianStart);
    let startY = y + radius * Math.sin(radianStart);
    let endX = x + radius * Math.cos(radianEnd);
    let endY = y + radius * Math.sin(radianEnd);

    const largeArcFlag = degreeEnd - degreeStart <= 180 ? 0 : 1;

    //const path = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} `;
    output.AddArc(startX, startY, radius, 0, largeArcFlag, endX, endY, Index);
    };
    LWPOLYLINE = (lwpolyline, output) => {
    const {
        AcDbEntity: { [60]: invisible = 0 },
        AcDbEntity: { [62]: color },
        AcDbPolyline: { [42]: [...bulge] = [] },
        AcDbPolyline: {
            [10]: [...x],
        },
        AcDbPolyline: {
            [20]: [...y],
        },
    } = lwpolyline;
    const Index = output.addElement(lwpolyline);

    const points = x.map((x, i) => {
        return { x: x, y: y[i] };
    });
    const diff = x.map((_, i) => {
        // Changed x.map to x.map
        if (i === 0) {
            return { dx: 0, dy: 0 }; // Or any other default value for the first point
        }
        return { dx: x[i - 1] - x[i], dy: y[i - 1] - y[i] };
    });
    //x = x.map(this.toFixedNumber);
    //y = y.map(this.toFixedNumber);

    let path = `M ${x[0]} ${y[0]} `; // toFixed toegepast op x[0] en y[0]

    for (let i = 1; i < x.length; i++) {
        if (bulge && bulge[i - 1]) {
            // Calculate the distance between start and end points
            let dx = diff[i].dx;
            let dy = diff[i].dy;
            let distance = Math.sqrt(dx * dx + dy * dy);
            // Calculate the radius of the arc
            //console.log(bulge)
            let radius = distance / 2 / Math.abs(bulge[i - 1]);
            let sweepFlag = bulge[i - 1] > 0 ? 1 : 0;
            path += `A ${radius} ${radius} 0 0 ${sweepFlag} ${x[i]} ${y[i]} `;
            output.AddArc(
                x[i - 1],
                y[i - 1],
                radius,
                0,
                sweepFlag,
                x[i],
                y[i],
                Index,
            );
        } else {
            path += `L ${x[i]} ${y[i]} `;
            output.addLine(x[i - 1], y[i - 1], x[i], y[i], Index);
        }
    }
    path += `Z `;
    let area = this.Extremes(points);
    output.AddArea(area.x, area.X, area.y, area.Y, Index);
    return { path: path, points: points, difference: diff, type: "lwpolyline" };
    };

    extractEntityProperties = (entity) => {
    const {
        [60]: invisible,
        [8]: layername,
        [48]: linetype_scale,
    } = entity.AcDbEntity;
    return { invisible, layername, linetype_scale };
    };

//helper ffunctions
    function_handler = (object, objectHandlers, output) => {
    for (const [key, values] of Object.entries(object)) {
        if (objectHandlers[key]) {
            //has the same key

            if (Array.isArray(values)) {
                //output.push()
                values.map((x) => {
                    objectHandlers[key](x, output);
                });
                //.filter(item => item !== undefined);
            } else {
                objectHandlers[key](values, output);
            }
            continue;
        }
        if (typeof values == "object" && !Array.isArray(values)) {
            this.missing_functions.add(key);
        }
    }
    };
    Extremes = (points) => {
    const extremes = points.reduce(
        (acc, point) => {
            return {
                minX: Math.min(acc.minX, point.x),
                                   maxX: Math.max(acc.maxX, point.x),
                                   minY: Math.min(acc.minY, point.y),
                                   maxY: Math.max(acc.maxY, point.y),
            };
        },
        { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
    ); //Inituele waardes

    return {
        x: extremes.minX,
        y: extremes.minY,
        X: extremes.maxX,
        Y: extremes.maxY,
    };
    };

    setExtremes(object) {
    //let allPoints = [];
    for (const [key, values] of Object.entries(object)) {
        let allPoints = [];
        if (Array.isArray(values.paths)) {
            for (const item of values.paths) {
                if (item?.points && Array.isArray(item.points)) {
                    allPoints = allPoints.concat(item.points);
                }
            }
            if (allPoints.length > 0) {
                const extremes = this.Extremes(allPoints);

                object[key].extremes = extremes;
            }
        }
    }
    return object;
    }

    /* Does a extreme hit a other extreme? and really hit not just falls within
     * or outside..
     */
    DoExtremesHit = (extremes1, extremes2) => {
    // Check for overlap on the x-axis
    const xOverlap = extremes1.x <= extremes2.X && extremes2.x <= extremes1.X;
    // Check for overlap on the y-axis
    const yOverlap = extremes1.y <= extremes2.Y && extremes2.y <= extremes1.Y;
    // They overlap if and only if they overlap on both axes
    const OneInTwo =
    extremes1.x >= extremes2.x &&
    extremes1.X <= extremes2.X &&
    extremes1.y >= extremes2.y &&
    extremes1.Y <= extremes2.Y;
    const TwoInOne =
    extremes2.x >= extremes1.x &&
    extremes2.X <= extremes1.X &&
    extremes2.y >= extremes1.y &&
    extremes2.Y <= extremes1.Y;

    return xOverlap && yOverlap && !OneInTwo && !TwoInOne;
    };

EntityFunctions = {
    LINE: this.Line.bind(this),
    ARC: this.Arc.bind(this),
    MLINE: this.Mline.bind(this),
    LWPOLYLINE: this.LWPOLYLINE.bind(this),
    INSERT: this.INSERT.bind(this),
    //TEXT: this.TEXT.bind(this),
    //ATTDEF: this.TEXT.bind(this),
    //ATTRIB: this.TEXT.bind(this),
    //MTEXT: this.MTEXT.bind(this),
    };
}
