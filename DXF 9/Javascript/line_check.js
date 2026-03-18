 const mergedElements = [];




function mergeBoundingBoxes(bboxes) {
    let merged = [];
    let assigned = new Set(); // Track processed elements
    let tries = 0


    for (let i = 0; i < bboxes.length; i++) {
        let bbox
        if (bboxes[i].AcDbBlockReference && bboxes[i].AcDbBlockReference["  2"] === "speldje") {
            merged.push({...bboxes[i], url:'' ,kks: '',  INSERT: [], bbox: [] });
            assigned.add(bboxes[i]);
            continue
        }
        if(!bboxes[i].bbox){
            bbox = file.BLOCKS[`${bboxes[i].AcDbBlockReference['  2']}`].bbox
            if (bboxes[i].AcDbBlockReference && bboxes[i].AcDbBlockReference["  2"] === "ATTRIBUTE4") {
                bbox = {width:10,height:1,x:-10,y:-4}
            }
            if(bbox){
                bboxes[i].bbox = {...bbox}
                bboxes[i].bbox.x = parseFloat(bboxes[i].AcDbBlockReference[" 10"])+bboxes[i].bbox.x
                bboxes[i].bbox.y = parseFloat(bboxes[i].AcDbBlockReference[" 20"])+bboxes[i].bbox.y
            }

        }




        let current = bboxes[i].bbox;
        let isMerged = false;


        for (let j = 0; j < merged.length; j++) {
            let insertGroup = merged[j];

            for (let k = 0; k < insertGroup.bbox.length; k++) {
                let mergedBbox = insertGroup.bbox[k];

                if (isTouchingOrOverlapping(mergedBbox, current) && !isContained(current, mergedBbox) && !isContained(mergedBbox, current)) {
                    if (!assigned.has(bboxes[i])) {
                        insertGroup.INSERT.push(bboxes[i]);
                        insertGroup.bbox.push(current);
                        if(bboxes[i]['{'] ){
                            insertGroup.kks = bboxes[i]['{']['1000']
                        }
                        if(bboxes[i].AcDbBlockReference['1000']){
                            insertGroup.url=bboxes[i].AcDbBlockReference['1000']
                        }
                        assigned.add(bboxes[i]);
                    }
                    isMerged = true;
                    break;
                }
            }

            if (isMerged) break;

        }

        if (!isMerged) {
            if (bboxes[i].AcDbBlockReference && bboxes[i].AcDbBlockReference["  2"] === "ATTRIBUTE4") {
                //bboxes[i].bbox.x = 0;
               bboxes[i].bbox.width += 20 ;
               bboxes[i].bbox.height += 10 ;
                tries++;

                if(tries<2){
                    i--
                    continue

                }
                  console.log( bboxes[i])

            }
            tries = 0;
            let kks = ''
            let url = ''
            if(bboxes[i].AcDbBlockReference['1000']){
                url = bboxes[i].AcDbBlockReference['1000']
            }
            if(bboxes[i]['{']){
                 kks = bboxes[i]['{']['1000']
            }

            merged.push({...bboxes[i], url:url ,kks: kks,  INSERT: [], bbox: [current] });
            //assigned.add(bboxes[i]);
        }
    }

    return merged;
}



function getMinMax(bbox) {
    return {
        minX: bbox.x,
        minY: bbox.y,
        maxX: bbox.x + bbox.width,
        maxY: bbox.y + bbox.height,
    };
}

function isTouchingOrOverlapping(bbox1, bbox2) {
    const rect1 = getMinMax(bbox1);
    const rect2 = getMinMax(bbox2);

    return (
        rect1.minX <= rect2.maxX &&
        rect1.maxX >= rect2.minX &&
        rect1.minY <= rect2.maxY &&
        rect1.maxY >= rect2.minY
    );
}

function isContained(innerBbox, outerBbox) {
    const inner = getMinMax(innerBbox);
    const outer = getMinMax(outerBbox);

    return (
        inner.minX >= outer.minX &&
        inner.maxX <= outer.maxX &&
        inner.minY >= outer.minY &&
        inner.maxY <= outer.maxY
    );
}

