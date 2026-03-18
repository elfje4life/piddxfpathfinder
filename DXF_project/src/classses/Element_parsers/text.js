class text extends entity {
    constructor(element, parent, color) {
        super(element, 'text', color);

        // Probeer eerst AcDbText, anders AcDbMText
        const { AcDbText, AcDbMText } = element;
        const source = AcDbText || AcDbMText  || {};
        //attrib needs the acdbelements

        const {
            [71]: mirror = 0,
            [72]: rawHorizon = 0,
            [73]: rawVertical = 0,
            [40]: height = 0,
        } = source;

        const extra = {
            text: source?.[1] ?? source?.[3],
            rotation: source?.[50] ?? 0,
            x: source?.[10] ?? 0,
            y: source?.[20] ?? 0,
        };

        let horizon =  rawHorizon;
        let vertical =  rawVertical;
       // 5 -
       //3 -
        const raw = {
            fontFamily: source?.[7] ?? "Arial",
            fontSize: source?.[40] ?? 12,
            fill: "currentColor",
            stroke: "none"
        };

        // 🔁 Mirror via scale only
        const scale_x = (mirror & 2) ? -1 : 1;
        const scale_y = (mirror & 4) ? -1 : 1;
        let offset_x = 0;
        if(extra.rotation == 0){
            offset_x = height;
        }
        const transform = ` translate(${extra.x+offset_x} ${extra.y})   rotate(${extra.rotation + 180}) scale(${-scale_x},${scale_y})`;

        // 📍 Horizontal alignment
        let textAnchor = "start";
        if ([1, 3, 4].includes(horizon)) textAnchor = "middle";
        else if (horizon === 2) textAnchor = "end";

        // 📐 Vertical alignment
        let dominantBaseline = "alphabetic";
        switch (vertical) {
            case 1: dominantBaseline = "text-after-edge"; break;
            case 2: dominantBaseline = "middle"; break;
            case 3: dominantBaseline = "text-before-edge"; break;
        }

        // ✅ Final SVG attributes
        this.set = {

            ...raw,
            textAnchor,
            dominantBaseline,
            ...source,
            transform,
        };

        this.element.textContent = extra.text;
       // this.addPoint(extra.x, extra.y);
       // this.addPoint(extra.x+extra.text.length*extra.text.fontSize, extra.y+extra.text.fontSize)
    }
}

// registreren
//Registry.registerClass("ATTDEF", text);
//Registry.registerClass("AcDbText", text);
Registry.registerClass("ATTRIB", text);
Registry.registerClass("TEXT", text);
//Registry.registerClass("MTEXT", text);
