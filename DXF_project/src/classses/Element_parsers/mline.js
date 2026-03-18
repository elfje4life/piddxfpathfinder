class mline extends entity{

    constructor(element,parent,color) {
        super(element, 'path',color);
        if (!this.invisible) return;

        const {  AcDbMline } = element;

        const {
            [10]:startXOffset,
            [11]:vertexX,
            [12]:directionX,
            [13]:miterX,

            [20]:startYOffset,
            [21]:vertexY,
            [22]:directionY,
            [23]:miterY,

            [39]:strokeWidth = this.stroke_width,
            [41]:scale ,
            [42]:areaFill,
            [74]:scale_par,
            [75]:areaFill_par,
        } = AcDbMline || {};





        let startIndex = vertexX.findIndex((x, i) => x === startXOffset && vertexY[i] === startYOffset);

        if (startIndex === -1) {
            console.warn("Start offset not found in vertex data.");
            startIndex = 0;
        }
        /*
        const strokeDasharray = (scale ?? [])
       // .toString()                 // zorg dat het een string is
      //  .split(",")                 // maak array
        .map(x => {
            if(Math.abs((x))>0){
                return 1;
            }else{
               return 0;
            }

        }) // maak positief getal
        .reverse()                  // draai array om
        .splice(0,3)
       // .join(",");                 // terug naar string
*/

        const strokeDasharray = (!scale ? [] : [0,0.5,0])

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

        let d = `M ${currentX} ${currentY}`;
        this.addPoint(currentX,currentY);


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

            /*let distance_from = 1;

            switch(scale_par[nextIndex]){
                case 0:

                    break;
                case 1:
                    distance_from = scale[0+sum]

                case 2 :
                    distance_from = scale[2+sum]

                case 3 :
                    distance_from =scale[2+sum]

            }
            if(distance_from){strokeDasharray.push(distance_from)}
            if(scale_par[nextIndex]>3){
                console.log("alternating not added jet")
            }
*/


            currentX = vertexX[nextIndex];
            currentY = vertexY[nextIndex];
            currentDirectionX = directionX[nextIndex];
            currentDirectionY = directionY[nextIndex];
            currentMiterX = miterX[nextIndex];
            currentMiterY = miterY[nextIndex];

            d += ` L ${currentX} ${currentY}`;
            this.addPoint(currentX,currentY);


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

        this.set = {d,strokeDasharray,strokeWidth,...AcDbMline};


    }
}


//registrer LINE
Registry.registerClass("MLINE", mline);