// Example usage
let bboxes = [
{ id: -1, bbox: { x: 0, y: 0, width: 10, height: 10 } },
{ id: -2, bbox: { x: -10, y: -10, width: 10, height: 10 } }, // Touching at the edges, should be merged
{ id: -3, bbox: { x: 6, y: 6, width: 5, height: 5 } }, // Overlaps, will be merged
{ id: -1, bbox: { x: -1, y: -1, width: 5, height: 5 } }, // Overlaps, will be merged
{ id: 1, bbox: { x: 0, y: 0, width: 5, height: 5 } },
{ id: 2, bbox: { x: 4, y: 4, width: 3, height: 3 } },
{ id: 3, bbox: { x: 100, y: 100, width: 2, height: 2 } },
{ id: 4, bbox: { x: 2, y: 2, width: 6, height: 6 } },
{ id: 5, bbox: { x: 9, y: 9, width: 4, height: 4 } },
];

//console.log(mergeBoundingBoxes(bboxes));



/*
 *  Example usage:
 *  Suppose you have an array `lines` with objects in the form:
 *  {
 *    "AcDbLine": {
 *      " 10": "-540.0",
 *      " 11": "-295.0",
 *      " 20": "185.4992506434173",
 *      " 21": "185.4992506434173",
 *      ...
 *    },
 *    "AcDbEntity": { ... },
 *    ...
 *  }
 *
 *  The geo property is computed automatically if it is not already present.
 */
/**
 * Merge lines with the possibility that a single line connects to multiple groups.
 *
 * @param {Array} lines - Array of line objects.
 * Each line is expected to have a geo property or, if missing, one is created via new geo(line).
 * @returns {Array} - An array of merged groups.
 */
function mergeLines(lines) {
    let mergedGroups = [];

    // Process each line from the input.
    for (let current of lines) {
        if (!current.geo) {
            current.geo = new geo(current);
        }

        // Store the indices of all merged groups that current connects to.
        let connectedGroupIndices = [];

        // Check every existing merged group for a connection
        for (let i = 0; i < mergedGroups.length; i++) {
            let group = mergedGroups[i];
            // Check each geo element in the current group.
            for (let geoElem of group.geo) {
                // Wrap geoElem in an object with geo property to match the expected input
                let result = line_crossing({ geo: geoElem }, current);
                if (result >= 0) {  // "0" indicates the lines are crossing
                    connectedGroupIndices.push(i);
                    break; // Found a connection with this group; no need to check further in this group.
                }
            }
        }

        // If no connection was found, create a new group for the current line.
        if (connectedGroupIndices.length === 0) {
            mergedGroups.push({
                LINE: [current],
                geo: [ { ...current.geo } ],
                outp: []  // Assuming you want to record any 'outp' values later.
            });
        } else {
            // The current line connects to one or more groups.
            // We'll merge them together into a target group.
            let targetIndex = connectedGroupIndices[0];
            let targetGroup = mergedGroups[targetIndex];

            // First, add the current line to the target group.
            targetGroup.LINE.push(current);
            targetGroup.geo.push({ ...current.geo });
            // Optionally, add relevant info into outp if needed (e.g., the crossing result).

            // For any additional groups that current connects to, merge them into the target group.
            // We sort the indices in descending order before splicing to avoid index shifting.
            connectedGroupIndices.slice(1).sort((a, b) => b - a).forEach(idx => {
                let groupToMerge = mergedGroups[idx];

                // Merge LINE, geo and outp arrays.
                targetGroup.LINE = targetGroup.LINE.concat(groupToMerge.LINE);
                targetGroup.geo = targetGroup.geo.concat(groupToMerge.geo);
                targetGroup.outp = targetGroup.outp.concat(groupToMerge.outp);

                // Remove the now-merged group.
                mergedGroups.splice(idx, 1);
            });
        }
    }

    return mergedGroups;
}


