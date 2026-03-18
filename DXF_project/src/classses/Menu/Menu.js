
let a;
async function fileInput(e) {
  for (const file of e.files) {
    const text = await file.text();
    const parsed = await DxfParser.parseText(text);
    console.log(parsed);

    // hier moet de geparsed object dus getekend worden.
    //new SVG(parsed); //create svg handler
    const svg1 = new SVGHandler("svg-container");
    //new SvgDrawer(parsed); //draw svg
    a = new Element(parsed);
    svg1.injectSVGContent(a.svg)
    console.log(a);
    //let blocks = new Map();
    // First one is for all known element
    //for (const [key, values] of Object.entries(parsed.BLOCKS)) {
     // blocks.set(key,new pathfinder("http://www.w3.org/2000/svg", values));
    //}
    //replace all the blocks but now run with INSERTS
    //for (const [key, values] of Object.entries(parsed.BLOCKS)) {
    //  blocks.set(key,new pathfinder("http://www.w3.org/2000/svg", values, blocks));
    //}

    //let entities = new pathfinder("http://www.w3.org/2000/svg", parsed, blocks)

    // a = new preproccesing(parsed);
   // console.log(blocks);
   //console.log(entities);

  }
}

async function show_symbols() {
  const svg_listing = document.getElementById("svg_listing");

  getallsymbols();
  if (svg_listing.style.left !== "-80px" || !svg_listing.style.left ) {
    svg_listing.style.left = "-80px";
  } else {
    svg_listing.style.left = "0px";

  }
}
const symbols = new Set();
function getallsymbols() {
  const svgs = document.querySelectorAll("svg");
  const symbol_menu = document.getElementById("svg_listing");
  const svgNS = "http://www.w3.org/2000/svg";

  svgs.forEach((svg) => {
    const svgSymbols = svg.querySelectorAll("symbol");
    svgSymbols.forEach((symbol) => {
      if (!symbols.has(symbol.id)) {
        const svg = document.createElementNS(svgNS, "svg");
        const use = document.createElementNS(svgNS, "use");
        svg.setAttribute("class", "icon");
        use.setAttribute("href", `#${symbol.id}`);

        svg.appendChild(use);
        symbols.add(symbol.id);
        symbol_menu.appendChild(svg);
      }
    });
  });

  return symbols;
}
