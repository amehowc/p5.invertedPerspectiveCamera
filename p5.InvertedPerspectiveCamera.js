p5.Camera.prototype.invertedPerspective = function (
    fovy,
    aspect,
    near,
    far,
    perspectiveFactor
) {
    this.cameraType = arguments.length > 0 ? "custom" : "default";
    this.cameraFOV = this._renderer._pInst._toRadians(fovy);
    if (typeof aspect === "undefined") {
        aspect = this.defaultAspectRatio;
    }
    if (typeof near === "undefined") {
        near = this.defaultCameraNear;
    }
    if (typeof far === "undefined") {
        far = this.defaultCameraFar;
    }

    if (near <= 0.0001) {
        near = 0.01;
        console.log(
            "Avoid perspective near plane values close to or below 0. " +
                "Setting value to 0.01."
        );
    }

    if (far < near) {
        console.log(
            "Perspective far plane value is less than near plane value. " +
                "Nothing will be shown."
        );
    }

    this.aspectRatio = aspect;
    this.cameraNear = near;
    this.cameraFar = far;

    const factor = perspectiveFactor || 0.1;
    const nearFarFactor = 1.0 / (this.cameraNear - this.cameraFar);

    const fov = this.cameraFOV * factor;
    const p = -(2 * this.cameraFar * this.cameraNear) * nearFarFactor;

    const scaleX = -factor * (min(width, height) / max(width, height));
    const scaleY = -factor;
    this.projMatrix = p5.Matrix.identity();

    // prettier-ignore
    this.projMatrix.set(
        scaleX, 0, 0, 0,
        0, scaleY, 0, 0,
        0, 0, nearFarFactor, fov,
        0, 0, fov, p
    );

    if (this._isActive()) {
        this._renderer.uPMatrix.set(
            this.projMatrix.mat4[0],
            this.projMatrix.mat4[1],
            this.projMatrix.mat4[2],
            this.projMatrix.mat4[3],
            this.projMatrix.mat4[4],
            this.projMatrix.mat4[5],
            this.projMatrix.mat4[6],
            this.projMatrix.mat4[7],
            this.projMatrix.mat4[8],
            this.projMatrix.mat4[9],
            this.projMatrix.mat4[10],
            this.projMatrix.mat4[11],
            this.projMatrix.mat4[12],
            this.projMatrix.mat4[13],
            this.projMatrix.mat4[14],
            this.projMatrix.mat4[15]
        );
    }
};
