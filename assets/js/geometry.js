/**
 * ═══════════════════════════════════════════════════════════════
 * FRACTREE LOGO GENERATOR - GEOMETRY & SVG UTILITIES
 * Mathematical calculations and SVG generation for fractal patterns
 * ═══════════════════════════════════════════════════════════════
 */

class GeometryEngine {
    constructor() {
        // Mathematical constants
        this.TAU = Math.PI * 2;
        this.VIEW_SIZE = 400;
        this.CENTER_X = this.VIEW_SIZE / 2;
        this.CENTER_Y = this.VIEW_SIZE / 2;
    }

    /**
     * Calculate spoke width based on angle and parameters
     * @param {number} angle - Current angle
     * @param {number} peakAngle - Angle where thickness is maximum
     * @param {number} minThickness - Minimum thickness
     * @param {number} maxThickness - Maximum thickness
     * @param {boolean} inverted - Whether to invert the gradient direction
     * @returns {number} Calculated spoke width
     */
    calculateSpokeWidth(angle, peakAngle, minThickness, maxThickness, inverted) {
        const normalizedAngle = ((angle - peakAngle + this.TAU) % this.TAU) / this.TAU;

        if (inverted) {
            return minThickness + (maxThickness - minThickness) * normalizedAngle;
        } else {
            return minThickness + (maxThickness - minThickness) * (1 - normalizedAngle);
        }
    }

    /**
     * Generate a collection of radial spokes as SVG elements
     * @param {Object} config - Configuration object for spoke generation
     * @returns {DocumentFragment} SVG elements ready to be appended
     */
    buildSpokes(config) {
        const {
            count,
            rInner,
            rOuter,
            tMin: minThickness,
            tMax: maxThickness,
            peak: peakAngle,
            stroke: strokeColor,
            invert: inverted,
            offset
        } = config;

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < count; i++) {
            const angle = offset + this.TAU * i / count;
            const width = this.calculateSpokeWidth(angle, peakAngle + offset, minThickness, maxThickness, inverted);

            // Create SVG line element
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

            // Calculate start and end points
            const startX = this.CENTER_X + rInner * Math.cos(angle);
            const startY = this.CENTER_Y + rInner * Math.sin(angle);
            const endX = this.CENTER_X + rOuter * Math.cos(angle);
            const endY = this.CENTER_Y + rOuter * Math.sin(angle);

            // Set line attributes
            line.setAttribute("x1", startX);
            line.setAttribute("y1", startY);
            line.setAttribute("x2", endX);
            line.setAttribute("y2", endY);
            line.setAttribute("stroke", strokeColor);
            line.setAttribute("stroke-width", width.toFixed(2));
            line.setAttribute("stroke-linecap", "butt");

            fragment.appendChild(line);
        }