//copilot
function mergeLines3(lines) {
    let merged = [];
    let assigned = new Set(); // Track processed elements
    console.log(lines)
    for (let i = 0; i < lines.length; i++) {
        let current = lines[i];

        // Ensure each line has a geo property
        if (!current.geo) {
            current.geo = new geo(current);
        }

        let mergedIntoGroup = false;

        // Loop over each group to see if current should merge into an existing group.
        for (let j = 0; j < merged.length && !mergedIntoGroup; j++) {
            let group = merged[j];

            // Check against every geo element in the merged group
            for (let k = 0; k < group.geo.length; k++) {
                let candidate = { geo: { ...group.geo[k] } };

                // Consider using the parameters in the correct order:
                let check = line_crossing(candidate, current);  // or line_crossing(current, candidate)

                // If the check meets your criteria (here 0 means crossing)
                if (check >= 0) {
                    // Merge the current line into the group if not already added
                    if (!assigned.has(current)) {
                        group.LINE.push(current);
                        group.outp.push(check);
                        // Add a copy of current.geo so new data can be stored and compared later
                        group.geo.push({ ...current.geo });
                        assigned.add(current);
                    }
                    mergedIntoGroup = true;
                    break; // Break out of the geo loop immediately
                }
            }
        }

        // If current wasn't merged into any group, create a new one.
        if (!mergedIntoGroup) {
            // Set an initial value for outp (if needed) or use a placeholder
            merged.push({
                ...current,
                LINE: [{ ...current }],
                geo: [{ ...current.geo }],
                outp: []  // you might want to start with an empty array,
                // or include a default value if required.
            });
            assigned.add(current);
        }
    }

    console.log(merged)
    console.log(mergeConnectedGroups(merged))

    return mergeConnectedGroups(merged);
}
/**
 * Merge groups if there are more than one connection between any two groups.
 * Each group is assumed to have:
 *   - a `geo` array (with coordinate objects),
 *   - a `LINE` array (with line objects),
 *   - an `outp` array (with connection values, if needed)
 * The `line_crossing` function is assumed to take two objects that contain a geo property,
 * and return 0 when they are considered connected.
 *
 * @param {Array} groups - an array of already merged groups
 * @returns {Array} - an array of groups merged further based on connectivity
 */
function mergeConnectedGroups(groups) {
    // Create a shallow copy so we can modify the array
    let merged = [...groups];
    let didMerge = true;

    // Run through the list repeatedly until no further mergers occur.
    while (didMerge) {
        didMerge = false;
        // For each pair of groups (i and j), i < j.
        for (let i = 0; i < merged.length; i++) {
            for (let j = i + 1; j < merged.length; j++) {

                // Count how many valid connections exist between groups[i] and groups[j].
                let connectionCount = 0;
                for (let geo1 of merged[i].geo) {
                    for (let geo2 of merged[j].geo) {
                        // We wrap each geo in an object with the property name "geo"
                        // to match the expected input of line_crossing.
                        let result = line_crossing({ geo: geo1 }, { geo: geo2 });
                        if (result === 0) {
                            connectionCount++;
                            // If we find more than one connection, we can stop counting.
                            if (connectionCount > 1) break;
                        }
                    }
                    if (connectionCount > 1) break;
                }

                // If more than one connection is found, merge the two groups.
                if (connectionCount > 1) {
                    // Merge the LINE arrays, geo arrays, and outp arrays.
                    merged[i].LINE = merged[i].LINE.concat(merged[j].LINE);
                    merged[i].geo = merged[i].geo.concat(merged[j].geo);
                    merged[i].outp = merged[i].outp.concat(merged[j].outp);

                    // Remove group j since it has been merged into group i.
                    merged.splice(j, 1);
                    didMerge = true;
                    // Since the merged array has changed, break out to restart the loops.
                    break;
                }
            }
            if (didMerge) break;
        }
    }
    return merged;
}



