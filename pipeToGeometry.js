const pointsToPipeGeom = function (centers, pipeR, capType = "flat") {
    return new p5.Geometry(1, 1, function () {
        this.gid = "pipe";
        const numPoints = centers.length;
        const numCirclePoints = 24;

        const tangents = [];
        const normals = [];
        const biNormals = [];
        for (let i = 0; i < numPoints - 1; i++) {
            tangents.push(centers[i + 1].copy().sub(centers[i]).normalize());
        }
        tangents.push(tangents[tangents.length - 1]);

        const up = createVector(0, 1, 0);
        for (let i = 0; i < numPoints; i++) {
            const tangent = tangents[i];
            const normal = up.cross(tangent).normalize();
            normals.push(normal);
        }

        normals.forEach((normal, i) => {
            const biNormalVec = tangents[i].cross(normal).normalize();
            biNormals.push(biNormalVec);
            const biBiNormal = biNormalVec.cross(tangents[i]).normalize();
            normal.set(biBiNormal.x, biBiNormal.y, biBiNormal.z);
        });

        for (let i = 0; i < numPoints; i++) {
            const frac = i / (numPoints - 1);
            const u = frac;
            const ringStartIdx = this.vertices.length;
            const prevRingStartIdx = ringStartIdx - numCirclePoints;

            const centerVec = centers[i];
            const normalVec = normals[i];
            const biNormalVec = biNormals[i];

            for (let j = 0; j <= numCirclePoints; j++) {
                const angle = (j / numCirclePoints) * TWO_PI;
                const v = j / (numCirclePoints - 1);
                const pt = centerVec
                    .copy()
                    .add(normalVec.copy().mult(pipeR * sin(angle)))
                    .add(biNormalVec.copy().mult(pipeR * cos(angle)));
                this.vertices.push(pt);
                this.vertexNormals.push(pt.copy().sub(centerVec).normalize());
                this.uvs.push([u, v]);

                if (i > 0) {
                    this.faces.push([
                        prevRingStartIdx + j,
                        ringStartIdx + j,
                        ringStartIdx + ((j + 1) % numCirclePoints),
                    ]);
                    this.faces.push([
                        ringStartIdx + ((j + 1) % numCirclePoints),
                        prevRingStartIdx + ((j + 1) % numCirclePoints),
                        prevRingStartIdx + j,
                    ]);
                }
            }

            // Handle caps TO FINISH
            if (i === 0 || i === numPoints - 1) {
                if (capType === "rounded") {
                    const segments = numCirclePoints; // Number of segments for the hemisphere
                    const capCenterIdx = this.vertices.length;

                    // Orientation vectors
                    const standardUp = createVector(0, 1, 0);
                    let targetUp = tangents[i];

                    // Adjust the targetUp based on the pipe orientation
                    if (i === 0) {
                        targetUp = targetUp.mult(-1); // Invert for the starting point
                    } else if (i === numPoints - 1) {
                        targetUp = targetUp; // Use as-is for the ending point
                    }

                    const rotationAxis = standardUp.cross(targetUp);
                    const rotationAngle = acos(standardUp.dot(targetUp));

                    for (let lat = 0; lat <= segments / 2; lat++) {
                        const theta = (lat / (segments / 2)) * (PI / 2);
                        const sinTheta = sin(theta);
                        const cosTheta = cos(theta);

                        for (let long = 0; long <= segments; long++) {
                            const phi = (long / segments) * TWO_PI;
                            const sinPhi = sin(phi);
                            const cosPhi = cos(phi);

                            const x = cosPhi * sinTheta;
                            const y = cosTheta;
                            const z = sinPhi * sinTheta;

                            const v = createVector(x, y, z);
                            v.mult(pipeR); // Adjust by radius

                            // Rotate the point to align with the pipe's tangent
                            const rotatedV = rotateAroundAxis(
                                v,
                                rotationAxis,
                                rotationAngle
                            );

                            rotatedV.add(centerVec);

                            // Flip normals for the start cap
                            const normal = rotatedV
                                .copy()
                                .sub(centerVec)
                                .normalize();
                            if (i === 0) {
                                //normal.mult(-1); // Uncomment if you want the normal facing the opposite direction
                            }

                            this.vertices.push(rotatedV);
                            this.vertexNormals.push(normal);
                            this.uvs.push([
                                long / segments,
                                2 * (lat / segments),
                            ]); // UVs for hemisphere

                            // Add faces
                            if (lat < segments / 2 && long < segments) {
                                const first =
                                    capCenterIdx + lat * (segments + 1) + long;
                                const second = first + segments + 1;
                                this.faces.push([first, second, first + 1]);
                                this.faces.push([
                                    second,
                                    second + 1,
                                    first + 1,
                                ]);
                            }
                        }
                    }
                    //           if (i === 0) {
                    //             // For the start of the pipe
                    //             for (let j = 0; j < numCirclePoints; j++) {
                    //               const first = ringStartIdx + j;
                    //               const second = capCenterIdx + 1 + j;
                    //               const third = capCenterIdx + 1 + ((j + 1) % numCirclePoints);
                    //               const fourth = ringStartIdx + ((j + 1) % numCirclePoints);

                    //               this.faces.push([first, third, second]);
                    //               this.faces.push([first, fourth, third]);
                    //             }
                    //           } else if (i === numPoints - 1) {
                    //             // For the end of the pipe
                    //             for (let j = 0; j < numCirclePoints; j++) {
                    //               const first = ringStartIdx + j;
                    //               const second = capCenterIdx + 1 + j;
                    //               const third = capCenterIdx + 1 + ((j + 1) % numCirclePoints);
                    //               const fourth = ringStartIdx + ((j + 1) % numCirclePoints);

                    //               this.faces.push([first, second, third]);
                    //               this.faces.push([first, third, fourth]);
                    //             }
                    //           }
                } else {
                    const capCenterIdx = this.vertices.length;
                    this.vertices.push(centerVec);
                    this.vertexNormals.push(
                        tangents[i].copy().mult(i === 0 ? -1 : 1)
                    );
                    this.uvs.push([u, 0.5]);

                    for (let j = 0; j < numCirclePoints - 1; j++) {
                        if (i === 0) {
                            this.faces.push([
                                capCenterIdx,
                                ringStartIdx + j + 1,
                                ringStartIdx + j + 2,
                            ]);
                        } else {
                            this.faces.push([
                                ringStartIdx + j + 1,
                                capCenterIdx,
                                ringStartIdx + j + 2,
                            ]);
                        }
                    }

                    if (i === 0) {
                        this.faces.push([
                            capCenterIdx,
                            ringStartIdx + numCirclePoints,
                            ringStartIdx + 1,
                        ]);
                    } else {
                        this.faces.push([
                            ringStartIdx,
                            capCenterIdx,
                            ringStartIdx + 1,
                        ]);
                    }
                }
            }
        }
    });
};

function rotateAroundAxis(v, axis, angle) {
    const cosTheta = cos(angle);
    const sinTheta = sin(angle);
    const dotProduct = v.dot(axis);
    const crossProduct = axis.cross(v);

    const rotated = p5.Vector.mult(v, cosTheta);
    rotated.add(p5.Vector.mult(crossProduct, sinTheta));
    rotated.add(p5.Vector.mult(axis, dotProduct * (1 - cosTheta)));

    return rotated;
}
