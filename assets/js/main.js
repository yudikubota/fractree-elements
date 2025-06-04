/**
 * ═══════════════════════════════════════════════════════════════
 * FRACTREE LOGO GENERATOR - MAIN APPLICATION
 * Core application logic and component orchestration
 * ═══════════════════════════════════════════════════════════════
 */

class FractreeApp {
    constructor() {
        // Shorthand selector for convenience
        this.$ = (id) => document.getElementById(id);

        // Application configuration
        this.config = {
            VIEW_SIZE: 400,
            CENTER_X: 200,
            CENTER_Y: 200,
            TAU: Math.PI * 2
        };

        // Parameter definitions for the fractal generator
        this.paramList = [
            { id: "r", min: 40, max: 100 },           // Inner radius
            { id: "d", min: 10, max: 60 },            // Offset delta
            { id: "numLines", min: 4, max: 120 },     // Number of spokes
            { id: "minThick", min: 1, max: 20 },      // Minimum thickness
            { id: "maxThick", min: 1, max: 40 },      // Maximum thickness
            { id: "peakAngle", min: 0, max: 360 },    // Peak angle
            { id: "frontRot", min: 0, max: 360 },     // Front rotation offset
            { id: "backRot", min: 0, max: 360 },      // Back rotation offset
            { id: "maskRot", min: 0, max: 360 },       // Mask rotation
            { id: "h", min: 50, max: 250 }            // Auxiliary offset h
        ];

        // Initialize control references
        this.controls = {};

        // Initialize engines and managers
        this.geometryEngine = new GeometryEngine();
        this.mobileMenuManager = new MobileMenuManager();
        this.animationEngine = null; // Will be initialized after controls setup

        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.setupControls();
        this.initializeSVGElements();
        this.setupEventListeners();
        this.initializeAnimationEngine();
        this.render(); // Initial render

        console.log("Fractree Logo Generator initialized successfully");
    }

    /**
     * Setup control references for all parameters
     */
    setupControls() {
        // Map parameter controls (sliders and velocity inputs)
        this.paramList.forEach(param => {
            this.controls[param.id] = this.$(param.id);
            this.controls[param.id + "Vel"] = this.$(param.id + "Vel");
        });

        // Add color and invert controls
        this.controls.colFront = this.$("colFront");
        this.controls.colBack = this.$("colBack");
        this.controls.invert = this.$("invert");

        // Recording controls
        this.controls.recordBtnMerged = this.$("recordBtnMerged");
        this.controls.stopRecBtnMerged = this.$("stopRecBtnMerged");
        this.controls.recordBtnAux = this.$("recordBtnAux");
        this.controls.stopRecBtnAux = this.$("stopRecBtnAux");

        // Hidden canvases for recording
        this.controls.captureMerged = this.$("captureMerged");
        this.controls.captureAux = this.$("captureAux");
    }

    /**
     * Initialize SVG elements with proper viewBoxes
     */
    initializeSVGElements() {
        const svgElements = ["svgFront", "svgBack", "svgMerged", "svgAuxiliaryMasked"];
        this.geometryEngine.initializeSVGViewBoxes(svgElements);
    }

    /**
     * Setup event listeners for all controls
     */
    setupEventListeners() {
        // Parameter slider changes
        this.paramList.forEach(param => {
            this.controls[param.id].addEventListener("input", () => this.render());

            // Velocity inputs don't need to trigger immediate re-render
            this.controls[param.id + "Vel"].addEventListener("input", () => {
                // Could add validation or UI feedback here
            });
        });

        // Color and invert control changes
        this.controls.colFront.addEventListener("input", () => this.render());
        this.controls.colBack.addEventListener("input", () => this.render());
        this.controls.invert.addEventListener("input", () => this.render());

        // Recording button event listeners
        if (this.controls.recordBtnMerged) {
            this.controls.recordBtnMerged.addEventListener("click", () => {
                if (this.animationEngine) {
                    this.animationEngine.startRecording(
                        this.controls.captureMerged,
                        this.controls.recordBtnMerged,
                        this.controls.stopRecBtnMerged,
                        "svgMerged"
                    );
                }
            });
        }
        if (this.controls.stopRecBtnMerged) {
            this.controls.stopRecBtnMerged.addEventListener("click", () => {
                if (this.animationEngine) {
                    this.animationEngine.stopRecording(); // Stop uses internal state
                }
            });
        }

        if (this.controls.recordBtnAux) {
            this.controls.recordBtnAux.addEventListener("click", () => {
                if (this.animationEngine) {
                    this.animationEngine.startRecording(
                        this.controls.captureAux,
                        this.controls.recordBtnAux,
                        this.controls.stopRecBtnAux,
                        "svgAuxiliaryMasked"
                    );
                }
            });
        }
        if (this.controls.stopRecBtnAux) {
            this.controls.stopRecBtnAux.addEventListener("click", () => {
                if (this.animationEngine) {
                    this.animationEngine.stopRecording(); // Stop uses internal state
                }
            });
        }
    }

