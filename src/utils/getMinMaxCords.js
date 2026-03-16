
const getMinMaxCords = (pointsArr) => {
    if (!pointsArr || pointsArr.length === 0) return


    const result = {min: [1000000, 1000000], max: [0, 0]}
    for (const obj of pointsArr) {
        if (obj.command.toUpperCase() === 'Z') {
            continue
        }

        let [minX, minY] = result.min
        let [maxX, maxY] = result.max

        for (let i = 0; i < obj.params.length; i += 2) {
            if (minX > obj.params[i]) minX = obj.params[i]
            if (minY > obj.params[i + 1]) minY = obj.params[i + 1]

            if (maxX < obj.params[i]) maxX = obj.params[i]
            if (maxY < obj.params[i + 1]) maxY = obj.params[i + 1]
        }
        result.min = [minX, minY]
        result.max = [maxX, maxY]
    }

    return result;
}

export default getMinMaxCords;