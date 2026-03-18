class circle extends entity{

    constructor(element, parent, color) {
        super(element, 'circle', color);
        if (!this.invisible) return;

        const { AcDbCircle } = element;

        const raw = {
            cx: AcDbCircle?.[10],
            cy: AcDbCircle?.[20],
            r: AcDbCircle?.[40],
            strokeWidth: AcDbCircle?.[39] //?? Registry.getDefaultValue("strokeWidth")
        };
        // Voeg de 4 hoeken van de bounding box toe
        this.addPoint(raw.cx - raw.r, raw.cy - raw.r); // linksboven
        this.addPoint(raw.cx + raw.r, raw.cy - raw.r); // rechtsboven
        this.addPoint(raw.cx - raw.r, raw.cy + raw.r); // linksonder
        this.addPoint(raw.cx + raw.r, raw.cy + raw.r); // rechtsonder
        this.set = raw;

    }
}


//registrer LINE
Registry.registerClass("CIRCLE", circle);
