const getCenterPath = (pointsArr) => {
    let count = 0
    let xSum = 0
    let ySum = 0
    for (const obj of pointsArr) {
        const cmd = obj.command.toUpperCase()
        if (cmd === 'Z') continue
        xSum += obj.x
        ySum += obj.y
        count++
    }
    return count ? [xSum / count, ySum / count] : [0, 0]
}

export default getCenterPath;