class pointMap {
    RoadAreas = new Set();
    /**
     * PointMap met eerste waarde in map is de x
     * daarna een Map met alle y waardes
     * en daarna een set met alle gelinkte objecten
     * @example
     * x->y->Set(a,b,c)
     *  ->y->Set(g,h,b)
     *  ->y->Set(d,e,b)
     * @type {Map}
     */

    ReversePointsMap = new Map();
    AllPointsMap = new Map();
    /**
     * Count all the Points
     * @type {Number}
     */

    last_array = [];

    addPoint(x, y, pointerArray, caller = "none") {
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
        //yMap.get(y).add(linkedElement); // Link element to this coordinate

        //
        this.RoadAreas.forEach((value) => {
            if (x >= value.x && x <= value.X && y >= value.y && y <= value.Y) {
                yMapSet.add(value.linkedElement);


                // //yMapSet.add(value.linkedElement);
            }
        });

      if(yMapSet.has(undefined) && yMapSet.size == 1){
          yMap.delete(y);
          console.log(this.last_array)
    }
    this.last_array = pointerArray;
    }

    AddAreaHelper(innerMap, minKey, maxKey, newValue) {
    innerMap.forEach((_, key) => {
        if (key >= minKey && key <= maxKey) {
            innerMap.get(key).add(newValue);
        }
    });
    }

    AddArea(minOuterKey, maxOuterKey, minInnerKey, maxInnerKey, newValue) {
        this.AllPointsMap.forEach((innerMap, outerKey) => {
            if (outerKey >= minOuterKey && outerKey <= maxOuterKey) {
                this.AddAreaHelper(innerMap, minInnerKey, maxInnerKey, newValue);
            }
        });
        //create a object en add it to a pointmap
        const newObj = {
            x: minOuterKey,
            X: maxOuterKey,
            y: minInnerKey,
            Y: maxInnerKey,
            linkedElement: newValue,
        };
        this.RoadAreas.add(newObj);
    }
}
