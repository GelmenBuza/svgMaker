const rotatePoints = (pointsArr, angleDeg, cx, cy) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    const rotateCord = (x, y) => {
        const dx = x - cx;
        const dy = y - cy;
        return {
            x: dx * cos - dy * sin + cx,
            y: dx * sin + dy * cos + cy
        };
    };

    const result = [];

    for (const obj of pointsArr) {
        const subResult = { command: obj.command };

        const rotated = rotateCord(obj.x, obj.y);
        subResult.x = rotated.x;
        subResult.y = rotated.y;

        if (obj.in) {
            const rotatedIn = rotateCord(obj.in.x, obj.in.y);
            subResult.in = { x: rotatedIn.x, y: rotatedIn.y };
        }

        if (obj.out) {
            const rotatedOut = rotateCord(obj.out.x, obj.out.y);
            subResult.out = { x: rotatedOut.x, y: rotatedOut.y };
        }

        result.push(subResult);
    }

    return result;
}

export default rotatePoints;