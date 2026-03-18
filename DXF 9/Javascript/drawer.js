//here are the draw Functions:
function INSERT(ele, color){ //stop from reading inserts handle them diff

    const group = document.createElementNS(svgNS, "a");
    const use = document.createElementNS(svgNS, "use");
    //color = "red";

   if(ele.AcDbEntity[' 60'] == 1){
        return;
    };

    if(ele.url && !debug ){
        group.setAttribute("href", ele.url ||"");
    }
    if(ele.kks){
        group.setAttribute("ID", ele.kks || "");
    }
    if(ele.INSERT){
        if(ele.INSERT.length>=1){
            color = "red"
        }
    }
    if(color){
        use.setAttribute("stroke", color);
    }

    //this piece need to be called by the caller for this case INSERT! so blocks.ENTITES
    const block = draw(ele,color);
    //merge_svg(symbol,block,[['transform', `translate(${-bbox.x},${-bbox.y})`]]);
    merge_svg(group,block)
    let bbox = ele.bbox || getBBox_wrapper(file.BLOCKS[ele.AcDbBlockReference['  2']])



    //block.forEach(ele => {
    //ele.setAttribute("stroke", "blue");
    // ele.setAttribute("stroke-width", 4);

    //  group.appendChild(ele,color);
    //});

    //use.setAttribute("x", ele.AcDbBlockReference[' 10']);
    //use.setAttribute("rotate", (temp.AcDbBlockReference[' 50'] || 0));
    //use.setAttribute("y", ele.AcDbBlockReference[' 20']);
    //scale(${((-ele.AcDbBlockReference[' 41'])||1)} ${((ele.AcDbBlockReference[' 42'])||1)})
    //use.setAttribute("transform", `scale(${((-ele.AcDbBlockReference[' 41'])||1)} ${((-ele.AcDbBlockReference[' 42'])||1)}) rotate(${(ele.AcDbBlockReference[' 50'] || 0)} ${ele.AcDbBlockReference[' 10']} ${ele.AcDbBlockReference[' 20']})`);
    if(ele.AcDbBlockReference[' 41']&&!ele.AcDbBlockReference[' 42']){
        // ele.AcDbBlockReference[' 42'] = ele.AcDbBlockReference[' 41'];
    }
    use.setAttribute("transform", `translate(${ele.AcDbBlockReference[' 10']} ${ele.AcDbBlockReference[' 20']}) scale(${((ele.AcDbBlockReference[' 41'])||1)} ${(ele.AcDbBlockReference[' 42']||1)}) rotate(${(ele.AcDbBlockReference[' 50'] || 0)})`);
    use.setAttribute("href", `#${ele.AcDbBlockReference['  2']}`);

    //use.appendChild(draw(ele,color));
    //use.setAttribute("transform", `scale(${((-ele.AcDbBlockReference[' 41'])||1)} ${((-ele.AcDbBlockReference[' 42'])||1)})`);
    //use.setAttribute("height", `${100*(-ele.AcDbBlockReference[' 42']||1)}%`);
    //line.setAttribute("y2", -ele.AcDbLine[' 21']);
    //use.setAttribute("x",`${ele.AcDbBlockReference[' 10']}`)
    //use.setAttribute("y",`${ele.AcDbBlockReference[' 20']}`)

    group.appendChild(use);
    return group;
}

