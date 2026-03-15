const getCenterPath = (pointsArr) => {
    let count = 0
    let xSum = 0
    let ySum = 0
    for (const obj of pointsArr) {
        const cmd = obj.command.toUpperCase()
        if (cmd === 'Z') continue

        for (let i = 0; i < obj.params.length; i += 2) {
            xSum += +obj.params[i];
            ySum += +obj.params[i + 1];
            count++
        }
    }
    return count ? [xSum / count, ySum / count] : [0, 0]
}

export default getCenterPath;