

const rotatePoints = (pointsArr, angleDeg, cx, cy) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    const result = []
    for (const obj of pointsArr) {
        const cmd = obj.command.toUpperCase()

        if (cmd === 'Z') continue

        const subResult = {command: obj.command, params: []};

        const x = obj.x;
        const y = obj.y;

        const dx = x - cx
        const dy = y - cy

        const rotatedX = dx * cos - dy * sin
        const rotatedY = dx * sin + dy * cos

        const newX = rotatedX + cx
        const newY = rotatedY + cy

        subResult.params.push(newX, newY)

        result.push(subResult)
    }
    return result
}

export default rotatePoints;