function mergeLines2(lines){
    let merged = [];
    let assigned = new Set(); // Track processed elements
    console.log(lines)
    for (let i = 0; i < lines.length; i++) {
        let current = lines[i];
        if (!current.geo){
            current.geo = new geo(current);
        }
        let isMerged = false;

        let outp
        for (let j = 0; j < merged.length; j++) {
            let lineGroup = merged[j];

            for (let k = 0; k < lineGroup.geo.length; k++) {
                let mergedLines = {geo: {...lineGroup.geo[k]}}
                outp = line_crossing(mergedLines,current) //line_crossing(current,mergedLines)
                 //if (outp<=-1) {outp = segmentsIntersect(current,mergedLines)}
                if (outp>=0) {
                    if (!assigned.has(current)) {
                        lineGroup.LINE.push(current);
                        lineGroup.outp.push(outp);
                        lineGroup.geo.push({...current.geo});
                        assigned.add(current);
                    }
                    isMerged = true;
                    continue;
                }
            }

            if (isMerged) break;

        }

        if (!isMerged) {
            merged.push({...current,  LINE: [{...current}], geo: [{...current.geo}], outp:[outp] });
            assigned.add(current);
        }
    }
    console.log(merged)
    return merged;
}



class geo{
    offset = 0
    constructor(val){
/*
        this.x_1 =   Math.min(parseFloat(val.AcDbLine[" 10"]),parseFloat(val.AcDbLine[" 11"]));
        this.x_2 =   Math.max(parseFloat(val.AcDbLine[" 10"]),parseFloat(val.AcDbLine[" 11"]));
        if(this.x_1 !== this.x_2){
             this.x_1 -= this.offset
             this.x_2 += this.offset
        }
        this.y_1 =   Math.min(parseFloat(val.AcDbLine[" 20"]),parseFloat(val.AcDbLine[" 21"]));
        this.y_2 =   Math.max(parseFloat(val.AcDbLine[" 20"]),parseFloat(val.AcDbLine[" 21"]));
        if(this.y_1 !== this.y_2){
            this.y_1 -= this.offset
            this.y_2 += this.offset
        }
    */
        this.x_1 = parseFloat(val.AcDbLine[" 10"])
        this.x_2 = parseFloat(val.AcDbLine[" 11"])
        this.y_1 = parseFloat(val.AcDbLine[" 20"])
        this.y_2 = parseFloat(val.AcDbLine[" 21"])

        this.dx = this.x_2 - this.x_1;
        this.dy = this.y_2 - this.y_1;
    }
}