function LINE(ele, color){

    if(ele.LINE){
            color = "green"



            const group = document.createElementNS(svgNS, "g");

                let block = draw(ele,color);
                //group.appendChild(block)
                merge_svg(group,block)

            group.addEventListener('mouseover', () => {
                group.querySelectorAll('*').forEach(element => {
                    element.setAttribute('stroke', 'blue'); // Change to desired hover color
                    element.setAttribute('stroke-width', element.getAttribute('stroke-width')*2); // Change to desired hover color
                });
            });

            group.addEventListener('mouseout', () => {
                group.querySelectorAll('*').forEach(element => {
                    element.setAttribute('stroke', 'black'); // Reset to original color
                      element.setAttribute('stroke-width', element.getAttribute('stroke-width')/2)
                });
            });
            return group
    }

    const line = document.createElementNS(svgNS, "line");
    if(ele.AcDbEntity[' 60'] == 1){
        return;
    }


    //line.setAttribute("transform", `translate(${base_x},${base_y}) scale(${scale_x},${scale_y}) rotate(${rotate})`);
    line.setAttribute("ID", ele['  5'])
    info_5[ele['  5']]=ele

    line.setAttribute("x1", ele.geo?.x_1|| parseFloat(ele.AcDbLine[' 10']));
    line.setAttribute("y1", ele.geo?.y_1|| parseFloat(ele.AcDbLine[' 20']));
    line.setAttribute("x2", ele.geo?.x_2|| parseFloat(ele.AcDbLine[' 11']));
    line.setAttribute("y2", ele.geo?.y_2|| parseFloat(ele.AcDbLine[' 21']));
    if(color){
        line.setAttribute("stroke", color);
    };

    line.setAttribute("stroke-width", parseFloat(ele.AcDbLine[' 39']) || stroke_width);
    line.setAttribute("stroke-linecap", 'round')

    // setBBox_wrapper(ele,x1-halfStrokeWidth,y1-halfStrokeWidth,(x1-x2)+strokeWidth,(y1-y2)+strokeWidth);
    //this piece need to be called by the caller for this case INSERT! so blocks.ENTITES

    //merge_svg(symbol,block,[['transform', `translate(${-bbox.x},${-bbox.y})`]]);


    return line;
}

function MLINE( mline, color) {
    if(mline.AcDbEntity[' 60'] == 1){
        return;
    }

    if (!mline || !mline.AcDbMline) {
        console.error("Invalid MLINE object.");
        return;
    }

    let vertexX = mline.AcDbMline[" 11"].map(parseFloat);
    let vertexY = mline.AcDbMline[" 21"].map(parseFloat);
    let directionX = mline.AcDbMline[" 12"].map(parseFloat);
    let directionY = mline.AcDbMline[" 22"].map(parseFloat);
    let miterX = mline.AcDbMline[" 13"].map(parseFloat);
    let miterY = mline.AcDbMline[" 23"].map(parseFloat);

    const startXOffset = parseFloat(mline.AcDbMline[" 10"]);
    const startYOffset = parseFloat(mline.AcDbMline[" 20"]);

    if (isNaN(startXOffset) || isNaN(startYOffset) || vertexX.length === 0 || vertexY.length === 0 || directionX.length === 0 || directionY.length === 0) {
        console.warn("MLINE has insufficient data to draw");
        return;
    }

    let startIndex = vertexX.findIndex((x, i) => x === startXOffset && vertexY[i] === startYOffset);

    if (startIndex === -1) {
        // console.log(mline)
        // console.warn("Start offset not found in vertex data.");
        startIndex = 0;
        // return;
    }

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
            //break;
            nextIndex = 0;
        }

        //setBBox_wrapper(mline,currentX-halfStrokeWidth,currentY-halfStrokeWidth,vertexX[nextIndex]-currentX+halfStrokeWidth,vertexY[nextIndex]-currentY+halfStrokeWidth)

        currentX = vertexX[nextIndex];
        currentY = vertexY[nextIndex];
        currentDirectionX = directionX[nextIndex];
        currentDirectionY = directionY[nextIndex];
        currentMiterX = miterX[nextIndex];
        currentMiterY = miterY[nextIndex];

        path += ` L ${currentX} ${currentY}`;
        /*
         *       //Vector Visualization
         *       //Direction Vector
         *       const dirLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
         *       dirLine.setAttribute("transform", `translate(${base_x},${base_y}) scale(${scale_x},${scale_y}) rotate(${rotate})`);
         *       dirLine.setAttribute("x1", -currentX);
         *       dirLine.setAttribute("y1", -currentY);
         *       dirLine.setAttribute("x2", -currentX + currentDirectionX * 10); // Multiply by a scale factor for visibility
         *       dirLine.setAttribute("y2", -currentY + currentDirectionY * 10);
         *       dirLine.setAttribute("stroke", "blue");
         *       dirLine.setAttribute("stroke-width", "1");
         *       svg.appendChild(dirLine);
         *
         *       //Miter Vector
         *       const miterLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
         *       miterLine.setAttribute("transform", `translate(${base_x},${base_y}) scale(${scale_x},${scale_y}) rotate(${rotate})`);
         *       miterLine.setAttribute("x1", -currentX);
         *       miterLine.setAttribute("y1", -currentY);
         *       miterLine.setAttribute("x2", -currentX + currentMiterX * 10); // Multiply by a scale factor for visibility
         *       miterLine.setAttribute("y2", -currentY + currentMiterY * 10);
         *       miterLine.setAttribute("stroke", "red");
         *       miterLine.setAttribute("stroke-width", "1");
         *       svg.appendChild(miterLine);*/

        vertexX.splice(nextIndex, 1);
        vertexY.splice(nextIndex, 1);
        directionX.splice(nextIndex, 1);
        directionY.splice(nextIndex, 1);
        miterX.splice(nextIndex, 1);
        miterY.splice(nextIndex, 1);

    }

    const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    //pathElement.setAttribute("transform", `translate(${base_x},${base_y}) scale(${scale_x},${scale_y}) rotate(${rotate})`);
    pathElement.setAttribute("d", path);
    pathElement.setAttribute("stroke", color);

    pathElement.setAttribute("stroke-width",  mline.AcDbMline[' 39'] || stroke_width);
    pathElement.setAttribute("fill", "none");
    //svg.appendChild(pathElement);
    return pathElement;
}

