class CoordinateMap {
  #Areas = new Set();
  AllPointsMap = new Map();
  #IndexMap = new PointerMap();
  #links = [];
  #lastupdatetime = new Date();

  /**
   * @param {Object} param0 area object
   * @param {Number} param0.x minimal x
   * @param {Number} param0.y minimal y
   * @param {Number} param0.X maximal x
   * @param {Number} param0.Y maximal y
   * @returns {Set} all the indexes of the elements that are in this area
   */
  all_points_in_area({ x, y, X, Y }) {
    let output_points = new Set();
    this.AllPointsMap.forEach((y_map, x_cord) => {
      if (x_cord >= x && x_cord <= X) {
        y_map.forEach((linkedSet, y_cord) => {
          if (y_cord >= y && y_cord <= Y) {
            output_points.add(linkedSet);
          }
        });
      }
    });
    return output_points;
  }

  addPoint(x, y, pointerArray) {
    if (!this.AllPointsMap.has(x)) {
      this.AllPointsMap.set(x, new Map());
    }

    const yMap = this.AllPointsMap.get(x);

    if (!yMap.has(y)) {
      yMap.set(y, new Set());
    }

    const yMapSet = yMap.get(y);
    pointerArray.forEach((item) => {
      yMapSet.add(item);

      yMapSet.forEach((linked) => {
        this.#IndexMap.set(linked, item);
      });
    });

    this.#Areas.forEach((value) => {
      if (x >= value.x && x <= value.X && y >= value.y && y <= value.Y) {
        yMapSet.add(value.linkedElement);
        pointerArray.forEach((item) => {
          this.#IndexMap.set(value.linkedElement, item);
        });
      }
    });
  }
  getLinks() {
    this.#links = this.#IndexMap.getConnectedSets();
    this.#lastupdatetime = this.#lastupdatetime.toUTCString(Date.now());
    return this.#IndexMap.getConnectedSets();
  }
  /**
   * @param {area} area
   */
  AddArea(area) {
    const { x, y, X, Y, linkedElement } = area;
    if (!this.#IndexMap.has(linkedElement)) {
      this.#IndexMap.set(linkedElement, new Set());
    }
    this.AllPointsMap.forEach((y_map, x_cord) => {
      if (x_cord >= x && x_cord <= X) {
        y_map.forEach((linkedSet, y_cord) => {
          if (y_cord >= y && y_cord <= Y) {
            linkedSet.add(linkedElement);
            linkedSet.forEach((item) => {
              this.#IndexMap.get(item).add(this.#IndexMap.get(linkedElement));
              this.#IndexMap.get(linkedElement).add(this.#IndexMap.get(item));
            });
          }
        });
      }
    });

    this.#Areas.add(area);
  }
}

function getRandomFloat(min, max) {
  return parseFloat((Math.random() * (max - min) - (max - min)).toPrecision(2));
}


function test_cordsmap(p) {
  let output;
  for (let t = 0; t < p; t++) {
    let roadGraph = new CoordinateMap();
    let obj = [];
    let lines = [];
    for (let i = 0; i < 1000; i++) {
      let line = {
        x1: getRandomFloat(-10, 10),
        y1: getRandomFloat(-10, 10),
        x2: getRandomFloat(-10, 10),
        y2: getRandomFloat(-10, 10),
      };
      lines.push(line);
      0;
      roadGraph.addPoint(line.x1, line.y1, ["lines" + (lines.length - 1)]);
      roadGraph.addPoint(line.x2, line.y2, ["lines" + (lines.length - 1)]);
    }

    console.log(roadGraph.getLinks());
    console.log(roadGraph);
    output = roadGraph;
  }
  return output;
}

//from here all the jsdoc typedefs in this script
/**
 *@typedef {Object} area
 * @property {Number} x - is the minimal x point of the area
 * @property {Number} y - is the minimal y point of the area
 * @property {Number} X - is the maximal x point of the area
 * @property {Number} Y - is the maximal y point of the area
 * @property {Number} linkedElement - is the index number of the element
 */