function line_crossing(a,b){
    const slack = 0.3; //two times the width

    if(a.geo == "undefined"){
        a.geo = new geo(a);
    }

    if(b.geo == "undefined"){
        b.geo = new geo(b);
    }

            /*
    //if there is some slack inside the differance make them equal this could skrew up small non vertical and horizontal lines if the image is really big
    if(a.geo.x_1- a.geo.x_2>-slack&&a.geo.x_1-a.geo.x_2<slack){
        const tmp = (a.geo.x_2+a.geo.x_1)/2
        a.geo.x_1 = tmp
        a.geo.x_2 = tmp
        a.geo.dx = 0;
    }
    if(b.geo.x_2-b.geo.x_1>-slack&&b.geo.x_2-b.geo.x_1<slack){
        const tmp = (b.geo.x_2+b.geo.x_1)/2
        b.geo.x_1 = tmp
        b.geo.x_2 = tmp
        b.geo.dx = 0;
    }

    if(a.geo.y_1- a.geo.y_2>-slack&&a.geo.y_1-a.geo.y_2<slack){
        const tmp = (a.geo.y_2+a.geo.y_1)/2
        a.geo.y_1 = tmp
        a.geo.y_2 = tmp
        a.geo.dy = 0;

    }
    if(b.geo.y_2-b.geo.y_1>-slack&&b.geo.y_2-b.geo.y_1<slack){
        const tmp = (b.geo.y_2+b.geo.y_1)/2
        b.geo.y_1 = tmp
        b.geo.y_2 = tmp
        b.geo.dy = 0;
    }
*/

    //;point on point to be faster?
    if(a.geo.x_1 == b.geo.x_1 && a.geo.y_1 == b.geo.y_1 ){ return 0;}
    if(a.geo.x_1 == b.geo.x_2 && a.geo.y_1 == b.geo.y_2 ){ return 0;}
    if(a.geo.x_2 == b.geo.x_1 && a.geo.y_2 == b.geo.y_1 ){ return 0;}
    if(a.geo.x_2 == b.geo.x_2 && a.geo.y_2 == b.geo.y_2 ){ return 0;}

    //points with some slack if the slack is big enough this cause no problem but if b is bigger then a the formula wont work
    const xa1 = (a.geo.x_1 - b.geo.x_1)
    const ya1 = (a.geo.y_1 - b.geo.y_1)
    if(pop(xa1,ya1)){ return 0;}

    const xa2 = (a.geo.x_1 - b.geo.x_2)
    const ya2 = (a.geo.y_1 - b.geo.y_2)
    if(pop(xa2,ya2)){ return 0;}

    const xb1 = (a.geo.x_2 - b.geo.x_1)
    const yb1 = (a.geo.y_2 - b.geo.y_1)
    if(pop(xb1,yb1)){ return 0;}

    const xb2 = (a.geo.x_2 - b.geo.x_2)
    const yb2 = (a.geo.y_2 - b.geo.y_2)
    if(pop(xb2,yb2)){ return 0;}

    //so turn around now the slack can be smaller
    const ax1 = (b.geo.x_1 - a.geo.x_1)
    const ay1 = (b.geo.y_1 - a.geo.y_1)
    if(pop(ax1,ay1)){ return 0;}

    const ax2 = (b.geo.x_1 - a.geo.x_2)
    const ay2 = (b.geo.y_1 - a.geo.y_2)
    if(pop(ax2,ay2)){ return 0;}

    const bx1 = (b.geo.x_2 - a.geo.x_1)
    const by1 = (b.geo.y_2 - a.geo.y_1)
    if(pop(bx1,by1)){ return 0;}

    const bx2 = (b.geo.x_2 - a.geo.x_2)
    const by2 = (b.geo.y_2 - a.geo.y_2)
    if(pop(bx2,by2)){ return 0;}
        //is one coordinate equal to the other?
        function pop(k,l){
             if(k >=-slack && k <=slack && l >=-slack && l <=slack ){ return true}
             return false
        }


  if(!a.AcDbLine){
        //return -3
    }



   //if(a.geo.x_2 == b.geo.x_1 || a.geo.x_2 == b.geo.x_2 || a.geo.x_1 == b.geo.x_1 || a.geo.x_1 == b.geo.x_2){
    //   if(a.geo.y_2 == b.geo.y_1 || a.geo.y_2 == b.geo.y_2 ||a.geo.y_1 == b.geo.y_1 || a.geo.y_1 == b.geo.y_2){
     //      return 0;
     //  }
   //};
    //if(a.geo.dx == b.geo.dx){return -2}
    //if(a.geo.dy == b.geo.dy){return -2}




   // if(b.geo.y_1==a.geo.y_1)



    let t = ((b.geo.y_1-a.geo.y_1)*a.geo.dx) - (a.geo.dy * (b.geo.x_1-a.geo.x_1))
    let y = ((b.geo.y_2-a.geo.y_1)*a.geo.dx) - (a.geo.dy * (b.geo.x_2-a.geo.x_1))
    let u =((b.geo.y_2-a.geo.y_1)*b.geo.dx) - (b.geo.dy * (b.geo.x_2-a.geo.x_1))
    let i = ((b.geo.y_2-a.geo.y_2)*b.geo.dx) - (b.geo.dy * (b.geo.x_2-a.geo.x_2))

    if(i>-slack&&i<slack){
        i = 0;
    }
    if(u>-slack&&u<slack){
        u = 0;
    }
    if(y>-slack&&y<slack){
        y = 0;
    }
    if(t>-slack&&t<slack){
        t = 0;
    }


     //console.log({a:a.geo,b:b.geo,t:t,y:y,u:u,i:i})
    //on the same direction
    if(t==0&&u==0&&y==0&&i==0){return-1}

    if((t==0&&y==0)||(u==0&&i==0)){return-1}

    if(t==y&&u==i){return -1}
    //passing trough each other without landing on the line
    if((Math.sign(t)==-Math.sign(y))&&(Math.sign(u)==-Math.sign(i))){return 1}

    //there is a change that two of the elements are 0
    if((u*i == 0||u*i == -0) &&( t*y == 0||t*y == -0)){return 0}

    //one point on the line
    if((t*y == 0||t*y == -0) && (Math.sign(u)==-Math.sign(i))){return 0}
    if((u*i == 0||u*i == -0) && (Math.sign(t)==-Math.sign(y))){return 0}

    //connected in the middle first line is in check, and or the first is on the line or the second
    //with a little slack for drawing

     if((Math.sign(t)==-Math.sign(y))&&((i>-slack&&i<slack)||(u>-slack&&u<slack))){
     return 2
    }
    if((Math.sign(u)==-Math.sign(i))&&((t>-slack&&t<slack)||(y>-slack&&y<slack))){
    return 2
    }
    //if(((i>-slack&&i<slack)||(u>-slack&&u<slack))||((t>-slack&&t<slack)||(y>-slack&&y<slack))){
    //return 2
   // }

    //xy3 connected to xy1
   //if(i==y&&t-u==0){return 0}

    //xy3 connected to xy2
    //if(-u==y&&t-i==0){return 0}

    //xy4 connected to xy1
   // if(i==-t&&y-u==0){return 0}

    //xy4 connected to xy2
   // if(u==t&&y-i==0){return 0}



return -3

};



