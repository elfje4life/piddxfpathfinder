class svgCombiner{
     points = new Set();


    append(child){
        this.element.appendChild(child);
    };
    /** @function combine
     *  @description this function combines multible sets to one big set
     *  @argument Multible sets
     *  @returns One set
     */
    static combine(...sets) {
        return new Set(sets.flatMap(set => [...set]));
    }


    /**
     * @function appendAllElements
     * @description Voegt alle SVG-elementen uit this.elements toe aan this.element.
     */
    appendAllElements(object) {
        const {elements } = object ;


        if(elements.size !== 0){
            //console.log(elements)
            for (const [key,value] of elements.entries()) {

                if(!value.element){continue}
                this.append(value.element);
                this.points = svgCombiner.combine(this.points, value.points)
            }
        };

    }

}
