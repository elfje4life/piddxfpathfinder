class DxfParser {
  /**
   * @param {*} text -The full file in ascii
   */
  async read(text) {
    this.arr = text.split("\r\n").slice(0, -1);
    await this.next();
    if (this.key !== 0 && this.value !== "EOF") {
      console.log("error");
    }

    return Promise.resolve(await this.parse());
    //return Promise.new(await this.parse());

    //console.log(result);
    //return await this.parse();;
  }

  /**
   * @param {*} key {2}
   * @param {*} value {2}
   */
  async parse(key = undefined, value = undefined) {
    let output = {};

    let read = {};
    let readread = {};
    //volgende waarde meteen
    await this.next();

    while (this.arr.length >= 1) {
      //console.log(this.key+this.value);

      //als het einde is behaald stop deze functie
      if (key === this.key && value == this.value) {
        Object.assign(read, readread);
        Object.assign(output, read);
        return output;
      }

      switch (this.key) {
        case 0:
          switch (this.value) {
            case "ENDSEC":
              //start parse
              await this.handleVar(
                output,
                undefined,
                await this.parse(0, "SECTION"),
              );
              break;
            case "ENDTAB":
              await this.handleVar(
                output,
                undefined,
                await this.parse(0, "TABLE"),
              );
              break;
            case "ENDBLK":
              //await this.handleVar(output, undefined, await this.parse(0, 'BLOCK'));
              break;
            case "SEQEND":
              await this.handleVar(
                output,
                undefined,
                await this.parse(0, "INSERT"),
              );
              break;
            case "BLOCK_RECORD":
              Object.assign(read, readread);

              await this.handleVar(output, read[5], read);
              //  delete output[read['  5']]['  5'];
              readread = {};
              read = {};
              break;
            case "CLASS":
              Object.assign(read, readread);
              await this.handleVar(output, read[2], read);
              //delete output[read[2]][2];
              read = {};
              readread = {};
              break;
            case "INSERT":
              if (read[66] == 1) {
                //early return
                Object.assign(read, readread);
                Object.assign(output, read);
                return output;
              } // doe hetzelfde als default als niet behaald
              Object.assign(read, readread);
              await this.handleVar(output, this.value, read);
              read = {};
              readread = {};
              break;
            default:
              Object.assign(read, readread);
              await this.handleVar(output, this.value, read);
              readread = {};
              read = {};
          }
          break;
        case 9:
          await this.handleVar(output, this.value, read);
          read = {};
          break;
        case 100:
          //read to output
          switch (this.value) {
            case "AcDbBlockEnd":
              await this.handleVar(
                output,
                undefined,
                await this.parse(0, "BLOCK"),
              );
              break;
            default:
              await this.handleVar(readread, this.value, read);
              read = {};
          }

          break;
        case 102:
          if (this.value !== "}") {
            Object.assign(read, readread);
            Object.assign(output, read);
            return output;
          } else {
            await this.handleVar(
              readread,
              undefined,
              await this.parse(102, "{}"),
            );
          }
          break;
        case 1002:
          if (this.value !== "}") {
            Object.assign(read, readread);
            Object.assign(output, read);
            return output;
          } else {
            await this.handleVar(
              readread,
              undefined,
              await this.parse(1002, "{}"),
            );
          }

          break;

        default:
          //waarde toevoegen aan de array;
          await this.handleVar(read, this.key, this.value);
      }
      //volgende waarde meteen
      await this.next();
    }
    Object.assign(read, readread);
    Object.assign(output, read);
    this.this = output;
    return output; //De array is leeg
  }

  async next() {
    this.value = this.arr.pop();
    this.key = parseInt(this.arr.pop());
    const code = this.key;
    const numbered =
      (code >= 10 && code <= 99) ||
      (code >= 110 && code <= 289) ||
      (code >= 370 && code <= 389) ||
      (code >= 400 && code <= 409) ||
      (code >= 420 && code <= 429) ||
      (code >= 1010 && code <= 1071);
    if (numbered) {
      this.value = parseFloat(this.value);
    }
  }
  /**
   *@param {*} output {2}
   *@param {*} to {2}
   * @param {*} value {2}
   */
  async handleVar(output, to, value) {
    if (typeof to !== "undefined") {
      if (typeof output === "undefined") {
        output = {};
      }
      if (typeof output[to] !== "undefined") {
        if (!Array.isArray(output[to])) {
          if (to == "AcDbText") {
            Object.assign(output[to], value);
          } else {
            output[to] = [value, output[to]];
          }
        } else {
          if (to == 42) {
            if (Array.isArray(output[10])) {
              output[42][output[10].length] = value;
            } else {
              output[42] = [value];
            }
          } else {
            output[to].unshift(value);
          }
        }
      } else {
        if (to == 42) {
          if (Array.isArray(output[10])) {
            if (!Array.isArray(output[42])) {
              output[42] = [, output[to]];
            }
            output[42][output[10].length + 1] = value;
          } else {
            output[42] = [, value];
          }
        } else {
          output[to] = value;
        }
      }
    } else {
      if (value[2]) {
        await this.handleVar(output, value[2], value);
        //delete output[value[2]][2];
      } else {
        if (this.value == "BLOCK") {
          await this.handleVar(output, value.AcDbBlockBegin[2], value);
          // delete output[value['  5']]['  5'];
        } else {
          await this.handleVar(output, this.value, value);
        }
      }
    }
  }
  /**
   * @param {*} text {2}
   */
  static async parseText(text) {
    const parser = new DxfParser(); // Create an instance of the parser
    return await parser.read(text); // Call the `read` method on the instance and return its result
  }
}