check_linecrossing()
function check_linecrossing(){

    //horizontal and vertical lines
    test(setup(0,-1,0,1),setup(-1,0,1,0),1)//line is crossing
    test(setup(-1,0,1,0),setup(-1,0,1,0),0)//line is the same line
    test(setup(-2,0,2,0),setup(-1,0,1,0),-1)//still same but longer this is bc there are no extra points
    test(setup(-3,0,-2,0),setup(-1,0,1,0),-1)//some offset to the first

    test(setup(0,-1,0,0),setup(-1,0,1,0),0)//must collide on the 0,0 point

    test(setup(-100,-100,0,0),setup(0,0,100,100),0)//must collide on the 0,0 point
    test(setup(0,0,-110,-110),setup(0,0,100,100),0)//must collide on the 0,0 point

    test(setup(0,-1,0,1),setup(1,-1,1,1),-1)//line is not crossing
    //test(setup(0,1,0,1),setup(0,-1,0,1),-1)//line is not crossing
        function setup(a,b,c,d){
            let k = {geo:{x_1:a,y_1:b,x_2:c,y_2:d}}
            k.geo.dx =  k.geo.x_2 - k.geo.x_1
            k.geo.dy =  k.geo.y_2 - k.geo.y_1
            return k
        }
        function test(a,b,c){
            let d = line_crossing(a,b)
            if(d != c){
                console.error("not expected:\n")
                console.error({a:a,b:b,c:c,d:d})
            }
            let e = line_crossing(b,a)
            if(e != c){
                console.error("not expected:\n")
                console.error({a:a,b:b,c:c,e:e})
            }
            console.log({a:a,b:b,c:c,d:d,e:e})

        }
}


