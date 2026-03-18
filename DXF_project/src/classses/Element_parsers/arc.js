/** @class arc
 */
class arc extends entity{
    pi_degree = Math.PI / 180;
    /** @param {element: Recordset<key,any>} element
     */
    points = new Set();
    constructor(element, parent, color) {
        super(element, 'path', color);
        if (!this.invisible) return;

        const { AcDbCircle, AcDbArc } = element;

        const {
            [10]:x,
            [20]:y,
            [40]:r,
        } = AcDbCircle || {};

        const {
            [50]:startAngle,
            [51]:endAngle,
            [39]:strokeWidth = Registry.getDefaultValue('strokeWidth'),
        } = AcDbArc || {};

        const d = this.arcPath(x, y, r, startAngle, endAngle);

        this.set = {strokeWidth,d};

    }

    polarToCartesian(cx, cy, r, angleDeg) {
        const rad = angleDeg * this.pi_degree;
        return {
            x: cx + r * Math.cos(rad),
            y: cy + r * Math.sin(rad)
        };
    }

    arcPath(cx, cy, r, startAngle, endAngle) {
        const start = this.polarToCartesian(cx, cy, r, endAngle);
        const end = this.polarToCartesian(cx, cy, r, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
        this.addPoint(start.x,start.y);
        this.addPoint(end.x,end.y);
        return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
    }

}

//registrer ARC
Registry.registerClass("ARC", arc);
