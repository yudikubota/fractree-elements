/**
 * ═══════════════════════════════════════════════════════════════
 * FRACTREE LOGO GENERATOR - ANIMATION & RECORDING ENGINE
 * Handles animation loops, parameter updates, and video recording
 * ═══════════════════════════════════════════════════════════════
 */

class AnimationEngine {
    constructor(controls, paramList, renderCallback) {
        this.controls = controls;
        this.paramList = paramList;
        this.renderCallback = renderCallback;

        // Animation state
        this.isPlaying = false;
        this.lastTimestamp = null;

        // Recording state - managed per active recording session
        this.recorder = null;
        this.recordedBlobs = [];
        this.activeSourceSvgId = null;
        this.activeTargetCanvas = null;
        this.activeRecordButton = null;
        this.activeStopRecordButton = null;

        this.initializeElements();
        this.setupEventListeners();
    }

    /**
     * Initialize elements needed for animation control (play button)
     */
    initializeElements() {
        this.playButton = document.getElementById("playBtn");
        // Canvas, record/stop buttons are now passed during startRecording
    }

    /**
     * Setup event listeners for animation control
     */
    setupEventListeners() {
        this.playButton.addEventListener('click', () => this.toggleAnimation());
        // Record/stop button listeners are now managed by FractreeApp
    }

    /**
     * Toggle animation play/pause state
     */
    toggleAnimation() {
        this.isPlaying = !this.isPlaying;
        this.playButton.textContent = this.isPlaying ? "Pause" : "Play";

        if (this.isPlaying) {
            this.lastTimestamp = null;
            requestAnimationFrame((timestamp) => this.animationLoop(timestamp));
        }
    }

    /**
     * Main animation loop that updates parameters and triggers re-renders
     * @param {number} timestamp - Current timestamp from requestAnimationFrame
     */
    animationLoop(timestamp) {
        if (!this.isPlaying) {
            this.lastTimestamp = null;
            return;
        }

        // Initialize timestamp on first frame
        if (this.lastTimestamp === null) {
            this.lastTimestamp = timestamp;
        }

        // Calculate delta time in seconds
        const deltaTime = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;

        // Update parameters based on their velocities
        this.updateParameters(deltaTime);

        // Trigger re-render
        this.renderCallback();

        // Continue animation loop
        requestAnimationFrame((timestamp) => this.animationLoop(timestamp));
    }

    /**
     * Update all parameters based on their velocity values
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     */
    updateParameters(deltaTime) {
        this.paramList.forEach(param => {
            const velocityControl = this.controls[param.id + "Vel"];
            // Ensure velocityControl exists before trying to access its value
            if (!velocityControl) return;

            const valueControl = this.controls[param.id];
            // Ensure valueControl exists
            if (!valueControl) return;

            const velocity = parseFloat(velocityControl.value);

            // Skip parameters with zero velocity
            if (velocity === 0) return;

            // Calculate new value
            let newValue = parseFloat(valueControl.value) + velocity * deltaTime;

            // Handle wrapping for parameters that should cycle
            const { min, max } = param;
            if (newValue > max) {
                newValue = min + (newValue - max) % (max - min);
            }
            if (newValue < min) {
                newValue = max - (min - newValue) % (max - min);
            }

            // Update the control value
            valueControl.value = newValue;
        });
    }

    /**
     * Draw the current SVG state to the canvas for recording
     * This method should be called after each render to keep canvas in sync
     * It now uses the actively configured SVG source and target canvas.
     */
    drawToCanvas() {
        if (!this.isRecording() || !this.activeSourceSvgId || !this.activeTargetCanvas) {
            return; // Not recording or not properly configured
        }

        const svgElement = document.getElementById(this.activeSourceSvgId);
        if (!svgElement) {
            console.error(`SVG element with ID '${this.activeSourceSvgId}' not found for recording.`);
            return;
        }
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const targetCtx = this.activeTargetCanvas.getContext("2d");

        const img = new Image();
        img.onload = () => {
            // Fill canvas with white background
            targetCtx.fillStyle = 'white';
            targetCtx.fillRect(0, 0, this.activeTargetCanvas.width, this.activeTargetCanvas.height);

            // Draw the new frame
            targetCtx.drawImage(img, 0, 0, this.activeTargetCanvas.width, this.activeTargetCanvas.height);

            // Clean up the object URL to prevent memory leaks
            URL.revokeObjectURL(img.src);
        };
        img.onerror = () => {
            console.error("Error loading SVG image for canvas drawing.");
            URL.revokeObjectURL(img.src); // Clean up on error too
        }

        // Convert SVG to data URL for rendering
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    }

