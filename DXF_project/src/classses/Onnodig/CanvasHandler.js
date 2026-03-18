class CanvasHandler {
  /**
   * Initializes the CanvasHandler.
   * @param {string} canvasId The ID of the canvas element.
   * @param {string} drawing the full drawing class of this canvas
   */
  constructor(canvasId) {
    /**
     * @type {HTMLCanvasElement} canvas
     */
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error(`Canvas with ID '${canvasId}' not found.`);
      return;
    }
    this.ctx = this.canvas.getContext("2d");

    // Viewport state
    this.translateX = 0; // X offset for image translation
    this.translateY = 0; // Y offset for image translation
    this.scale = 1; // Current zoom level

    // Interaction state
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    // Debounce for draw calls
    this.drawRequested = false;
    this.animationFrameId = null;

    // Event listeners
    this.addEventListeners();

    // Initial setup for canvas size (important for drawing)
    this.resizeCanvasToFitWindow();
    window.addEventListener("resize", () => {
      this.resizeCanvasToFitWindow();
      this.draw(); // Redraw on resize
    });

    //init draw
    this.requestDraw();
  }

  /**
   * Resizes the canvas element to fill the window.
   * You might want to adjust this based on your specific layout.
   */
  resizeCanvasToFitWindow() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    // Adjust translation to keep image somewhat centered or reset if needed
    // For simplicity, we just redraw. If you want to keep center, you need
    // to calculate the new center based on old center before resize.
  }

  /**
   * Resets the view to display the full image, centered and scaled to fit.
   */
  resetView() {
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    const imageWidth = this.image.width;
    const imageHeight = this.image.height;

    // Calculate scale to fit image within canvas
    this.scale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);
    if (this.scale > 1) {
      // Prevent upscaling small images to fill
      this.scale = 1;
    }

    // Calculate translation to center the image
    this.translateX = (canvasWidth - imageWidth * this.scale) / 2;
    this.translateY = (canvasHeight - imageHeight * this.scale) / 2;

    this.draw();
  }

  /**
   * Adds all necessary event listeners for interaction.
   */
  addEventListeners() {
    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.canvas.addEventListener("mouseleave", this.onMouseUp.bind(this)); // Stop dragging if mouse leaves canvas
    this.canvas.addEventListener("wheel", this.onWheel.bind(this), {
      passive: false,
    }); // Use passive: false to prevent default scroll
  }

  /**
   * Handles the mousedown event to start dragging.
   * @param {MouseEvent} event
   */
  onMouseDown(event) {
    this.isDragging = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
    this.canvas.style.cursor = "grabbing";
  }

  /**
   * Handles the mousemove event to update translation while dragging.
   * @param {MouseEvent} event
   */
  onMouseMove(event) {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.lastMouseX;
    const deltaY = event.clientY - this.lastMouseY;

    this.translateX += deltaX;
    this.translateY += deltaY;

    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;

    this.requestDraw();
  }

  /**
   * Handles the mouseup event to stop dragging.
   */
  onMouseUp() {
    this.isDragging = false;
    this.canvas.style.cursor = "grab";
  }

  /**
   * Handles the wheel event for zooming.
   * @param {WheelEvent} event
   */
  onWheel(event) {
    event.preventDefault(); // Prevent page scroll

    const scaleAmount = 1.1; // How much to zoom in/out
    const mouseX = event.clientX - this.canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - this.canvas.getBoundingClientRect().top;

    // Calculate actual coordinates under mouse before zoom
    const worldX = (mouseX - this.translateX) / this.scale;
    const worldY = (mouseY - this.translateY) / this.scale;

    let newScale;
    if (event.deltaY < 0) {
      // Scroll up = zoom in
      newScale = this.scale * scaleAmount;
    } else {
      // Scroll down = zoom out
      newScale = this.scale / scaleAmount;
    }

    // Optional: Clamp zoom levels
    newScale = Math.max(0.1, Math.min(newScale, 10)); // Min 10%, Max 1000% zoom

    // Calculate new translation to keep the point under mouse fixed
    this.translateX = mouseX - worldX * newScale;
    this.translateY = mouseY - worldY * newScale;
    this.scale = newScale;

    this.requestDraw();
  }

  /**
   * Requests a draw operation using requestAnimationFrame for efficiency.
   * This prevents multiple redundant draw calls in quick succession.
   */
  requestDraw() {
    if (!this.drawRequested) {
      this.drawRequested = true;
      this.animationFrameId = requestAnimationFrame(() => {
        this.draw();
        this.drawRequested = false;
        this.animationFrameId = null;
      });
    }
  }

  /**
   * Clears the canvas and draws the image based on current transform.
   * This is the core drawing logic.
   */
  draw() {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear entire canvas

    this.ctx.save(); // Save the current state of the canvas context

    // Apply transformations
    this.ctx.translate(this.translateX, this.translateY);
    this.ctx.scale(this.scale, this.scale);

    // Draw the image at its original position (0,0) as transformations are applied by translate/scale
    //this.ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);
    // --- 1. Draw the Image ---
    // The image is drawn at its original position (0,0) in the transformed coordinate space.
    // Its size is also based on its original dimensions, and the 'scale' handles the zoom.
    //this.ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);

    // --- 2. Draw Lines (or other shapes) in "World Coordinates" ---
    // Now, draw your lines. The coordinates you provide here should be relative
    // to the image's original coordinate system (i.e., if the image pixel (100,50)
    // is part of a line, you use (100,50) here).
    this.ctx.beginPath();
    this.ctx.strokeStyle = "blue"; // Example line color
    this.ctx.lineWidth = 2 / this.scale; // Adjust line width to appear consistent regardless of zoom
    // Divide by scale to make it thicker when zoomed out, thinner when zoomed in
    // This makes it appear a fixed width on screen.

    // Example line 1: From (50,50) to (200,100) on the original image
    this.ctx.moveTo(50, 50);
    this.ctx.lineTo(200, 100);

    // Example line 2: From (300,200) to (400,50) on the original image
    this.ctx.moveTo(300, 200);
    this.ctx.lineTo(400, 50);

    this.ctx.stroke(); // Render the lines

    // You can add more complex drawing logic here.
    // For example, if you have an array of points for a polyline:
    /*
     *        this.ctx.beginPath();
     *        this.ctx.strokeStyle = 'red';
     *        this.ctx.lineWidth = 3 / this.scale;
     *        const polylinePoints = [
     *            { x: 10, y: 10 },
     *            { x: 150, y: 20 },
     *            { x: 160, y: 180 },
     *            { x: 20, y: 170 }
     *        ];
     *        if (polylinePoints.length > 0) {
     *            this.ctx.moveTo(polylinePoints[0].x, polylinePoints[0].y);
     *            for (let i = 1; i < polylinePoints.length; i++) {
     *                this.ctx.lineTo(polylinePoints[i].x, polylinePoints[i].y);
  }
  }
  this.ctx.stroke();
  */

    this.ctx.restore(); // Restore the canvas context to its state before transformations
  }
}

