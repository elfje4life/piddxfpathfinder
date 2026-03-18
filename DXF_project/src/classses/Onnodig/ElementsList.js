
class ElementMap extends pointMap {
  Orginal_elements = [];
  Lines = new Map();
  Cities = new Map();
  Arcs = new Map();
  Extremes = { x: Infinity, y: Infinity, X: -Infinity, Y: -Infinity };
  slack = 0.01;
  singlepoints = [];
  elements = new Map();
  /**add a element to the group and return the index
   */
  addElement(element) {
    return this.Orginal_elements.push(element) - 1;
  }

  getsinglePoints(){
   for (const [x, innerMap] of this.AllPointsMap) {
    for (const [y, indexSet] of innerMap) {
      if(indexSet.size == 1){
        this.singlepoints.push({x:x,y:y,index:Array.from(indexSet)[0],orginal:this.Orginal_elements[Array.from(indexSet)[0]]})
      }
    }
   }
  }

  createLinks() {
    this.Union = new UnionFind(this.Orginal_elements.length);
    this.unionizePointMap(this.AllPointsMap, this.Union);
  }

  unionizePointMap(pointMap, unionFind) {
    // Iterate over each outer key (x value)
    for (const [x, innerMap] of pointMap) {
      // Iterate over each inner key (y value)
      for (const [y, indexSet] of innerMap) {
        const indexes = Array.from(indexSet);
        if (indexes.length > 1) {
          const base = indexes[0]; // Use the first index as the base.
          for (let i = 1; i < indexes.length; i++) {
            unionFind.union(base, indexes[i]);
          }
        }
      }
    }
  }

  addElementToDraw( Index, EleToAdd) {
  if (!this.elements.has(Index)) {
    this.elements.set(Index, EleToAdd);
  }else{
    console.log("error je kan maar 1 toevoegen")
  }
  //this.elements[map].get(Index).add(EleToAdd);
  }

  updateExtremes(x, y) {
  this.Extremes = {
    x: Math.min(this.Extremes.x, x),
    X: Math.max(this.Extremes.X, x),
    y: Math.min(this.Extremes.y, y),
    Y: Math.max(this.Extremes.Y, y),
  };
  }


  addLine(x1, y1, x2, y2, Index) {
    const LineToAdd = {
      x1,
      y1,
      x2,
      y2,
      dx: x2 - x1,
      dy: y2 - y1,
      ddxy: x2 * y1 - x1 * y2,
      IndexToOrginalElement: Index,
      type: "Line",
    };
    this.addElementToDraw(Index, LineToAdd);
    this.updateExtremes(x1, y1);
    this.updateExtremes(x2, y2);
    this.elements.forEach((Line, key) => {
      if (key != Index && Line.type == "Line") {

          this.DoLinesHit(
            Line,
            LineToAdd,
            Line.IndexToOrginalElement,
            Index,
          );
        }});
      }



  addPoint(x, y, Index,name) {
    super.addPoint(x, y, [Index],name);
    this.updateExtremes(x, y);
  }

  AddArea(minOuterKey, maxOuterKey, minInnerKey, maxInnerKey, Index) {
    super.AddArea(minOuterKey, maxOuterKey, minInnerKey, maxInnerKey, Index);
    this.updateExtremes(minOuterKey, minInnerKey);
    this.updateExtremes(maxOuterKey, maxInnerKey);
  }

  AddCity(citys, Index) {
    citys.type = "Insert";
    this.addElementToDraw(Index, citys);

    this.elements.forEach((city, key) => {
      if (key != Index && city.type == "Insert" ) {
          this.DoExtremesHit({extremes1:city.Extremes, extremes2:citys.Extremes});
      }
    });
    //this.DoExtremesHit();
  }
  AddArc(startX, startY, radius, num, largeArcFlag, endX, endY, Index) {
    super.addPoint(startX, startY, [Index], "arc");
    super.addPoint(endX, endY, [Index], "arc");
    this.updateExtremes(startX, startY);
    this.updateExtremes(endX, endY);
    const ArcToAdd = {
      startX,
      startY,
      radius,
      endX,
      endY,
      IndexToOrginalElement: Index,
      type: "Arc",
    };
    this.addElementToDraw("Arcs", Index, ArcToAdd);
    //is this needed? bc if i have the orginal element added
  }
  /* Does a extreme hit a other extreme? and really hit not just falls within
   * or outside..
   */
  DoExtremesHit = ({extremes1, extremes2}) => {
  //The checking for not good extremes
    if (extremes1.x > extremes1.X ||
      extremes1.y > extremes1.Y ||
      extremes2.x > extremes2.X ||
      extremes2.y > extremes2.Y
  ){
    return false
  }
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

    super.addPoint(x, k, [indexForA, indexForB], "crossign");
    return;
  }

  //one point on the line
  if ((t * y == 0 || t * y == -0) && Math.sign(u) == -Math.sign(i)) {
    if (t == 0 || t == -0) {
      //x3 y3 hits the line
      //add point x3 y3 with element a
      super.addPoint(x3, y3, [indexForA, indexForB], "crossignA");
    }
    if (y == 0 || y == -0) {
      //x4 y4 hits the line
      super.addPoint(x4, y4, [indexForA, indexForB], "crossignA");
    }
    return;
  }
  if ((u * i == 0 || u * i == -0) && Math.sign(t) == -Math.sign(y)) {
    if (u == 0 || u == -0) {
      //x1 y1 hits the line
      //add point x1 y1 with element b
      super.addPoint(x1, y1, [indexForA, indexForB], "crossigB");
    }
    if (i == 0 || i == -0) {
      //x2 y2 hits the line
      //add point x2 y2 with element b
      super.addPoint(x2, y2, [indexForA, indexForB], "crossignB");
    }
    return;
  }

  return -1;
  }
}
