class line extends entity{

    constructor(element,parent,color) {
        super(element, 'line',color);
        if (!this.invisible) return;

        const {  AcDbLine } = element;

        const raw = {
            x1: AcDbLine?.[10],
            y1: AcDbLine?.[20],
            x2: AcDbLine?.[11],
            y2: AcDbLine?.[21],
            strokeWidth: AcDbLine?.[39] //?? Registry.getDefaultValue("strokeWidth")
        };

        this.set = raw;

       this.addLine(raw.x1,raw.y1,raw.x2,raw.y2);
    }
}


//registrer LINE
Registry.registerClass("LINE", line);
