class insert extends entity{

    constructor(element, parent, color) {
        super(element, 'use', color);
        if (!this.invisible) return;

        const {  ATTRIB, AcDbBlockReference,  ["{"] : kks } = element;
        const blockName = AcDbBlockReference?.[2]
        //voeg blok toe
        parent.BlockCheck(blockName, parent)
        //blok is toegevoegd of niet maar als het zo is dan moeten de punten worden toegevoegd anders kan je em niet tekenen
        //als deze containted is in een andere block symbol
        const viewbox = parent.getBlockDimentions(blockName).split(" ")
        this.addPoint(viewbox[0],viewbox[1])
        this.addPoint(viewbox[2],viewbox[3])



        const raw = {
             //x: AcDbBlockReference?.[10] ?? 0,
             //y: AcDbBlockReference?.[20] ?? 0,
            //width: viewbox?.[2],
            //height: viewbox?.[3],
            href: `#${blockName}`,
            transform: `  translate(${AcDbBlockReference?.[10] ?? 0} ${AcDbBlockReference?.[20] ?? 0}) rotate(${AcDbBlockReference?.[50] ?? 0}) scale(${AcDbBlockReference?.[41] ?? 1} ${(AcDbBlockReference?.[42] ? AcDbBlockReference[42]*-1 : "1")})`,
            url: AcDbBlockReference?.[1000],
            kks: kks?.[1000]
        };//translate(${AcDbBlockReference?.[10] ?? 0} ${AcDbBlockReference?.[20] ?? 0})

        this.set = raw;

        //maak de extra text als attrib
        if(ATTRIB){
             parent.Draw({TEXT:ATTRIB}, parent, 1)
            //this.appendAllElements(this.elements);
        }
       // if(blockName == "ATTRIBUTE4"){
           // console.log(this)
       // }

    }
}


//registrer LINE
Registry.registerClass("INSERT", insert);