        return fragment;
    }

    /**
     * Generate a semicircular path for mask creation
     * @param {number} yOffset - Vertical offset for the semicircle
     * @param {number} innerRadius - Inner radius
     * @param {number} outerRadius - Outer radius
     * @param {number} direction - Direction of the semicircle (1 or -1)
     * @returns {string} SVG path data
     */
    generateSemiPath(yOffset, innerRadius, outerRadius, direction) {
        const steps = 90;
        let pathData = "";
        const startAngle = direction > 0 ? -Math.PI / 2 : Math.PI / 2;

        // Draw outer arc
        for (let i = 0; i <= steps; i++) {
            const theta = startAngle + i * Math.PI / steps;
            const x = outerRadius * Math.cos(theta);
            const y = yOffset + outerRadius * Math.sin(theta);
            pathData += (i === 0 ? "M" : "L") + x + " " + y + " ";
        }

        // Draw inner arc (reverse direction)
        for (let i = steps; i >= 0; i--) {
            const theta = startAngle + i * Math.PI / steps;
            const x = innerRadius * Math.cos(theta);
            const y = innerRadius * Math.sin(theta);
            pathData += "L" + x + " " + y + " ";
        }

        return pathData + "Z";
    }

    /**
     * Create an SVG mask for layering effects
     * @param {string} maskId - Unique ID for the mask
     * @param {boolean} isLeft - Whether this is a left-side mask
     * @param {number} innerRadius - Inner radius
     * @param {number} outerRadius - Outer radius
     * @param {number} deltaOffset - Offset delta
     * @param {number} rotation - Rotation angle in degrees
     * @returns {SVGElement} Complete SVG mask element
     */
    createMask(maskId, isLeft, innerRadius, outerRadius, deltaOffset, rotation) {
        // Create mask element
        const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
        mask.id = maskId;

        // Black background (hides everything)
        const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        background.setAttribute("width", this.VIEW_SIZE);
        background.setAttribute("height", this.VIEW_SIZE);
        background.setAttribute("fill", "black");
        mask.appendChild(background);

        // Create transform group
        const transformGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        transformGroup.setAttribute("transform", `translate(${this.CENTER_X} ${this.CENTER_Y}) rotate(${rotation})`);

        // Half-plane rectangle (white reveals content)
        const halfPlane = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        halfPlane.setAttribute("x", isLeft ? -this.VIEW_SIZE : 0);
        halfPlane.setAttribute("y", -this.VIEW_SIZE);
        halfPlane.setAttribute("width", this.VIEW_SIZE);
        halfPlane.setAttribute("height", this.VIEW_SIZE * 2);
        halfPlane.setAttribute("fill", "white");
        transformGroup.appendChild(halfPlane);

        // Additive semicircle (white reveals more)
        const additivePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const additiveData = this.generateSemiPath(
            isLeft ? -deltaOffset : +deltaOffset,
            innerRadius,
            outerRadius,
            isLeft ? 1 : -1
        );
        additivePath.setAttribute("d", additiveData);
        additivePath.setAttribute("fill", "white");
        transformGroup.appendChild(additivePath);

        // Subtractive semicircle (black hides content)
        const subtractivePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const subtractiveData = this.generateSemiPath(
            isLeft ? +deltaOffset : -deltaOffset,
            innerRadius,
            outerRadius,
            isLeft ? -1 : +1
        );
        subtractivePath.setAttribute("d", subtractiveData);
        subtractivePath.setAttribute("fill", "black");
        transformGroup.appendChild(subtractivePath);

        mask.appendChild(transformGroup);
        return mask;
    }

    /**
     * Create an SVG mask from the intersection of two auxiliary circles C5 and C6.
     * C5: center (0, +h), radius 2h. In SVG: (CX, CY - h)
     * C6: center (0, -h), radius 2h. In SVG: (CX, CY + h)
     * Intersection points: (CX ± h√3, CY)
     * @param {string} maskId - Unique ID for the mask
     * @param {number} h - Offset parameter for the auxiliary circles
     * @returns {SVGElement} Complete SVG mask element for the lens shape
     */
    createAuxiliaryIntersectionMask(maskId, h) {
        const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
        mask.id = maskId;

        // Black background (hides everything by default)
        const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        background.setAttribute("width", this.VIEW_SIZE);
        background.setAttribute("height", this.VIEW_SIZE);
        background.setAttribute("fill", "black");
        mask.appendChild(background);

        if (h <= 0) { // Avoid issues with h=0 or negative h
            // Return a mask that hides everything if h is not positive
            return mask;
        }

        const P1_x = this.CENTER_X - h * Math.sqrt(3);
        const P_y = this.CENTER_Y; // y is the same for both intersection points
        const P2_x = this.CENTER_X + h * Math.sqrt(3);
        const R_aux = 2 * h;

        // Path for the lens shape (intersection of C5 and C6)
        // Arc 1: Part of C6 (center CX, CY + h), from P1 to P2, counter-clockwise (sweep 1)
        // Arc 2: Part of C5 (center CX, CY - h), from P2 to P1, counter-clockwise (sweep 1)
        const lensPathData = `M ${P1_x} ${P_y} A ${R_aux} ${R_aux} 0 0 1 ${P2_x} ${P_y} A ${R_aux} ${R_aux} 0 0 1 ${P1_x} ${P_y} Z`;

        const lensPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        lensPath.setAttribute("d", lensPathData);
        lensPath.setAttribute("fill", "white"); // White reveals content
        mask.appendChild(lensPath);

        return mask;
    }

    /**
     * Initialize SVG viewBox for all main SVG elements
     * @param {string[]} svgIds - Array of SVG element IDs to initialize
     */
    initializeSVGViewBoxes(svgIds) {
        svgIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.setAttribute("viewBox", `0 0 ${this.VIEW_SIZE} ${this.VIEW_SIZE}`);
            }
        });
    }
}

// Export for use in main application
window.GeometryEngine = GeometryEngine; 