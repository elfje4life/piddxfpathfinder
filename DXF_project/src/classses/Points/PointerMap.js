class PointerMap extends Map {
  //All indexes code and key is both a index
  #indexes = new Set();

  set(key, code) {
    if (!this.#indexes.has(key)) {
      this.#indexes.add(key);
    }
    if (!this.#indexes.has(code)) {
      this.#indexes.add(code);
    }
    if (!this.has(code)) {
      super.set(code, new Map());
    }
    if (!this.has(key)) {
      super.set(key, new Map());
    }
    super.get(key).set(code, super.get(code));
  }

  getConnectedSets() {
    const connectedComponents = []; // Hierin verzamelen we alle sets
    const visited = new Set(); // Houdt bij welke knooppunten al bezocht zijn

    // Loop over alle knooppunten die we kennen
    for (const node of this.#indexes) {
      // Als dit knooppunt nog niet is bezocht, start dan een nieuwe zoektocht (BFS)
      // om de hele component te vinden waartoe het behoort.
      if (!visited.has(node)) {
        const currentComponent = new Set(); // Deze set zal de huidige component bevatten
        const queue = [node]; // Begin de BFS met dit knooppunt in de wachtrij

        visited.add(node); // Markeer het startknooppunt als bezocht
        currentComponent.add(node); // Voeg het startknooppunt toe aan de huidige component

        // Voer de BFS uit zolang er knooppunten in de wachtrij zitten
        while (queue.length > 0) {
          const current = queue.shift(); // Haal het volgende knooppunt uit de wachtrij

          // Haal de directe buren op van het huidige knooppunt
          // 'super.get(current)' geeft de Map terug die de buren van 'current' bevat
          const neighborsMap = super.get(current);

          if (neighborsMap) {
            // Controleer of dit knooppunt überhaupt buren heeft
            // Loop door alle buren van 'current'
            for (const neighbor of neighborsMap.keys()) {
              // Als de buur nog niet bezocht is
              if (!visited.has(neighbor)) {
                visited.add(neighbor); // Markeer de buur als bezocht
                currentComponent.add(neighbor); // Voeg de buur toe aan de huidige component
                queue.push(neighbor); // Voeg de buur toe aan de wachtrij voor verdere exploratie
              }
            }
          }
        }
        // Nadat de BFS is voltooid, hebben we alle knooppunten in één component gevonden
        connectedComponents.push(currentComponent);
      }
    }
    return connectedComponents;
  }
}