// 5 minus en 3 maal
    // (x1 * (y2 - y3) + x2 * (y3 - y1) - x3 * (y2 - y1));
   // (x1 * (y2 - y4) + x2 * (y4 - y1) - x4 * (y2 - y1));

   // (x2 * (y4 - y3) - x3 * (y4 - y2) - x4 * (y2 - y3));
   // (x1 * (y4 - y3) - x3 * (y4 - y1) - x4 * (y1 - y3));


   //5 minus en 2 maal
   //(y_{3}-y_{1})*(x_{2}-x_{1})-(y_{2}-y_{1})*(x_{3}-x_{1})
   //(y_{4}-y_{1})*(x_{2}-x_{1})-(y_{2}-y_{1})*(x_{4}-x_{1})

   //(y_{4}-y_{3})*(x_{4}-x_{1})-(y_{4}-y_{1})*(x_{4}-x_{3})
   //(y_{4}-y_{3})*(x_{4}-x_{2})-(y_{4}-y_{2})*(x_{4}-x_{3})

   function doBoundingBoxOutlinesOverlap(bbox1, bbox2) {
       const r1 = {
           left: bbox1.x,
           top: bbox1.y,
           right:bbox1.width-bbox1.x ,
           bottom:  bbox1.height-bbox1.y ,
       };

       const r2 = {
           left: bbox2.x,
           top: bbox2.y,
           right: bbox2.width-bbox2.x ,
           bottom:  bbox2.height-bbox2.y ,
       };

       // Check for non-overlap where one is entirely to the left, right, above, or below the other
       if (r1.left >= r2.right || r2.left >= r1.right || r1.top >= r2.bottom || r2.top >= r1.bottom) {
           return false; // No overlap at all
       }

       // If they overlap, now check if one is NOT strictly contained within the other
       const isBbox1InsideBbox2 =
       r1.left >= r2.left && r1.top >= r2.top && r1.right <= r2.right && r1.bottom <= r2.bottom;

       const isBbox2InsideBbox1 =
       r2.left >= r1.left && r2.top >= r1.top && r2.right <= r1.right && r2.bottom <= r1.bottom;

       // Outline overlap occurs if they overlap AND neither is strictly inside the other
       return !(isBbox1InsideBbox2 || isBbox2InsideBbox1);
   }

   function test_1(){
   const bboxA = { x: 0, y: 0, width: 100, height: 100 };
   const bboxB = { x: 1, y: 1, width: 10, height: 10 }; // Inside A
   const bboxC = { x: 50, y: 50, width: 60, height: 60 }; // Overlapping A
   const bboxD = { x: 100, y: 0, width: 20, height: 20 }; // Touching A on the right
   const bboxE = { x: -10, y: -10, width: 20, height: 20 }; // Overlapping A
   const bboxF = { x: 150, y: 150, width: 10, height: 10 }; // No overlap

   console.log("A and B (inside):", doBoundingBoxOutlinesOverlap(bboxB, bboxA)); // Output: false
   console.log("A and C (overlapping):", doBoundingBoxOutlinesOverlap(bboxA, bboxC)); // Output: true
   console.log("A and D (touching right):", doBoundingBoxOutlinesOverlap(bboxA, bboxD)); // Output: true
   console.log("A and E (overlapping):", doBoundingBoxOutlinesOverlap(bboxA, bboxE)); // Output: true
   console.log("A and F (no overlap):", doBoundingBoxOutlinesOverlap(bboxA, bboxF)); // Output: false
   console.log("B and C (no overlap):", doBoundingBoxOutlinesOverlap(bboxB, bboxC)); // Output: false
   }


   function checkAndMergeBoundingBoxes(elements) {


       for (let i = 0; i < elements.length; i++) {
           let currentElement = elements[i];
           let isMerged = false;

           for (let j = 0; j < mergedElements.length; j++) {
               if (doBoundingBoxOutlinesOverlap(currentElement.bbox, mergedElements[j].bbox)) {
                   if(!mergedElements[j].INSERT){mergedElements[j].INSERT = []}
                      mergedElements[j].INSERT.push(currentElement)
                      if(!mergedElements[j].bbox){mergedElements[j].bbox = currentElement.bbox}
                       mergedElements[j].bbox = mergeBoundingBoxes(mergedElements[j].bbox, currentElement.bbox)

                   //elements.splice(i,1)
                   //i = i -1;
                   isMerged = true;
                   break;
               }
           }

           if (!isMerged) {
               mergedElements.push({INSERT: [currentElement],
               bbox: currentElement.bbox,
            });
               //elements.splice(i,1)
              // i = i -1;
           }
       }

       return mergedElements;
   }
   function mergeBoundingBoxes2(bboxA, bboxB) {
       return {
           x: Math.min(bboxA.x, bboxB.x),
           y: Math.min(bboxA.y, bboxB.y),
           width: Math.max(bboxA.width, bboxB.width),
           height: Math.max(bboxA.height, bboxB.height)
       };
   }

   /**
    * PointOnPoint function,
    * checks if a points is on a other point with some slack
    * @param {array of points object{connected:array, not_connected:array}, object 2 with geo}
    * @returns {object{connected:array, not_connected:array }}
    */
function PointOnPoint(array,geo){

}
// ret