function CIRCLE(ele, color){

    if(ele.AcDbEntity[' 60'] == 1){
        return;
    }
    const circle = document.createElementNS(svgNS, "circle");
    //circle.setAttribute("transform", `translate(${base_x},${base_y}) scale(${scale_x},${scale_y}) rotate(${rotate})`);
    circle.setAttribute("cx",  ele.AcDbCircle[' 10']);
    circle.setAttribute("cy",  ele.AcDbCircle[' 20']);
    circle.setAttribute("r", ele.AcDbCircle[' 40'] );
    if(color){
        circle.setAttribute("stroke", color);
    };

    circle.setAttribute("stroke-width", ele.AcDbCircle[' 39'] || stroke_width);
    circle.setAttribute("fill", 'none');
    //svg.appendChild(circle);
    //setBBox_wrapper(ele,ele.AcDbCircle[' 10']-ele.AcDbCircle[' 40']-halfStrokeWidth,ele.AcDbCircle[' 20']-ele.AcDbCircle[' 40']-halfStrokeWidth,ele.AcDbCircle[' 40']*2+strokeWidth,ele.AcDbCircle[' 40']*2+strokeWidth)
    return circle;
};

function LWPOLYLINE(ele, color) {
    // console.log(ele)
    if(ele.AcDbEntity[' 60'] == 1){
        return;
    }

    let path = document.createElementNS(svgNS, "path");
    let strokeWidth;

    let width;
    switch(true){


        case(typeof ele.AcDbPolyline[' 40'] !== 'undefined' && typeof ele.AcDbPolyline[' 41'] !== 'undefined'):
            strokeWidth = parseFloat(ele.AcDbPolyline[' 40'] - ele.AcDbPolyline[' 41'] * -1)/2;
            //console.log(ele)
            break;
        case(typeof ele.AcDbPolyline[' 43']!== 'undefined' &&  parseFloat(ele.AcDbPolyline[' 43']) !== 0):
            strokeWidth = parseFloat(ele.AcDbPolyline[' 43']);
            break;
        case(typeof ele.AcDbPolyline[' 39'] !== 'undefined'):
            strokeWidth = parseFloat(ele.AcDbPolyline[' 39']);
            break;
        default:
            strokeWidth = stroke_width;
    }
   // const halfStrokeWidth = parseFloat(strokeWidth)/2

    let pointString = `M ${ele.AcDbPolyline[' 10'][0]} ${ele.AcDbPolyline[' 20'][0]} `;

    for (let i = 1; i < ele.AcDbPolyline[' 10'].length; i++) {
        let startX = parseFloat(ele.AcDbPolyline[' 10'][i - 1]);
        let startY = parseFloat(ele.AcDbPolyline[' 20'][i - 1]);
        let endX = parseFloat(ele.AcDbPolyline[' 10'][i]);
        let endY = parseFloat(ele.AcDbPolyline[' 20'][i]);

        if (ele.AcDbPolyline[' 42'] && ele.AcDbPolyline[' 42'][i - 1]) {
            // Handle bulge value
            let bulge = parseFloat(ele.AcDbPolyline[' 42'][i - 1]);


            // Calculate the midpoint
            //      let middleX = (startX + endX) / 2;
            //        let middleY = (startY + endY) / 2;

            // Calculate the distance between start and end points
            let dx = endX - startX;
            let dy = endY - startY;
            let distance = Math.sqrt(dx * dx + dy * dy); // pytagoras lengte van de lijn

            //volledige circel geeft dx/2 en dy/2 is de radius

            // Calculate the radius of the arc
            let radius = distance / 2 / Math.abs(bulge);

            // Calculate the angle of the line connecting start and end points
            let angle = Math.atan2(dy, dx)/2;
            let middleX = (startX - (radius) * Math.cos(angle)) ;
            let middleY = (startY- (radius) * Math.sin(angle));
            // Calculate the perpendicular angle to the bulge direction
            //let perpendicularAngle = angle + (bulge > 0 ? 1 : -1) * Math.PI / 2;

            // Calculate the control points for the circular arc
            //let offsetX = radius * Math.cos(perpendicularAngle);
            //let offsetY = radius * Math.sin(perpendicularAngle);

            //let controlX = middleX - offsetX;
            //let controlY = middleY - offsetY;
            let sweepFlag = bulge > 0 ? 1 : 0;
            // setBBox_wrapper(ele,startX-halfStrokeWidth,startY-halfStrokeWidth,Math.max(startX-endX,startX-middleX)+strokeWidth,Math.max(startY-endY,startY-middleY)+strokeWidth)
            pointString += `A ${radius} ${radius} 0 0 ${sweepFlag} ${endX} ${endY} `
        } else {
            // Draw a straight line if no bulge value
            pointString += `L ${ele.AcDbPolyline[' 10'][i]} ${ele.AcDbPolyline[' 20'][i]} `;
            // setBBox_wrapper(ele,startX-halfStrokeWidth,startY-halfStrokeWidth,startX-endX+strokeWidth,startY-endY+strokeWidth);
        }
    }

    // Close the polyline if needed
    switch(parseInt(ele.AcDbPolyline[' 70'])){
        case(128):
            path.setAttribute("fill", "none");
            break;
        case(0):
            //pointString += `Z `;
            // /path.setAttribute("fill", color||"black");
            path.setAttribute("fill", "none");
            //console.log(ele)
            break;
        case(1):
            pointString += `Z `;
            path.setAttribute("fill", "none");
            break;
        default:
            pointString += `Z `;
            path.setAttribute("fill", "none");
    }

    //console.log(pointString);

    //console.log(pointString);


    path.setAttribute("stroke-width", strokeWidth);

    //path.setAttribute("points", pointString);
    if(color){
        path.setAttribute("stroke", color||"red");
    };
    //path.setAttribute("stroke", color||"red");
    path.setAttribute("d", pointString);
    //path.setAttribute("stroke-width", ele.AcDbPolyline[' 39'] || 0.5);
    //console.log(path)
    //svg.appendChild(polyline);
    return path;
};

