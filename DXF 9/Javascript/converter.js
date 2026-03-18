//Converter om Dxf naar svg te krijgen
const svgNS = "http://www.w3.org/2000/svg";
const pi = Math.PI;
let link = [];
let info_5 = {};
let debug = true;
let imageNX = 0;
let imageNY = 0;
let drawing;
let missing = [[],[]];
let scrolling_speed = 0.05;
let stroke_width = 1;

//first function to be called
function connected(object){
           drawing = setup_svg(object); //SVG element with scrolling
          const kks = document.createElementNS(svgNS, "g");
          //const groep = document.createElementNS(svgNS, "g");
          drawing.appendChild(set_BLOCKS(object.BLOCKS)); //Add the blocks to the drawing as symbols

          object.ENTITIES.LINE = mergeLines(object.ENTITIES.LINE)

          //cleanup the INSERT Array
           requestAnimationFrame(() => {
                object.ENTITIES.INSERT = mergeBoundingBoxes(object.ENTITIES.INSERT, object)
                //object.ENTITIES.INSERT = [];
                //draw everything else
                merge_svg(drawing, draw(object.ENTITIES,"black"))
           })



}

function setup_svg(object){
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", innerWidth);
    svg.setAttribute("height", innerHeight);
    //svg.setAttribute("transform", 'scale(1,-1)');// rotate(180)');
    svg.setAttribute("viewBox", `${parseFloat(file.HEADER.$LIMMIN[' 10'])+imageNX} ${parseFloat(file.HEADER.$LIMMIN[' 20'])+imageNY} ` + innerWidth + " " + innerHeight);
    document.getElementById("svgContainer").appendChild(svg);
    let svgContainer = document.getElementById("svgContainer")

    base_x = innerWidth;
    base_y =  innerHeight;
    scale_x = file.HEADER.$LIMMIN[' 20'] < 0 ? -1 : 1;;//(innerWidth - file.HEADER.$LIMMAX[' 10']) / file.HEADER.$LIMMIN[' 10'];
    scale_y = file.HEADER.$LIMMIN[' 10'] < 0 ? -1 : 1;
    rotate = 0;
    svg.setAttribute("transform",`scale(${scale_x} ${scale_y})  `)

    if(imageNX >= -1000){
    imageNX += parseFloat(file.HEADER.$LIMMIN[' 10']) -50
    }else{menu
    imageNX = 0;
    imageNY += parseFloat(file.HEADER.$LIMMAX[' 20']) +50
    }


    // Add zooming functionality centered on the mouse location
    svg.addEventListener('wheel', function(event) {
        event.preventDefault();
        const viewBox = svg.getAttribute('viewBox').split(' ').map(Number);
        const [viewX, viewY, viewWidth, viewHeight] = viewBox;
        let zoomFactor = event.deltaY < 0 ? 1-scrolling_speed : 1+scrolling_speed;


        // Calculate mouse position relative to the SVG element
        const svgRect = svg.getBoundingClientRect();
        const mouseX = event.clientX - svgRect.left;
        const mouseY = event.clientY - svgRect.top;
        // Calculate new viewBox dimensions
        const newWidth = viewWidth * zoomFactor > 1000 ? 1000 : viewWidth * zoomFactor;
        const newHeight = viewHeight * zoomFactor > 1000 ? 1000 : viewHeight * zoomFactor;
        // Calculate the new top-left corner of the viewBox to keep the zoom centered on the mouse
        let newViewX = viewX + (mouseX / svgRect.width) * (viewWidth - newWidth);
        let newViewY = viewY + (mouseY / svgRect.height) * (viewHeight - newHeight);


        svg.setAttribute('viewBox', `${newViewX} ${newViewY} ${newWidth} ${newHeight}`);} );

    svg.addEventListener('mousedown', function(event) {
        event.preventDefault();
        let startX = event.clientX;
        let startY = event.clientY;
        const viewBox = svg.getAttribute('viewBox').split(' ').map(Number);

        function onMouseMove(e) {
            const dx = startX - e.clientX;
            const dy = startY - e.clientY;

            viewBox[0] += dx * scale_x * viewBox[2]/innerWidth ;
            viewBox[1] += dy * scale_y * viewBox[3]/innerHeight ;
            svg.setAttribute('viewBox', viewBox.join(' '));

            startX = e.clientX;
            startY = e.clientY;
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    svg.addEventListener("onresize", (event) => {

        const viewBox = svg.getAttribute('viewBox').split(' ').map(Number);
        const [viewX, viewY, viewWidth, viewHeight] = viewBox;
        svg.setAttribute('viewBox', `${viewX} ${viewY} ${viewWidth} ${viewHeight}`)

    });
    return svg
};

function set_BLOCKS(object, color) {
    const group = document.createElementNS(svgNS, "g");
    const extra = 1;
    const half_extra = extra/2;

    for (let blocks in object) {
        if (typeof object[blocks] === 'undefined') continue;
        const symbol = document.createElementNS(svgNS, "symbol");

        const block = draw(object[blocks]);
        fake_draw(block, object[blocks])

         requestAnimationFrame(() => {
        //getBBox_wrapper(object[blocks])
        //console.log(object[blocks])
        //const bbox = object[blocks].bbox
        const bbox = object[blocks].bbox
        //console.log(bbox)
        if(bbox){
            symbol.setAttribute('id', blocks); // Here is the search!
            //merge_svg(symbol,block)
            merge_svg(symbol,block,[['transform', `translate(${-bbox.x+half_extra},${-bbox.y+half_extra})`]]);
            //symbol.setAttribute('transform', `translate(${-bbox.x+4},${-bbox.y+4})`);

            symbol.setAttribute('width', `${bbox.width+extra}`);
            symbol.setAttribute('height', `${bbox.height+extra}`);
            if (object[blocks].AcDbBlockBegin) {
                symbol.setAttribute('x', `${bbox.x-half_extra-object[blocks].AcDbBlockBegin[' 10']*1}`);
                symbol.setAttribute('y', `${bbox.y-half_extra-object[blocks].AcDbBlockBegin[' 20']*1}`);

            }else{
               symbol.setAttribute('x', `${bbox.x-half_extra}`);
               symbol.setAttribute('y', `${bbox.y-half_extra}`);
            }
            group.appendChild(symbol);
        }
         })
    }
    return group
}

//checking the object for usefull objects
function draw(object, color, overrule){
    let output = [];
    for(child in object){
        const op = handle_check(object,overrule||child,color);
        if(op){

            output.push(op)
        };
    };
    return output;
}

//handle each checking returns the caller function of the same name as toCheck
function handle_check(object,tocheck,color){
    //is there a function called checkchild
    if(typeof window[tocheck] !== "function"){return};
    //is there inside the object the tocheck child
    if(object[tocheck]){
        //is it array?
        if(Array.isArray(object[tocheck])){
            const group =  document.createElementNS(svgNS, "g");
            group.setAttribute("id",`${tocheck}`)
            object[tocheck].forEach(element => {
                const b = window[tocheck](element,color);
                if(b){

                   // b.setAttribute("data-link",link.length);
                   // b.setAttribute("onclick",`info(${link.length})`)
                    group.appendChild(b);
                }
            });

            return group;
        } else {
            //console.log(object)
            return window[tocheck](object[tocheck],color);
        };
    }
}

function info(number){
    if(debug==true){
        console.log(link[number])
    }
}

function merge_svg(parent, child, attributes = []){
    if(Array.isArray(child)){
        child.forEach(element =>{
            attributes.forEach(att => {
                element.setAttribute(att[0],att[1])
            })
            parent.appendChild(element)
        });
    }
};

//element is like object[blocks]
function getBBox_wrapper(object){
 //wrapper to get the bbox is the object doesnt have a bbox read it and set it in the object
    if(object.bbox){return object.bbox};
    if(!object.bbox&&1==2){
        console.log("true")
        for(let object_child in object){
            if(typeof object[object_child] == "object"){
                const bbox = getBBox_wrapper(object[object_child])
                if(bbox){
                    setBBox_wrapper(object,bbox.x,bbox.y,bbox.width,bbox.height)
                }
            }
            if(Array.isArray(object[object_child])){
                object[object_child].forEach(ele => {
                    const bbox = getBBox_wrapper(ele)
                    if(bbox){
                    setBBox_wrapper(object,bbox.x,bbox.y,bbox.width,bbox.height)
                    }
                })
            }
        }
    }else{
        //console.log(object.bbox)
        return object.bbox
    };


}

function setBBox_wrapper(object, x=0, y=0, width=0, height=0) {
     //fake_draw(object)
    if(width !== 0 || height !== 0 ) {
        if(!object.bbox) {
            object.bbox = { x: x, y: y, width: width, height: height };
            return;
        }

        object.bbox.x = Math.min(object.bbox.x, x);
        object.bbox.y = Math.min(object.bbox.y, y);

        // Calculate the new width and height based on how the sizes should scale
        let newX = Math.max(object.bbox.x + object.bbox.width, x + width);
        let newY = Math.max(object.bbox.y + object.bbox.height, y + height);

        object.bbox.width = newX - object.bbox.x;
        object.bbox.height = newY - object.bbox.y;
    }else{
        //here the fake drawing of the bbox if no bbox is provided
        fake_draw(draw(object),object)
    }
}

function fake_draw(ele,object){
    //fakedraw only if there need for a bbox else skip
    if(object.bbox){return object.bbox};

    const tempSvg = document.createElementNS(svgNS, "svg");
    const group = document.createElementNS(svgNS, "g");

    merge_svg(group, ele);
   // group.setAttribute("stroke", "blue");
    //group.setAttribute("stroke-width", 1);


    tempSvg.appendChild(group);
    document.body.appendChild(tempSvg);
    let bbox
    //check if there is a INSERT that needs to be read
    if(object.INSERT){
        if(object.INSERT.AcDbBlockReference){
        //console.log(file.BLOCKS[object.INSERT.AcDbBlockReference['  2']])
        //is there a bbox
        if(!file.BLOCKS[object.INSERT.AcDbBlockReference['  2']].bbox){
            const block = draw(file.BLOCKS[object.INSERT.AcDbBlockReference['  2']] );
            fake_draw(block,file.BLOCKS[object.INSERT.AcDbBlockReference['  2']]);
            //console.log(block)
            //for (let blocks in file.BLOCKS[object.INSERT.AcDbBlockReference['  2']]) {
            //console.log(file.BLOCKS[object.INSERT.AcDbBlockReference['  2']][blocks])
            //  if (typeof file.BLOCKS[object.INSERT.AcDbBlockReference['  2']][blocks] === 'undefined') continue;
            //const block = draw(file.BLOCKS[object.INSERT.AcDbBlockReference['  2']] ,"green");
            //fake_draw(block,file.BLOCKS[object.INSERT.AcDbBlockReference['  2']]);
            //console.log(blocks)
            merge_svg(group, block);
            //};
        };
        };
    };

    merge_svg(group, ele);
    tempSvg.appendChild(group);
    document.body.appendChild(tempSvg);
    bbox = group.getBBox({fill:true, stroke:true, markers:false, clipped:false});

    requestAnimationFrame(() => {
        if (bbox.x == 0 && bbox.y == 0 && bbox.width == 0 && bbox.height == 0) {
           // bbox = {x:-100,y:-100,width:200, height:200};
            // bbox = file.BLOCKS[object.INSERT.AcDbBlockReference['  2']].bbox;
        }
        object.bbox = {x:bbox.x,y:bbox.y,width:bbox.width, height:bbox.height};
        document.body.removeChild(tempSvg);
    });
    return bbox;
}



function reset(){
    document.getElementById("svgContainer").innerHTML =""
    document.body.appendChild(input);
}

function handle_insert(ele, color){
    const group = document.createElementNS(svgNS, "a");
    const use = document.createElementNS(svgNS, "use");
    //color = "red";

    if(ele.AcDbEntity[' 60'] == 1){
        return
    };

    if(ele.AcDbBlockReference['  2'] == 'TRECHTER' || ele.AcDbBlockReference['  2'] == 'speldje'){
        return
    }

    use.setAttribute("stroke", color);
    use.setAttribute("stroke-width", 4);
    //this piece need to be called by the caller for this case INSERT! so blocks.ENTITES
    const block = draw(ele,color);
    merge_svg(group,block)

    //let bbox = ele.bbox || getBBox_wrapper(file.BLOCKS[ele.AcDbBlockReference['  2']])
    use.setAttribute("transform", `translate(${ele.AcDbBlockReference[' 10']} ${ele.AcDbBlockReference[' 20']}) scale(${((ele.AcDbBlockReference[' 41'])||1)} ${(ele.AcDbBlockReference[' 42']||1)}) rotate(${(ele.AcDbBlockReference[' 50'] || 0)})`);
    use.setAttribute("href", `#${ele.AcDbBlockReference['  2']}`);

    group.appendChild(use);
    return group;
}


