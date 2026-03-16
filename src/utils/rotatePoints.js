import getMinMaxCords from "./getMinMaxCords.js";

const rotatePoints = (pointsArr, angleDeg, cx, cy) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    const result = []
    for (const obj of pointsArr) {
        const cmd = obj.command.toUpperCase()

        if (cmd === 'Z') {
            result.push({command: cmd, params: []})
            continue
        }

        const subResult = {command: obj.command, params: []};
        for (let i = 0; i < obj.params.length; i += 2) {
            if (i + 1 >= obj.params.length) break;

            const x = +obj.params[i];
            const y = +obj.params[i + 1];

            const dx = x - cx
            const dy = y - cy

            const rotatedX = dx * cos - dy * sin
            const rotatedY = dx * sin + dy * cos

            const newX = rotatedX + cx
            const newY = rotatedY + cy

            subResult.params.push(newX, newY)
        }
        result.push(subResult)
    }
    return result
}

export default rotatePoints;