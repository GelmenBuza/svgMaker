
const getMinMaxCords = (pointsArr) => {
    if (!pointsArr || pointsArr.length === 0) return {min: [0, 0], max: [0, 0]}


    const result = {min: [1000000, 1000000], max: [0, 0]}
    for (const obj of pointsArr) {
        if (obj.command.toUpperCase() === 'Z') {
            continue
        }
        result.min[0] = obj.x < result.min[0] ? obj.x : result.min[0]
        result.min[1] = obj.y < result.min[1] ? obj.y : result.min[1]

        result.max[0] = obj.x > result.max[0] ? obj.x : result.max[0]
        result.max[1] = obj.y > result.max[1] ? obj.y : result.max[1]
    }

    return result;
}

export default getMinMaxCords;