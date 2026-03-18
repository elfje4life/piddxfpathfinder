  class lwpolyline extends entity{
      pi_degree = Math.PI / 180;
    constructor(element,parent,color) {
    super(element, 'path',color);
    if (!this.invisible) return;

    const {  AcDbPolyline } = element;

    const {
        [10]:x,
        [20]:y,
        [38]:Elevation = 0,
        [39]:Thicknes = 0,
        [40]:Starting_width = 0,
        [41]:End_width=0,
        [42]:Bulge = 0,
        [43]:Constant_width = 0,
        [70]:flag,
        [210]:xflag,
        [220]:yflag
    } = AcDbPolyline || {};

    let stroke_width = this.stroke_width;
    switch(true){
        case(Starting_width !== 0 && End_width !== 0):
            stroke_width = (Starting_width - End_width * -1)/2;
            break;
        case(Constant_width !== 0):
            stroke_width = Constant_width;
            break;
        case(Thicknes !== 0):
            stroke_width = Thicknes;
            break;
    }

    let d = `M ${x[0]} ${y[0]} `;

    for (let i = 1; i < x.length; i++) {

        let startX = x[i - 1];
        let startY = y[i - 1];
        let endX = x[i];
        let endY = y[i];

        if (Bulge[i - 1] ) {


                let bulge = Bulge[i - 1];
                let dx = endX - startX;
                let dy = endY - startY;
                let chord = Math.sqrt(dx*dx + dy*dy);

                // centrale hoek
                let theta = 4 * Math.atan(bulge);

                // radius
                let radius = chord / (2 * Math.sin(Math.abs(theta) / 2));

                // flags
                let largeArcFlag = (Math.abs(theta) > Math.PI) ? 1 : 0;
                let sweepFlag = (bulge >= 0) ? 1 : 0;

                d += `A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY} `;
                if (flag === 1 && x.length === 2) {
                    d += `A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${startX} ${startY} `;
                }
                let middleX = (startX + endX) / 2;
                let middleY = (startY + endY) / 2;
            this.addPoint(middleX - radius, middleY - radius); // linksboven
            this.addPoint(middleX + radius, middleY - radius); // rechtsboven
            this.addPoint(middleX - radius, middleY + radius); // linksonder
            this.addPoint(middleX + radius, middleY + radius); // rechtsonder

        } else {
            // Draw a straight line if no bulge value
            d += `L ${x[i]} ${y[i]} `;
            this.addLine(x[i-1],y[i-1],x[i],y[i]);
        }
    }

    let strokeLinecap = "butt"
    // Close the polyline if needed
    switch(flag){
        case(128):
            //d += `Z `;
            break;
        case(0):
            //d += `Z `;
            break;
        case(1):
            strokeLinecap="round"
            d += `Z `;

            break;
        default:
            d += `Z `;

    }
        this.set = {d,...AcDbPolyline, "strokeWidth":stroke_width||0, strokeLinecap}// "transform":`scale(${1+3/stroke_width||0})`
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
        const largeArcFlag = endAngle - startAngle <= 180 ? 1 : 0;
        this.addPoint(start.x,start.y);
        this.addPoint(end.x,end.y);
        return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
    }
  }


  //registrer LINE
  Registry.registerClass("LWPOLYLINE", lwpolyline);
  class LwPolyline extends entity {
      pi_degree = Math.PI / 180;

      constructor(element, parent, color) {
          super(element, 'path', color);
          if (!this.invisible) return;

          const { AcDbPolyline } = element || {};

          // Zorg dat arrays altijd bestaan
          const x = Array.isArray(AcDbPolyline?.[10]) ? AcDbPolyline[10] : [AcDbPolyline?.[10]];
          const y = Array.isArray(AcDbPolyline?.[20]) ? AcDbPolyline[20] : [AcDbPolyline?.[20]];
          const Bulge = Array.isArray(AcDbPolyline?.[42]) ? AcDbPolyline[42] : [AcDbPolyline?.[42] || 0];

          const Elevation = AcDbPolyline?.[38] || 0;
          const Thickness = AcDbPolyline?.[39] || 0;
          const Starting_width = AcDbPolyline?.[40] || 0;
          const End_width = AcDbPolyline?.[41] || 0;
          const Constant_width = AcDbPolyline?.[43] || 0;
          const flag = AcDbPolyline?.[70] || 0;

          // Stroke width bepalen
          let stroke_width = this.stroke_width;
          if (Starting_width && End_width) {
              stroke_width = (Starting_width + End_width) / 2;
          } else if (Constant_width) {
              stroke_width = Constant_width;
          } else if (Thickness) {
              stroke_width = Thickness;
          }

          let d = `M ${x[0]} ${y[0]} `;

          // Speciale case: 2 punten + bulge → cirkel
          if (x.length === 2 && Bulge[0]) {
              const dx = x[1] - x[0];
              const dy = y[1] - y[0];
              const chord = Math.sqrt(dx * dx + dy * dy);
              const theta = 4 * Math.atan(Bulge[0]);
              const radius = chord / (2 * Math.sin(Math.abs(theta) / 2));

              if (Math.abs(theta) >= 2 * Math.PI) {
                  d = `M ${x[1]} ${y[1]}
                  A ${radius} ${radius} 0 1 0 ${x[1]} ${y[1]}
                  A ${radius} ${radius} 0 1 0 ${x[0]} ${y[0]} Z`;
              }
          } else {
              // Normale polyline
              for (let i = 1; i < x.length; i++) {
                  const startX = x[i - 1];
                  const startY = y[i - 1];
                  const endX = x[i];
                  const endY = y[i];

                  if (Bulge[i - 1]) {
                      const bulge = Bulge[i - 1];
                      const dx = endX - startX;
                      const dy = endY - startY;
                      const chord = Math.sqrt(dx * dx + dy * dy);

                      const theta = 4 * Math.atan(bulge);
                      const radius = chord / (2 * Math.sin(Math.abs(theta) / 2));

                      const largeArcFlag = Math.abs(theta) > Math.PI ? 1 : 0;
                      const sweepFlag = bulge >= 0 ? 1 : 0;

                      d += `A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY} `;
                  } else {
                      d += `L ${endX} ${endY} `;
                      this.addLine(startX, startY, endX, endY);
                  }
              }
          }

          // Polyline sluiten
          let strokeLinecap = "butt";
          if (flag === 1) {
              strokeLinecap = "round";
              d += "Z";
          }

          this.set = {
              d,
              ...AcDbPolyline,
              strokeWidth: stroke_width || 0,
              strokeLinecap
          };
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
          const largeArcFlag = endAngle - startAngle <= 180 ? 1 : 0;
          this.addPoint(start.x, start.y);
          this.addPoint(end.x, end.y);
          return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
      }
  }

  // Registreren
 // Registry.registerClass("LWPOLYLINE", LwPolyline);
