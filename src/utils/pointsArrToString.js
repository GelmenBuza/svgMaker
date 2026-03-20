const pointsArrToString = (pointsArr) => {
    if (!pointsArr || pointsArr.length === 0) return ''

    let result = ''
    for (const obj of pointsArr) {
        if (obj.command.toUpperCase() === 'Z') {
            result += `${obj.command} `
            continue
        }
        const params = []
        let x, y;
        let inX, inY;
        let outX, outY;

        if (obj.command.toUpperCase() === 'M') {
            x = obj.x;
            y = obj.y;
        } else if ('LHVA'.includes(obj.command.toUpperCase())) {
            x = obj.x;
            y = obj.y;
            inX = obj.in.x;
            inY = obj.in.y;
        } else {
            x = obj.x;
            y = obj.y;
            inX = obj.in.x;
            inY = obj.in.y;
            outX = obj.out.x;
            outY = obj.out.y;
        }

        params.push(`${x},${y}`, inX ? `${inX},${inY}` : '', outX ? `${outX},${outY}` : '');
        result += `${obj.command} ${params.join(' ')} `
    }
    return result.trim()
}

export default pointsArrToString;