const pointsArrToString = (pointsArr) => {
    if (!pointsArr || pointsArr.length === 0) return ''

    let result = ''
    for (const obj of pointsArr) {
        if (obj.command.toUpperCase() === 'Z') {
            result += `${obj.command} `
            continue
        }

        const formatedParams = obj.params.map(param => +param.toFixed(3))
        const params = []
        for (let i = 0; i < formatedParams.length; i += 2) {
            const x = +formatedParams[i];
            const y = +formatedParams[i + 1];
            params.push(`${x},${y}`);
        }
        result += `${obj.command} ${params.join(' ')} `
    }
    return result.trim()
}

export default pointsArrToString;