function ATTRIB(ele, color){

    return TEXT(ele, color)
}

function TEXT(ele, color) {
    if(ele.AcDbText['  1'] == ""){

        return
    }
    const text = document.createElementNS(svgNS, "text");
    let rotate = 0;
    //let x = parseFloat(ele.AcDbText[' 10']||ele.AcDbText[' 10'])//-(parseFloat(ele.AcDbText[' 40'])||12)*ele.AcDbText['  1'].length/2
    //let y = -parseFloat(ele.AcDbText[' 20']||ele.AcDbText[' 20'])//+(parseFloat(ele.AcDbText[' 40'])||12)/2
    if(ele.AcDbText[' 50']){
        rotate = ele.AcDbText[' 50']
    }


    //text.setAttribute("transform", `translate(${ele.AcDbText[' 10']} ${ele.AcDbText[' 20']}) rotate(${rotate})`);
    //text.setAttribute("transform", ` rotate(${rotate2},${x},${y})`);
    //text.setAttribute("x", ele.AcDbText[' 10']);
    //text.setAttribute("dx", ele.AcDbText[' 10'] || 0);
    //text.setAttribute("dy", ele.AcDbText[' 20'] || 0);
    //text.setAttribute("y", ele.AcDbText[' 20'] );//- parseFloat(ele.AcDbText[' 40'])/2);
    //text.setAttribute("dx", x );
    // text.setAttribute("dx", -10);
    ///text.setAttribute("dx", (parseFloat(ele.AcDbText[' 40'])*2));
    // text.setAttribute("text-rendering", "revert");
    text.setAttribute("text-anchor", "start");
    //text.setAttribute("text-align", "revert");
    //text.setAttribute("text-indent",0);
    // if(ele.AcDbText[' 72']){console.log(ele)};
    // text.setAttribute("dy", -(parseFloat(ele.AcDbText[' 40'])||12)/2);
    if(ele.AcDbText[' 72'] == "     0"){
        //text.setAttribute("text-anchor", "start");
    }
    if(ele.AcDbText[' 72'] =="     1"){
        //text.setAttribute("text-anchor", "middle");
    }
    if(ele.AcDbText[' 72'] == "     2"){
        // text.setAttribute("text-anchor", "end");
    }
    text.setAttribute("transform", `scale(-1,1) translate(${-ele.AcDbText[' 10']} ${ele.AcDbText[' 20']}) rotate(${rotate+180})`);


    //text-align: start;
    text.setAttribute("font-family", ele.AcDbText['  7']|| "Arial");
    if(color){
        text.setAttribute("fill", color);
    }
    text.setAttribute("font-size", ele.AcDbText[' 40']||7);
    text.setAttribute("stroke-width", 0.1);
    text.textContent = ele.AcDbText['  1'];
    // svg.appendChild(text);
    return text;
}

