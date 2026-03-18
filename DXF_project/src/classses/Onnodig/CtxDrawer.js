class CtxDrawer {
  #file;
  #missing_functions = new Set();
  constructor(parsed_file) {
    this.#file = { ...parsed_file };
    Object.freeze(this.#file);
    const { ENTITIES } = this.#file;

    this.#function_handler(ENTITIES, this.#EntityFunctions);
  }
  #function_handler = (object, objectHandlers) => {
    for (const [key, values] of Object.entries(object)) {
      if (objectHandlers[key]) {
        //has the same key
        if (Array.isArray(values)) {
          //output.push()
          values.map((x) => {
            objectHandlers[key](x);
          });
        } else {
          objectHandlers[key](values);
        }
        continue;
      }
      if (
        typeof values == "object" &&
        !Array.isArray(values) &&
        values.AcDbEntity
      ) {
        this.#missing_functions.add(key);
      }
    }
  };
  #Arc = (arc) => {
    const {
      AcDbEntity: { [60]: invisible },
      AcDbArc: { [50]: degreeStart },
      AcDbArc: { [51]: degreeEnd },
      AcDbCircle: { [10]: x },
      AcDbCircle: { [20]: y },
      AcDbCircle: { [40]: radius },
    } = arc;

    arc(x, y, radius, degreeStart, degreeEnd);
  };
  #Line = (line) => {
    const { [10]: x1, [11]: x2, [20]: y1, [21]: y2 } = line.AcDbLine;
    moveTo(x1, x2);
    lineTo(x2, y2);
  };

  #LWPOLYLINE = (lwpolyline) => {
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

    moveTo(x[0], y[0]);

    for (let i = 1; i < x.length; i++) {
      if (bulge && bulge[i - 1]) {
        // Calculate the distance between start and end points
        let dx = x[i - 1] - x[i];
        let dy = y[i - 1] - y[i];
        let distance = Math.sqrt(dx * dx + dy * dy);
        // Calculate the radius of the arc
        //console.log(bulge)
        let radius = distance / 2 / Math.abs(bulge[i - 1]);
        arcTo(x[i], y[i], x[i - 1], y[i - 1], radius);
      } else {
        lineTo(x[i], y[i]);
      }
    }
    closePath();
  };

  #INSERT = (insert) => {
    const {
      [2]: href,
      [10]: x,
      [20]: y,
      [41]: scale_x,
      [42]: scale_y,
      [50]: rotation,
    } = insert.AcDbBlockReference;
  };

  #Mline = (mline) => {
    const {
      [11]: [...x],
      [21]: [...y],
      [12]: [...directionX],
      [22]: [...directionY],
      [10]: startXOffset,
      [20]: startYOffset,
    } = mline.AcDbMline;

    moveTo(x[0], y[0]);

    //there is nothing that can go wrong there are just two lines
    if (x.length == 2) {
      lineTo(x[1], y[1]);
      return;
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

      lineTo(currentX, currentY);

      x.splice(nextIndex, 1);
      y.splice(nextIndex, 1);
      directionX.splice(nextIndex, 1);
      directionY.splice(nextIndex, 1);
    }
  };

  #EntityFunctions = {
    LINE: this.#Line.bind(this),
    ARC: this.#Arc.bind(this),
    MLINE: this.#Mline.bind(this),
    LWPOLYLINE: this.#LWPOLYLINE.bind(this),
    //INSERT: this.#INSERT.bind(this),
    //TEXT: this.#TEXT.bind(this),
    //ATTDEF: this.#TEXT.bind(this),
    //ATTRIB: this.#TEXT.bind(this),
    //MTEXT: this.#MTEXT.bind(this),
  };
}
//arc(x, y, radius, startAngle, endAngle, counterclockwise);
//bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)
//stroke();
//moveTo();
//arcTo(x1, y1, x2, y2, radius)
//ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise)
//lineTo(x, y)
//roundRect(x, y, width, height, radii)
//radii is a array with all rounded corners
//setLineDash(segments) [n,n,n,n]
//fillText(text, x, y, maxWidth)
