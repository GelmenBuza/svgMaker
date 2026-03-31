const pointsArrToString = (pointsArr) => {
    if (!pointsArr || pointsArr.length === 0) return ''

    let result = ''
    for (let i = 0; i < pointsArr.length; i++) {
        const obj = pointsArr[i]
        const cmd = obj.command.toUpperCase()

        if (cmd === 'Z') {
            result += 'Z '
            continue
        }

        if (cmd === 'M') {
            result += `M ${obj.x},${obj.y} `
            continue
        }

        if (cmd === 'L') {
            result += `L ${obj.x},${obj.y} `
            continue
        }

        if (cmd === 'C') {
            // out — контрольная точка начала сегмента (из предыдущей точки)
            let outX, outY
            const prev = pointsArr[i - 1]
            if (prev && prev.out) {
                outX = prev.out.x
                outY = prev.out.y
            } else if (prev) {
                // Если у предыдущей точки нет out (например, M), используем её координаты
                outX = prev.x
                outY = prev.y
            } else {
                // Защита: если нет предыдущей точки (не должно быть), используем текущие координаты
                outX = obj.x
                outY = obj.y
            }

            // in — контрольная точка конца сегмента (из текущей точки)
            const inX = obj.in ? obj.in.x : obj.x
            const inY = obj.in ? obj.in.y : obj.y

            result += `C ${outX},${outY} ${inX},${inY} ${obj.x},${obj.y} `
            continue
        }

        // Для других команд (H, V, A) — либо конвертируйте их в M, L, C,
        // либо реализуйте аналогичную логику с учётом спецификации.
        result += `${cmd} ${obj.x},${obj.y} `
    }
    return result.trim()
}

export default pointsArrToString;