    /**
     * Start recording the animation
     * @param {HTMLCanvasElement} targetCanvas - The canvas to record from.
     * @param {HTMLButtonElement} recordButton - The specific record button for this target.
     * @param {HTMLButtonElement} stopRecordButton - The specific stop button for this target.
     * @param {string} sourceSvgId - The ID of the SVG element to capture.
     */
    startRecording(targetCanvas, recordButton, stopRecordButton, sourceSvgId) {
        if (this.isRecording()) {
            alert("Another recording is already in progress.");
            return;
        }

        this.activeTargetCanvas = targetCanvas;
        this.activeSourceSvgId = sourceSvgId;
        this.activeRecordButton = recordButton;
        this.activeStopRecordButton = stopRecordButton;

        try {
            // Get canvas stream at 30fps
            const stream = this.activeTargetCanvas.captureStream(30);

            // Initialize MediaRecorder with WebM format
            this.recorder = new MediaRecorder(stream, {
                mimeType: "video/webm"
            });

            // Reset blob storage
            this.recordedBlobs = [];

            // Handle data availability during recording
            this.recorder.addEventListener('dataavailable', (event) => {
                if (event.data && event.data.size > 0) {
                    this.recordedBlobs.push(event.data);
                }
            });

            // Handle recording stop
            this.recorder.addEventListener('stop', () => {
                this._handleRecordingStopped();
            });

            // Start recording
            this.recorder.start();

            // Update UI
            this.activeRecordButton.disabled = true;
            this.activeStopRecordButton.disabled = false;

            console.log(`Recording started for ${sourceSvgId} on canvas ${targetCanvas.id}`);

        } catch (error) {
            console.error("Failed to start recording:", error);
            alert("Recording failed. This feature requires a Chromium-based browser (Chrome, Edge, Brave, etc.)");
        }
    }

    /**
     * Stop recording and prepare for download
     */
    stopRecording() {
        if (this.recorder && this.recorder.state !== 'inactive') {
            this.recorder.stop(); // This will trigger 'stop' event listener
        } else {
            // If stop is called without active recorder, ensure UI is reset
            if (this.activeRecordButton) this.activeRecordButton.disabled = false;
            if (this.activeStopRecordButton) this.activeStopRecordButton.disabled = true;
            this.clearActiveRecordingState();
        }
    }

    /** 
     * Internal handler for recorder's 'stop' event 
     */
    _handleRecordingStopped() {
        this.downloadRecording();
        if (this.activeRecordButton) this.activeRecordButton.disabled = false;
        if (this.activeStopRecordButton) this.activeStopRecordButton.disabled = true;
        this.clearActiveRecordingState();
        console.log("Recording stopped and processed");
    }

    clearActiveRecordingState() {
        this.activeSourceSvgId = null;
        this.activeTargetCanvas = null;
        this.activeRecordButton = null;
        this.activeStopRecordButton = null;
    }

    /**
     * Create and download the recorded video file
     */
    downloadRecording() {
        if (this.recordedBlobs.length === 0) {
            console.warn("No recorded data available for download");
            return;
        }

        // Create blob from recorded chunks
        const blob = new Blob(this.recordedBlobs, { type: "video/webm" });

        // Create download link
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        const fileNameSuffix = this.activeSourceSvgId || 'animation';
        downloadLink.download = `fractree_${fileNameSuffix}_${this.generateTimestamp()}.webm`;

        // Trigger download
        downloadLink.click();

        // Clean up
        URL.revokeObjectURL(downloadLink.href);
        this.recordedBlobs = [];

        console.log("Recording downloaded successfully");
    }

    /**
     * Generate a timestamp string for file naming
     * @returns {string} Formatted timestamp
     */
    generateTimestamp() {
        const now = new Date();
        return now.toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .replace(/Z$/, ''); // Remove trailing Z for cleaner filenames
    }

    /**
     * Check if animation is currently playing
     * @returns {boolean} True if animation is active
     */
    isAnimating() {
        return this.isPlaying;
    }

    /**
     * Check if recording is currently active
     * @returns {boolean} True if recording is in progress
     */
    isRecording() {
        return this.recorder && this.recorder.state === "recording";
    }

    /**
     * Stop animation and clear recording state if any.
     */
    stopAnimation() {
        if (this.isPlaying) {
            this.isPlaying = false;
            this.playButton.textContent = "Play";
            this.lastTimestamp = null;
        }
        if (this.isRecording()) {
            // Note: This directly calls stop on recorder, which then calls _handleRecordingStopped
            this.recorder.stop();
        }
    }
}

// Export for use in main application
window.AnimationEngine = AnimationEngine; 