    /**
     * Initialize the animation engine with render callback
     */
    initializeAnimationEngine() {
        this.animationEngine = new AnimationEngine(
            this.controls,
            this.paramList,
            () => this.render() // Callback for animation updates
        );
    }

    /**
     * Update label values to show current parameter settings
     */
    updateLabels() {
        this.paramList.forEach(param => {
            const labelElement = this.$(param.id + "Val");
            if (labelElement) {
                labelElement.textContent = Math.round(parseFloat(this.controls[param.id].value));
            }
        });
    }

    /**
     * Extract current parameter values for rendering
     * @returns {Object} Object containing all current parameter values
     */
    getParameterValues() {
        const values = {};

        // Numeric parameters
        values.r = parseFloat(this.controls.r.value);
        values.d = parseFloat(this.controls.d.value);
        values.rOuter = values.r + 2 * values.d;
        values.rInnerPlusD = values.r + values.d;

        values.count = parseInt(this.controls.numLines.value);
        values.tMin = parseFloat(this.controls.minThick.value);
        values.tMax = parseFloat(this.controls.maxThick.value);

        // Convert angles from degrees to radians
        values.peakAngle = (parseFloat(this.controls.peakAngle.value) * Math.PI) / 180;
        values.frontOffset = (parseFloat(this.controls.frontRot.value) * Math.PI) / 180;
        values.backOffset = (parseFloat(this.controls.backRot.value) * Math.PI) / 180;
        values.maskRotation = parseFloat(this.controls.maskRot.value);
        values.h = parseFloat(this.controls.h.value);

        // Colors and settings
        values.frontColor = this.controls.colFront.value;
        values.backColor = this.controls.colBack.value;
        values.inverted = this.controls.invert.checked;

        return values;
    }

    /**
     * Create common spoke configuration object
     * @param {Object} values - Parameter values
     * @returns {Object} Base configuration for spoke generation
     */
    createSpokeConfig(values) {
        return {
            count: values.count,
            rInner: values.r,
            rOuter: values.rOuter,
            tMin: values.tMin,
            tMax: values.tMax,
            invert: values.inverted
        };
    }

    /**
     * Render front layer spokes
     * @param {Object} values - Current parameter values
     */
    renderFrontLayer(values) {
        const config = {
            ...this.createSpokeConfig(values),
            peak: values.peakAngle,
            stroke: values.frontColor,
            offset: values.frontOffset
        };

        const frontSpokes = this.geometryEngine.buildSpokes(config);
        this.$("svgFront").replaceChildren(frontSpokes);
    }

    /**
     * Render back layer spokes
     * @param {Object} values - Current parameter values
     */
    renderBackLayer(values) {
        const config = {
            ...this.createSpokeConfig(values),
            peak: (values.peakAngle + Math.PI) % this.config.TAU,
            stroke: values.backColor,
            offset: values.backOffset
        };

        const backSpokes = this.geometryEngine.buildSpokes(config);
        this.$("svgBack").replaceChildren(backSpokes);
    }

    /**
     * Render the merged composite layer with masks
     * @param {Object} values - Current parameter values
     */
    renderMergedLayer(values) {
        const mergedSvg = this.$("svgMerged");

        // Create definitions section with masks
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

        // Create masks for front and back layers
        const maskA = this.geometryEngine.createMask(
            "maskA_merged",
            !values.inverted,
            values.r,
            values.rInnerPlusD,
            values.d,
            values.maskRotation
        );

        const maskB = this.geometryEngine.createMask(
            "maskB_merged",
            values.inverted,
            values.r,
            values.rInnerPlusD,
            values.d,
            values.maskRotation
        );

        defs.appendChild(maskA);
        defs.appendChild(maskB);

        // Create back layer group with mask
        const backGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        backGroup.setAttribute("mask", "url(#maskB_merged)");

        const backConfig = {
            ...this.createSpokeConfig(values),
            peak: (values.peakAngle + Math.PI) % this.config.TAU,
            stroke: values.backColor,
            offset: values.backOffset
        };
        backGroup.appendChild(this.geometryEngine.buildSpokes(backConfig));

        // Create front layer group with mask
        const frontGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        frontGroup.setAttribute("mask", "url(#maskA_merged)");

        const frontConfig = {
            ...this.createSpokeConfig(values),
            peak: values.peakAngle,
            stroke: values.frontColor,
            offset: values.frontOffset
        };
        frontGroup.appendChild(this.geometryEngine.buildSpokes(frontConfig));

        // Assemble the complete merged SVG
        mergedSvg.replaceChildren(defs, backGroup, frontGroup);
    }

