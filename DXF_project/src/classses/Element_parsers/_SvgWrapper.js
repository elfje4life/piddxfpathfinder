

/**
 * @typedef {Object} SvgWrapperOptions
 * @property {string} type - SVG element type zoals 'rect', 'circle', etc.
 * @property {string} [svgNS] - Namespace URI, default is 'http://www.w3.org/2000/svg'.
 */

/**
 * @class SvgWrapper
 */
class SvgWrapper extends svgCombiner{
    /**
     * @var attributes
     * All attributes that are set in this element
     */
    attributes = new Map();
    /**
     * @var data
     * All attributes that are set in this element
     */
    data = new Map();

    /**
     * @param {type: string, svgNS?: string} options - Instellingen voor het SVG-element.
     */
    constructor(type, color, svgNS = 'http://www.w3.org/2000/svg') {
         super();
         this.color = color ?? 1;
         this.element = document.createElementNS(svgNS, type);
         this.set = this.CreateObject(type);


    }

    //common
    static commonGraphics = new Set([ "stroke-width", "stroke-linecap", "stroke-linejoin"]);
    static commonText = new Set(["fill", "stroke", "transform", "stroke-dasharray"]);
    static commonShape = new Set([ "stroke-width"]);



    static SvgAttributeMap = {
        line: this.combine(new Set(["x1", "y1", "x2", "y2"]), this.commonGraphics, this.commonText),
        rect: this.combine(new Set(["x", "y", "width", "height", "rx", "ry"]), this.commonShape, this.commonText),
        circle: this.combine(new Set(["cx", "cy", "r"]), this.commonShape, this.commonText),
        ellipse: this.combine(new Set(["cx", "cy", "rx", "ry"]), this.commonShape, this.commonText),
        path: this.combine(new Set(["d"]), this.commonGraphics, this.commonText),
        polyline: this.combine(new Set(["points"]), this.commonShape, this.commonText),
        polygon: this.combine(new Set(["points"]), this.commonShape, this.commonText),
        text: this.combine(new Set(["x", "y", "dx", "dy", "text-anchor", "font-size", "font-family", "dominant-baseline"]), this.commonText, this.commonText),
        g: this.combine(new Set([]), this.commonShape, this.commonText),
        svg: new Set(["width", "height", "viewBox", "xmlns", "style"]),
        use: this.combine(new Set(["x", "y", "href", "width", "height", "transform"]), this.commonGraphics, this.commonText),
        symbol: new Set(["x", "y", "width", "height", "viewBox", "id", "refX","refY"])
    };

    /** @function isValidSvgAttribute
     *  @description Checks if a attribute is a valid key to a svg element
     *  @argument a key
     *  @returns true or false
     */
     isValidSvgAttribute(key) {
        const tag = this.element.tagName.toLowerCase();
        const valid = this.constructor.SvgAttributeMap[tag];
        return valid ? valid.has(key) : false;
    }
    fromKebab(str) {
        return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    }
    toKebab(key) {
        return key.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
    }





    /**
     * Sets attributes and metadata on the SVG element.
     *
     * This is the core method of the class. It checks whether each key is a valid SVG attribute
     * for the current element type and applies it using `setAttribute(key, value)`.
     *
     * Keys written in camelCase (e.g. `strokeWidth`) are automatically converted to kebab-case (`stroke-width`)
     * to match SVG standards.
     *
     * Non-standard or unknown keys are stored as `data-*` attributes for debugging and metadata tracking.
     * You can also pass nested `data` or `attrs` objects to explicitly set dataset values or raw attributes.
     *
     * @param {Record<string, any>} values - An object containing all keys and values to apply to the SVG element.
     */
    set set(values) {
        for (const [key, val] of Object.entries(values)) {
            if(!val){continue;};
            if(this.isValidSvgAttribute(key)){
               // console.log(key)
                if((key === "stroke" || key === "fill") && this.color === 0){
                    //this.element.setAttribute("stroke", "none");
                  //  this.attributes.set(key, val);
                }else{
                    this.element.setAttribute(key, val);
                    this.attributes.set(key, val);
                }
            } else{
            const kebabKey = this.toKebab(key);

            if (this.isValidSvgAttribute(kebabKey)) {
                this.element.setAttribute(kebabKey, val);
                this.attributes.set(kebabKey, val);
            } else if (kebabKey === "data" && typeof val === "object") {
                for (const [k, v] of Object.entries(val)) {
                    this.element.dataset[k] = v;
                    this.data.set(k, v);
                }
            } else if (kebabKey === "attrs" && typeof val === "object") {
                for (const [k, v] of Object.entries(val)) {

                    this.element.setAttribute(k, v);
                    this.attributes.set(k, v);
                }
            } else {
                this.element.dataset[kebabKey] = val;
                this.data.set(kebabKey, val);
            }

            }
        }
        return this;
    }

    /** @function show
     *  @returns the easy layout of this svg element
     */
    get show() {
        return {
            tag: this.element.tagName,
            attributes: Object.fromEntries(this.shortsvg.attributes),
            data: Object.fromEntries(this.shortsvg.data)
        };
    }

    /**
     * @function CreateObject
     * @description Set all default parameters from the registry if not already defined.
     * @param {string} e - Element type key
     * @returns {Object} - Object with default parameters
     */
    CreateObject(e) {
        const defaultObject = {};

        const attributeList = SvgWrapper.SvgAttributeMap[e];
        if (!attributeList) return defaultObject;

        attributeList.forEach((parameter) => {
            const kebabKey = this.fromKebab(parameter);
            const value = Registry.getDefaultValue(kebabKey);
            if (value !== undefined) {
                defaultObject[kebabKey] = value;
            }
        });

        return defaultObject;
    }

}
