First a menu will be loaded, with some hinting
    TODO explain hinting after the project is done

Second a button is linked to the Menu/menu.js -> fileInput(e) function
    This function will be receiving a dxf file and for each dxf file start
    the parsing for the text.
    The static class DxfParser parseText will be returning a object with
    the dxf parsed as DxfParser.

Map:
Menu/menu.js -> fileInput(e)
                    (loop files) -> /Reader.js -> static class DxfParser.parseText(e)

DxfParser.parseText(e) -> sets a const as DxfParser,
                       -> returns and calls the .read Function.apply

    .read -> sets and split a variable on each line
    -> calls .next() that sets the key and value variable
    -> checks if the file ends with EOF else error
    -> calls .parse()
    ends

    recursive function
    .parse() -> sets 3 new objects
                    -> output, read and readread;
             -> .next() reads next values
             -> starts loop() until the array is empty, like a generator.
                -> check if the key and value from arguments sended are the same
                   this function is recursive and also stops on the given end arguments
                   on this point will the the 3 new objects be send back in
                   this way return {...output, read:...readread}
             ->key & value filter
                -> 0 & ENDSEC -> parse( 0, SECTION)
                -> 0 & ENDTAB -> parse( 0, TABLE)
                -> 0 & ENDBLK -> nothing
                -> 0 & SEQEND -> parse( 0, INSERT)
                -> 0 & BLOCK_RECORD -> merge objects and clear read and readread
                -> 0 & CLASS -> merge objects and clear read and readread
                -> 0 & INSERT AND 66 = 1 merge and return
                              ELSE -> merge objects and clear read and readread
                -> 0 -> merge objects and clear read and readread
                -> 9 -> merge objects and clear read
                -> 100 & AcDbBlockEnd -> parse( 0, BLOCK) inside output
                -> 100 -> merge objects inside readread and clear read
                -> 102 & } -> merge and return
                -> 102 -> parse( 102, {}) inside readread
                -> 1002 & } -> merge and return
                -> 1002 -> parse( 102, {}) inside readread
                -> merge inside read

    *when the next function is called
    there will be a check on diferent key values to make it floating point values
    *when merging handlevar function will be called this function will check
    some keys and values to create all values some keys will be arrays and some
    will be text values etc.

/Menu.js -> creates a class SVGHandler
    ->A SVG container will be added to a dom element like a div, added scrolling
    and moving on mouse, and a function to add a svg to this div.
    -> makes a class of the parsed text dxf file with /Element.js -> Element class
            -> this will draw the svg and give it the svg variable more
                off that after the next sentence
    -> then inject the svg to this container

/Element.js -> Element class is again a recursive class some sort,
             there is a object in the DXF called blocks those need to parsed to
             symbol, the problem is that those blocks can again contain use that
             use other symbols
             and for the vieuwbox must be set inside the symbols else it wont
             show any symbols. also a dxf can be shipped with all blocks not
             just the blocks needed.
             the parsed dxf contains elements/inserts those are the use elements
             that uses the symbols, so if there is a block/symbol not set already
             that will be drawn first. after the working principle this will be
             set inside the registery with a drawn time so the latest symbols/
             blocks will be used inside older images.

             this constructor calls upon extended classses to set all and add
             all the needed functions, so will the foodprint smaller.
             if the color isnt set or given the color will be ignored bc if
             a symbol is added with color it will show (hate it).

             so first if the parsed object has a HEADER section set a viewbox for
             itself, then save the object and caller for debugging purpuses.a

             -> draw()
                draw will loop trough the object and if a key is defined in the
                static class registry make the values as a array
                loop trough the array and try to create a new class if defined.
                then check if it needed to be drawed, and so yes add it to the
                elements variable to this key and the class.
                if the class isnt defined inside teh registry  and its a object
                and not a array, call the same function again.

/Element_parsers/*.js has all the classses that draw specific element of the
                    parsed dxf and a line to add the class to the registry


/_register.js the registy static class all predefined values of a svg and all the
                classes on specific calls are defined in here

so recap and explaining all the extended classes:
Element.js extends on svgCombiner from __mainSVGFunctions.js this will just be
            a set of function needed to merge all the elements after the
            constructor is done, like all the points found in a set of elements.
            thats needed for the viewbox and pathfinder later on.



/Element_parsers/_entity.js a extended class of all the elements, here will
                   be some functions like addpoint add line set extremes
                   so the biggest and smallest points in a set and return a
                   viewbox. this function will be extended on the SvgWrapper.

/Element_parsers/_SvgWrapper.js is the extended class that is the most magic
                    functions of all it extends on the svgcombiner.
                    here a svg element will be created.
                    when this script was loaded all the possible possible
                    attributes are put inside a object full of sets.
                    then from a trigger of the registry so like BLOCKS will
                    trigger blocks.js that triggers after setting all the
                    parameters in its contructor add points and paths and trigger
                    this.set = {}
                    -> set()
                     Sets attributes and metadata on the SVG element.
                     This is the core method of the class. It checks whether each key is a valid SVG attribute
                     for the current element type and applies it using `setAttribute(key, value)`.

                     Keys written in camelCase (e.g. `strokeWidth`) are automatically converted to kebab-case (`stroke-width`)
                     to match SVG standards.

                    Non-standard or unknown keys are stored as `data-*` attributes for debugging and metadata tracking.
                     You can also pass nested `data` or `attrs` objects to explicitly set dataset values or raw attributes.

                    the entity class also calls the set function that sets the
                    layer name and for debugging all the used values


