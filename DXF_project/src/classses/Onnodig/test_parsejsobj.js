const myData = {
    id: 'abc-123',
    name: 'Main Item',
    properties: [
        { key: 'size', value: 'large', unit: 'cm' },
        { key: 'color', value: 'blue' }
    ],
    details: {
        manufacturer: 'XYZ Corp',
        weight: '10kg'
    },
    specialItems: [ // These need different handling
        { type: 'dimension', data: { length: 10, width: 5, unit: 'm' } },
        { type: 'material', data: { name: 'wood', density: '0.7g/cm³' } },
        { type: 'dimension', data: { height: 20, unit: 'cm' } }
    ],
    otherStuff: 'some value'
};

// 1. Define the Dispatch Map
const specialItemParsers = {
    dimension: (dimensionData) => {
        const { length, width, height, unit } = dimensionData;
        let dimensionString = '';
        if (length) dimensionString += `${length}`;
        if (width) dimensionString += `x${width}`;
        if (height) dimensionString += `x${height}`;
        return {
            type: 'dimension',
            value: `${dimensionString}${unit ? ' ' + unit : ''}`
        };
    },
    material: (materialData) => {
        const { name, density } = materialData;
        return {
            type: 'material',
            materialName: name,
            materialDensity: density
        };
    },
    // Add more types here as needed
};

// 2. The Central Dispatcher Function
function parseSpecialItemWithMap(item) {
    // Dynamically get the correct parser function from the map
    const parser = specialItemParsers[item.type];

    // Check if a parser for this type exists
    if (parser) {
        // If it exists, call it with the 'data' property of the item
        return parser(item.data);
    }

    // Fallback for unknown types
    return { type: 'unknown', originalData: item };
}

// 3. The Main Object Parsing Function
function parseMyObjectWithMap(obj) {
    const parsedData = {
        id: obj.id,
        name: obj.name,
        otherStuff: obj.otherStuff,
    };

    // Handle 'properties' array (each element is an object)
    if (obj.properties && Array.isArray(obj.properties)) {
        parsedData.processedProperties = obj.properties.map(prop => ({
            [prop.key]: `${prop.value}${prop.unit ? ' ' + prop.unit : ''}`
        }));
    }

    // Handle 'details' object
    if (obj.details) {
        parsedData.parsedDetails = {
            manufacturer: obj.details.manufacturer,
            itemWeight: obj.details.weight
        };
    }

    // This is where the magic happens for 'specialItems'
    if (obj.specialItems && Array.isArray(obj.specialItems)) {
        parsedData.processedSpecialItems = obj.specialItems.map(parseSpecialItemWithMap);
    }

    return parsedData;
}

// 4. Execution
//const resultMap = parseMyObjectWithMap(myData);
//console.log(JSON.stringify(resultMap, null, 2));
