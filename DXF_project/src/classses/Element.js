
class Element extends svgCombiner{
    static missing_functions = new Set();
    static blocks = new Map();
    elements = new Map()

    constructor(object, caller, color = 1) {
        super();
        const {HEADER} = object;
        if(HEADER){
            const {$LIMMIN} = HEADER;
            this.viewBox = [$LIMMIN?.[10], $LIMMIN?.[20] ,window.innerWidth, window.innerHeight]
        };
        this.object = object;
        this.caller = caller || this;
       // console.log(object)
        this.Draw(object, color);

    }
    get svg(){
        this.addSet();
        return this.element;
    }
    addSet(){
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("style", "color: white;")
        svg.setAttribute("height", "100%");
        svg.setAttribute("viewBox", this.viewBox.join(' '));
       // console.log(this.viewBox[1]-this.viewBox[3])
        if(this.viewBox[1]-this.viewBox[3] > 0){
           svg.setAttribute("transform",`scale(1,1)`)
        }else{
           svg.setAttribute("transform",`scale(1,-1)`)
        }

        this.element = svg;
        this.appendAllElements(this);

    }
    getBlockDimentions(name){
        const block = this.elements.get(name);
        return block.viewBox;
    }
    BlockCheck(name){

        if(Element.blocks.has(name)){return}
        if(this.elements.has(name)){return}
        if(!this.object.BLOCKS[name]){console.error(`Block not Found: ${name}`);return}

        //console.log(this.object.BLOCKS[name])
        const instance = Registry.newClass("blocks", this.object.BLOCKS[name], this.caller, 0);
        if (instance?.invisible === false){return};
        //for now simpler things make it work!
        //TODO: de Elements wordt de Registry van de BLOCKS maar daar moeten de timestamps van de HEADER bij,
        // zo wordt altijd de laatst mogelijke BLOCK gebruikt
        this.elements.set(name, instance);
        Element.blocks.set(name, instance);
    }

      Draw(object,color) {
        for (const [key, values] of Object.entries(object)) {
            //const location = key;
            if (Registry.hasClass(key)) {
                const items = Array.isArray(values) ? values : [values];
                for (const raw of items) {
                    const instance = Registry.newClass(key, raw, this.caller, color);
                    if (instance?.invisible === false) continue;


                        //if(!this.elements[location]){this.elements[location] = new Set()}
                       // this.elements[location].add(instance);
                    /*
                    if(key === "BLOCK"){
                        const name = raw.AcDbBlockBegin?.[2] ?? raw.AcDbBlockBegin?.[3];
                        this.elements.set(name, instance);
                    }else{
                        this.elements.set(this.key, instance);
                    }*/
                    this.elements.set(this.key, instance);
                }
                continue;
            }

            if (typeof values === "object" && !Array.isArray(values) ) {
                this.Draw(values); // recurse
                if(isNaN(parseInt(key))){
                    Element.missing_functions.add(key);

                }
            } else {
                if(isNaN(parseInt(key))){
                    Element.missing_functions.add(key);

                }
            }
        }
    }

    get key(){
        if(!this.index){this.index = 0;}
        return this.index++;
    }

    VieuwSVG(svgvieuwer){
        if(svgvieuwer instanceof SVG){
            svgvieuwer.svg = this.element;
        }
    }
}

/** @typedef ElementOptions
 *  @property {string} type - SVG element type like 'rect', 'circle', etc.
 *  @property {string} [svgNS] - Namespace URI, default is 'http://www.w3.org/2000/svg'.
 *  @property {string} caller
 *  @property {string} object
 *  @property {string} color
 */
