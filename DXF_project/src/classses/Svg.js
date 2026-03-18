class SVGHandler {
    static svgNS = "http://www.w3.org/2000/svg";
    static defaultScrollingSpeed = 0.05;

    #svg;
    #container;
    #viewX = 0;
    #viewY = 0;
    #viewWidth = window.innerWidth;
    #viewHeight = window.innerHeight;
    #scrollingSpeed;
    scale_x = 1;
    scale_y = 1;

    constructor(containerId = "svg-container", scrollingSpeed = SVGHandler.defaultScrollingSpeed) {
        this.#container = document.getElementById(containerId);
        if (!this.#container) throw new Error(`Container "${containerId}" not found.`);


        this.#scrollingSpeed = scrollingSpeed;
        this.#addEvents();
    }

    // Public method to inject SVG content
    injectSVGContent(svgElement) {
       // if (!(svgElement instanceof Element)) {
        //    console.error("Provided element is not an SVGElement.");
        //   return;
        //}
        //svgElement.addSet()
        this.#svg = svgElement;
        this.#container.appendChild(svgElement);
        this.#addEvents();
        this.#updateViewBoxVars();
    }

    // Private methods
    #addEvents() {
    this.#container.addEventListener("wheel", this.#handleScrollZoom);
    this.#container.addEventListener("mousedown", this.#handleMouseDown);
    window.addEventListener("resize", this.#handleResize);
    }

    #handleScrollZoom = (event) => {
    event.preventDefault();
    this.#updateViewBoxVars();

    const zoomFactor = event.deltaY < 0
    ? 1 - this.#scrollingSpeed
    : 1 + this.#scrollingSpeed;

    const rect = this.#svg.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const newWidth = this.#viewWidth / zoomFactor;
    const newHeight = this.#viewHeight / zoomFactor;

    const newViewX = this.#viewX - (mouseX / rect.width) * (newWidth - this.#viewWidth);
    const newViewY = this.#viewY - (mouseY / rect.height) * (newHeight - this.#viewHeight);

    this.#svg.setAttribute("viewBox", `${newViewX} ${newViewY} ${newWidth} ${newHeight}`);
    };

    #handleMouseDown = (event) => {
    event.preventDefault();
    let startX = event.clientX;
    let startY = event.clientY;

    this.#updateViewBoxVars();

    const scaleX = this.#viewWidth / this.#container.offsetWidth;
    const scaleY = this.#viewHeight / this.#container.offsetHeight;

    const onMouseMove = (e) => {
        const dx = startX - e.clientX;
        const dy = startY - e.clientY;

        this.#viewX += dx * scaleX;
        this.#viewY -= dy * scaleY;
        //this.#viewY += dy * scaleY;

        this.#svg.setAttribute("viewBox", `${this.#viewX} ${this.#viewY} ${this.#viewWidth} ${this.#viewHeight}`);

        startX = e.clientX;
        startY = e.clientY;
    };

    const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    };

    #handleResize = () => {
    this.#updateViewBoxVars();
    this.#svg.setAttribute("viewBox", `${this.#viewX} ${this.#viewY} ${this.#viewWidth} ${this.#viewHeight}`);
    };

    #updateViewBoxVars() {
    const viewBox = this.#svg.getAttribute("viewBox").split(" ").map(Number);
    [this.#viewX, this.#viewY, this.#viewWidth, this.#viewHeight] = viewBox;


    }

    // Getter for direct access to the SVG element
    get svg() {
        return this.#svg;
    }
}
