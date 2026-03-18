class entity extends SvgWrapper {
    points = new Set();


    constructor(element, type, color) {
        super(type, color);
        const { AcDbEntity } = element || {};
        let extra_info = {};
       // console.log(element)
        // Loop door alle keys van het object
        for (const key in element) {
            //if (Object.hasOwn(element, key)) {
                // Check of de key begint met "aCdB"
                if (key.startsWith("AcDb")) {
                    Object.assign(extra_info,element[key])
                   // extra_info[key] = element[key];
                }
            //}
        }
        this.invisible = AcDbEntity?.[60] !== 1;
       //console.log(extra_info)
        this.set = { layer: AcDbEntity?.[8], ...extra_info}
    }

    addPoint(x, y) {
        if (isNaN(x)) { console.log("ger") }
        this.points.add({ x, y })
    };

    addLine(x1, y1, x2, y2) {
        if (!this.line) { this.line = new Set() }
        this.line.add({
            x1,
            y1,
            x2,
            y2,
            dx: x2 - x1,
            dy: y2 - y1,
            ddxy: x2 * y1 - x1 * y2
        });
        this.addPoint(x1, y1);
        this.addPoint(x2, y2);
    };
    checkExtreme() {
        if (!this.Extremes) {
            this.Extremes = { x: Infinity, y: Infinity, X: -Infinity, Y: -Infinity };
        }
    }
    updateExtremes({ x, y }) {
        this.checkExtreme();
        this.Extremes = {
            x: Math.min(this.Extremes.x, x),
            X: Math.max(this.Extremes.X, x),
            y: Math.min(this.Extremes.y, y),
            Y: Math.max(this.Extremes.Y, y),
        };
    }

    get viewBox() {
        this.checkExtreme();


        for (const [key, value] of this.points.entries()) {
            //console.log(value)
            this.updateExtremes(value)
        }

        const { x, y, X, Y } = this.Extremes
        const dikte = Registry.getDefaultValue("strokeWidth");


        return `${x - dikte / 2} ${y - dikte / 2} ${Math.abs(X - x) + dikte} ${Math.abs(Y - y) + dikte}`
    }
}
