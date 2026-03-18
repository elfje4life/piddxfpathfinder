class SvgDrawer {
  #svgNS = "http://www.w3.org/2000/svg";
  #svg;
  #missingFunctions = new Set();

  constructor(parsedFile, containerId = "my-svg") {
    const container = document.getElementById(containerId);
    this.#svg = container;
    //this.#svg.setAttribute("width", "100%");
    //this.#svg.setAttribute("height", "100%");
    //this.#svg.setAttribute("viewBox", "0 0 1000 1000");
    //container.appendChild(this.#svg);

    const { ENTITIES } = parsedFile;
    this.#dispatchEntities(ENTITIES);
  }

  #dispatchEntities(object) {
    for (const [key, values] of Object.entries(object)) {
      const handler = this.#entityHandlers[key];
      if (handler) {
        (Array.isArray(values) ? values : [values]).forEach(handler);
      } else {
        this.#missingFunctions.add(key);
      }
    }
  }

  #drawLine = (line) => {
    const  { ['10']: x1, ['11']: x2, ['20']: y1, ['21']: y2 } = line.AcDbLine;
    const el = document.createElementNS(this.#svgNS, "line");
    el.setAttribute("x1", x1);
    el.setAttribute("y1", y1);
    el.setAttribute("x2", x2);
    el.setAttribute("y2", y2);
    el.setAttribute("stroke", "black");
    el.setAttribute("stroke-width", "1");
    this.#svg.appendChild(el);
  };

  #drawArc = (arc) => {
    const {
      AcDbArc: { ["50"]: startDeg, ["51"]: endDeg },
      AcDbCircle: { ["10"]: cx, ["20"]: cy, ["40"]: r },
    } = arc;

    const startRad = (-startDeg * Math.PI) / 180;
    const endRad = (-endDeg * Math.PI) / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArcFlag = endDeg - startDeg <= 180 ? 0 : 1;

    const path = document.createElementNS(this.#svgNS, "path");
    path.setAttribute(
      "d",
      `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`
    );
    path.setAttribute("stroke", "black");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-width", "1");
    this.#svg.appendChild(path);
  };

  #drawPolyline = (polyline) => {
    const {
      AcDbPolyline: { ["10"]: x = [], ["20"]: y = [], ["42"]: bulge = [] },
    } = polyline;

    let d = `M ${x[0]} ${y[0]} `;
    for (let i = 1; i < x.length; i++) {
      if (bulge[i - 1]) {
        const dx = x[i - 1] - x[i];
        const dy = y[i - 1] - y[i];
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = dist / 2 / Math.abs(bulge[i - 1]);
        const sweepFlag = bulge[i - 1] > 0 ? 1 : 0;
        d += `A ${radius} ${radius} 0 0 ${sweepFlag} ${x[i]} ${y[i]} `;
      } else {
        d += `L ${x[i]} ${y[i]} `;
      }
    }

    const path = document.createElementNS(this.#svgNS, "path");
    path.setAttribute("d", d);
    path.setAttribute("stroke", "black");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-width", "1");
    this.#svg.appendChild(path);
  };

  #entityHandlers = {
    LINE: this.#drawLine,
    ARC: this.#drawArc,
    LWPOLYLINE: this.#drawPolyline,
    // Voeg meer handlers toe zoals TEXT, MLINE, INSERT...
  };
}