function MTEXT(ele, color) {
    const text = document.createElementNS(svgNS, "text");
    // text.setAttribute("transform", `translate(${base_x},${base_y}) scale(${-scale_x},${scale_y}) rotate(${rotate})`);
    text.setAttribute("x", ele.AcDbMText[' 10']);
    text.setAttribute("y", ele.AcDbMText[' 20']);
    if(color){
        text.setAttribute("fill", color);
    }
    text.setAttribute("font-size", ele.AcDbMText[' 40']||7);
    text.textContent = ele.AcDbMText['  1'];
    //svg.appendChild(text);
}

function ARC(ele, color){
    const path = document.createElementNS(svgNS, "path");
    const strokeWidth = ele.AcDbArc[' 39'] || stroke_width
    const halfStrokeWidth = strokeWidth/2
    let radianStart;
    let radianEnd;
    if( 0){
        radianStart = (-ele.AcDbArc[' 50']) * (Math.PI / 180);
        radianEnd = (-ele.AcDbArc[' 51']) * (Math.PI / 180);

    }else{
        radianStart = (ele.AcDbArc[' 50']) * (Math.PI / 180);
        radianEnd = (ele.AcDbArc[' 51']) * (Math.PI / 180);
    };

    const radius_x = -ele.AcDbCircle[' 40'];// * -scale_x;
    const radius_y = -ele.AcDbCircle[' 40'];// * scale_y;
    const startX = ele.AcDbCircle[' 10'] - (radius_x) * Math.cos(radianStart);
    const startY = ele.AcDbCircle[' 20']- (radius_y) * Math.sin(radianStart);
    const endX = (ele.AcDbCircle[' 10']- (radius_x) * Math.cos(radianEnd)) ;
    const endY = (ele.AcDbCircle[' 20']- (radius_y) * Math.sin(radianEnd));
    const middleX = (ele.AcDbCircle[' 10']- (radius_x) * Math.cos(radianEnd-radianStart)) ;
    const middleY = (ele.AcDbCircle[' 20']- (radius_y) * Math.sin(radianEnd-radianStart));
    //radius = radius / (1.29);
    const largeArcFlag = ele.AcDbArc[' 51'] - ele.AcDbArc[' 50'] <= 180 ? 0 : 1;

    const pathData = [
        `M ${startX} ${startY}`,
        `A ${radius_x} ${radius_y} 0 ${largeArcFlag} 1 ${endX} ${endY}`
    ].join(' ');

    // path.setAttribute("transform", `translate(${base_x},${base_y}) scale(${scale_x},${scale_y}) rotate(${rotate})`);
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "none");
    if(color){
        path.setAttribute("stroke", color || "black");
    }
    path.setAttribute("stroke-width", strokeWidth);
    //circle was x y radius*2 radius*2
    //setBBox_wrapper(ele,startX-halfStrokeWidth,startY-halfStrokeWidth,Math.max(startX-endX,startX-middleX)+halfStrokeWidth,Math.max(startY-endY,startY-middleY)+halfStrokeWidth)
    //svg.appendChild(path);
    return path;
}