    /**
     * Render the final auxiliary masked layer
     * @param {Object} values - Current parameter values
     */
    renderAuxiliaryMaskedLayer(values) {
        const auxSvg = this.$("svgAuxiliaryMasked");
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

        // Mask for the front part of the underlying merged image
        const maskA = this.geometryEngine.createMask(
            "maskA_aux",
            !values.inverted,
            values.r,
            values.rInnerPlusD,
            values.d,
            values.maskRotation
        );
        defs.appendChild(maskA);

        // Mask for the back part of the underlying merged image
        const maskB = this.geometryEngine.createMask(
            "maskB_aux",
            values.inverted,
            values.r,
            values.rInnerPlusD,
            values.d,
            values.maskRotation
        );
        defs.appendChild(maskB);

        // New auxiliary intersection mask
        const maskAuxIntersection = this.geometryEngine.createAuxiliaryIntersectionMask(
            "maskAux_intersect",
            values.h
        );
        defs.appendChild(maskAuxIntersection);

        // Create content similar to svgMerged (back and front layers with their masks)
        const backSpokesContent = this.geometryEngine.buildSpokes({
            ...this.createSpokeConfig(values),
            peak: (values.peakAngle + Math.PI) % this.config.TAU,
            stroke: values.backColor,
            offset: values.backOffset
        });
        const backGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        backGroup.setAttribute("mask", "url(#maskB_aux)");
        backGroup.appendChild(backSpokesContent);

        const frontSpokesContent = this.geometryEngine.buildSpokes({
            ...this.createSpokeConfig(values),
            peak: values.peakAngle,
            stroke: values.frontColor,
            offset: values.frontOffset
        });
        const frontGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        frontGroup.setAttribute("mask", "url(#maskA_aux)");
        frontGroup.appendChild(frontSpokesContent);

        // Group the reconstructed merged content
        const mergedContentGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        mergedContentGroup.appendChild(backGroup);
        mergedContentGroup.appendChild(frontGroup);

        // Apply the auxiliary intersection mask to this reconstructed content
        mergedContentGroup.setAttribute("mask", "url(#maskAux_intersect)");

        auxSvg.replaceChildren(defs, mergedContentGroup);
    }

    /**
     * Main render function that updates all visual elements
     */
    render() {
        // Update UI labels first
        this.updateLabels();

        // Get current parameter values
        const values = this.getParameterValues();

        // Render all layers
        this.renderFrontLayer(values);
        this.renderBackLayer(values);
        this.renderMergedLayer(values);
        this.renderAuxiliaryMaskedLayer(values);

        // Update canvas for recording (if animation engine is ready and recording)
        if (this.animationEngine && this.animationEngine.isRecording()) {
            this.animationEngine.drawToCanvas();
        }
    }

    /**
     * Get reference to a control element
     * @param {string} id - Element ID
     * @returns {HTMLElement} The control element
     */
    getControl(id) {
        return this.controls[id];
    }

    /**
     * Get current animation state
     * @returns {boolean} True if animation is playing
     */
    isAnimating() {
        return this.animationEngine ? this.animationEngine.isAnimating() : false;
    }

    /**
     * Get current recording state
     * @returns {boolean} True if recording is active
     */
    isRecording() {
        return this.animationEngine ? this.animationEngine.isRecording() : false;
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Make sure all required classes are available
    if (typeof GeometryEngine === 'undefined' ||
        typeof MobileMenuManager === 'undefined' ||
        typeof AnimationEngine === 'undefined') {
        console.error('Required modules not loaded. Make sure all script files are included.');
        return;
    }

    // Create global app instance
    window.fractreeApp = new FractreeApp();
}); 