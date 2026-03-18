/** @class Registry
 *  @description the static class register
 */
class Registry {
    static Class = new Map();
    static DefaultValues = new Map();
    static Symbols = new Map();

    static registerClass(key, value) {
        this.Class.set(key.toUpperCase(), value);
    }

    static registerDefaultValue(key, value) {
        this.DefaultValues.set(key.toUpperCase(), value);
    }

    static getClass(key) {
        return this.Class.get(key.toUpperCase());
    }

    static getDefaultValue(key) {
        return this.DefaultValues.get(key.toUpperCase());
    }

    static hasClass(key) {
        return this.Class.has(key.toUpperCase());
    }


    static newClass(key, raw, parent, color) {
        const value = this.getClass(key);
        return value ? new value(raw, parent,color) : null;
    }

}
Registry.registerDefaultValue("style", "color: red;")
Registry.registerDefaultValue("stroke","currentColor");
Registry.registerDefaultValue("strokeWidth",0.1);
Registry.registerDefaultValue("fill", 'none')
Registry.registerDefaultValue("strokeLinecap", 'round')
Registry.registerDefaultValue('xmlns','http://www.w3.org/2000/svg')
