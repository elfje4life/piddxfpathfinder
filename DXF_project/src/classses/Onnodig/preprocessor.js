class preproccesing extends EntityFunctions {

    file; // for debuging
    RoadGroups = new ElementMap();
    Citys = [];
    Blocks = {};

    position;
    constructor(parsed_file) {
        super();
        this.file = { ...parsed_file };
        Object.freeze(this.file);
        const { ENTITIES, BLOCKS } = this.file;
        for (const [key, values] of Object.entries(BLOCKS)) {
            let a = new ElementMap();
            this.function_handler(values, this.EntityFunctions, a);
            this.Blocks[key] = a;
        }
        //this.function_handler(BLOCKS, this.EntityFunctions, this.Citys);
        let  {INSERT, ...rest} = this.EntityFunctions;
        this.function_handler(ENTITIES, rest, this.RoadGroups);
/*
        for (const [key, values] of Object.entries(ENTITIES.INSERT)) {
            let a = this.Blocks[values.AcDbBlockReference[2]];
            this.function_handler(values, this.EntityFunctions, a);

            this.Citys.push( a);
            let index = this.RoadGroups.addElement(a);
            //this.RoadGroups.AddCity(a,index)
        }
          //  this.function_handler(ENTITIES, INSERT, this.Citys);

for (const [key, values] of Object.entries(ENTITIES.INSERT)) {
    let a = this.Blocks[values.AcDbBlockReference[2]];
    this.function_handler(values, this.EntityFunctions, a);
    console.log(values);
    let index = this.RoadGroups.addElement(a);
    console.log(a);
    this.RoadGroups.AddCity(a, index);
    //this.Citys.push(a);
}
*/

for (const [key, values] of Object.entries(ENTITIES.INSERT)) {
    if (values.AcDbBlockReference[2] == "DINA0") { continue}
    let a = this.Blocks[values.AcDbBlockReference[2]];
    this.function_handler(ENTITIES, INSERT, a);
    let index = this.RoadGroups.addElement(a);
    //console.log(a);
    this.RoadGroups.AddCity(a, index);
}

this.RoadGroups.createLinks();


    }

}
