class blocks extends entity {
    constructor(element, caller, color) {
        super(element, 'symbol', color);
        if (!this.invisible) return;
        //console.log(this)
        //console.log(element)
        //console.log(element)
        const { AcDbBlockBegin } = element;

        const name = {id: AcDbBlockBegin?.[2] ?? AcDbBlockBegin?.[3] ?? "unnamed"};



        this.elements = new Element(element, caller, 0)

        if(name.id == "ATTRIBUTE4"){
            // geen ideee
            //const testelement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            //testelement.setAttribute("width",10)
            //testelement.setAttribute("height",10)
            //testelement.setAttribute("fill","red")
            //this.append(testelement);
            this.addPoint(-0.01,-0.01);
            this.addPoint(0.01,0.01);
        }

        this.appendAllElements(this.elements);
        this.addPoint(0,0);


       // this.addPoint(0,0);
        this.set = name;
        this.viewBox
        const {x, y, X, Y} = this.Extremes


//for the viewBox
        const raw = {
            x: AcDbBlockBegin?.[10] + x ?? x,
            y: AcDbBlockBegin?.[20] + y ?? y,
            width: Math.abs(X-x),
            height: Math.abs(Y-y),
            viewBox: this.viewBox
        };
        this.set = raw;

    }


}



//registrer LINE
Registry.registerClass("blocks", blocks );
