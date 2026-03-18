//this funcion extract all the elements
class elementtest {
  functions = new Set();
  elements = new Set();
  constructor({ ENTITIES }) {
    this.read(ENTITIES);
    console.log(this.functions);
    console.log(this.elements);
  }
  read(ob) {
    //console.log(ob);
    if (Array.isArray(ob)) {
      ob.forEach((ele) => {
        if (typeof ele == "object" || Array.isArray(ele)) {
          this.read(ele);
        }
      });
      return;
    }
    if (typeof ob == "object" && !Array.isArray(ob)) {
      let isEnt = false;
      if (ob?.AcDbEntity) {
        isEnt = true;
        this.elements.add(ob);
      }
      for (const key of Object.keys(ob)) {
        if (isEnt && key.startsWith("AcDb")) {
          this.functions.add(key);
        }
        if (typeof ob[key] == "object" || Array.isArray(ob[key])) {
          this.read(ob[key]);
        }
      }
    }
    //console.log(this.functions);
  }
}

class elementtest2 {
  functions = new Set();
  elements = new decrypt();
  constructor({ ENTITIES }) {
    this.read(ENTITIES);
    console.log(this.functions);
    console.log(this.elements);
  }
  read(ob) {
    //console.log(ob);
    if (Array.isArray(ob)) {
      ob.forEach((ele) => {
        if (typeof ele == "object" || Array.isArray(ele)) {
          this.read(ele);
        }
      });
      return;
    }
    if (typeof ob == "object" && !Array.isArray(ob)) {
      let isEnt = false;
      if (ob?.AcDbEntity) {
        isEnt = true;
        this.elements.push(ob);
      }
      for (const key of Object.keys(ob)) {
        if (isEnt && key.startsWith("AcDb")) {
          this.functions.add(key);
        }
        if (typeof ob[key] == "object" || Array.isArray(ob[key])) {
          this.read(ob[key]);
        }
      }
    }
    //console.log(this.functions);
  }
}
class decrypt extends Array {
  push(a) {
    let output = {};
    if (typeof a == "object" && !Array.isArray(a)) {
      if (a.AcDbEntity) {
        const{ [8]: layer_name } = a.AcDbEntity;
        Object.assign(output,a.AcDbEntity)
      }
      if (a.AcDbMline) {
        const {
          [11]: [...x],
          [21]: [...y],
          [12]: [...directionX],
          [22]: [...directionY],
          [10]: startXOffset,
          [20]: startYOffset,
        } = a.AcDbMline;
        Object.assign(output,{
          x,
          y,
          directionX,
          directionY,
          startXOffset,
          startYOffset,
        });
      }
    }
    super.push(output);
  }
}
