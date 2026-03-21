const parsePathData = (d) => {
    if (!d) return []

    // === 1. Токенизация ===
    const tokens = []
    const regex = /([MmLlHhVvCcSsQqTtAaZz])|(-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/g
    let match
    while ((match = regex.exec(d)) !== null) {
        if (match[1]) {
            tokens.push(match[1])
        } else if (match[2]) {
            tokens.push(parseFloat(match[2]))
        }
    }

    const result = []
    let i = 0
    let x = 0, y = 0 // текущая позиция
    let startX = 0, startY = 0 // начальная позиция для Z
    let lastControlX = 0, lastControlY = 0 // последняя контрольная точка (для S/T)

    // Вспомогательные функции
    const round = (v) => Math.round(v * 1000) / 1000

    const createPoint = (command, px, py, handleIn = null, handleOut = null) => {
        const point = {
            command,
            x: round(px),
            y: round(py),
        }
        if (handleIn) {
            point.in = { x: round(handleIn.x), y: round(handleIn.y) }
        }
        if (handleOut) {
            point.out = { x: round(handleOut.x), y: round(handleOut.y) }
        }
        return point
    }

    const setLastOutHandle = (hx, hy) => {
        if (result.length > 0) {
            const last = result[result.length - 1]
            if (!last.out && last.command !== 'Z') {
                last.out = { x: round(hx), y: round(hy) }
            }
        }
    }

    // === 2. Парсинг команд ===
    while (i < tokens.length) {
        const token = tokens[i]

        if (typeof token !== 'string') {
            i++
            continue
        }

        const cmd = token
        const cmdUpper = cmd.toUpperCase()
        const isRelative = cmd === cmd.toLowerCase()

        switch (cmdUpper) {
            case 'M': {
                // Moveto — берём только первую пару координат.
                // Дополнительные пары игнорируются (не создаём неявные L).

                let nx = tokens[++i]
                let ny = tokens[++i]

                // Защита от некорректных данных
                if (nx === undefined || ny === undefined) break

                if (isRelative) {
                    nx += x
                    ny += y
                }

                // Создаём чистую точку M без хендлов (in/out)
                result.push(createPoint('M', nx, ny))

                // Обновляем состояние парсера
                startX = nx
                startY = ny
                x = nx
                y = ny
                lastControlX = x
                lastControlY = y

                // ⚠️ Пропускаем любые дополнительные координаты,
                // если они были (чтобы не интерпретировать их как L)
                while (i + 1 < tokens.length && typeof tokens[i + 1] === 'number') {
                    i += 2
                }
                break
            }

            case 'L': {
                while (i + 1 < tokens.length && typeof tokens[i + 1] === 'number') {
                    let nx = tokens[++i]
                    let ny = tokens[++i]
                    if (isRelative) {
                        nx += x
                        ny += y
                    }
                    setLastOutHandle(x, y)
                    result.push(createPoint('L', nx, ny, { x: x, y: y }))
                    x = nx
                    y = ny
                    lastControlX = x
                    lastControlY = y
                }
                break
            }

            case 'H': {
                while (i + 1 < tokens.length && typeof tokens[i + 1] === 'number') {
                    let nx = tokens[++i]
                    if (isRelative) nx += x
                    setLastOutHandle(x, y)
                    result.push(createPoint('H', nx, y, { x: x, y: y }))
                    x = nx
                    lastControlX = x
                }
                break
            }

            case 'V': {
                while (i + 1 < tokens.length && typeof tokens[i + 1] === 'number') {
                    let ny = tokens[++i]
                    if (isRelative) ny += y
                    setLastOutHandle(x, y)
                    result.push(createPoint('V', x, ny, { x: x, y: y }))
                    y = ny
                    lastControlY = y
                }
                break
            }

            case 'C': {
                // Cubic Bezier: x1 y1 x2 y2 x y
                while (i + 5 < tokens.length && typeof tokens[i + 1] === 'number') {
                    let x1 = tokens[++i]
                    let y1 = tokens[++i]
                    let x2 = tokens[++i]
                    let y2 = tokens[++i]
                    let nx = tokens[++i]
                    let ny = tokens[++i]

                    if (isRelative) {
                        x1 += x; y1 += y
                        x2 += x; y2 += y
                        nx += x; ny += y
                    }

                    // OUT handle предыдущей точки = (x1, y1)
                    setLastOutHandle(x1, y1)

                    // Новая точка с IN handle = (x2, y2)
                    result.push(createPoint('C', nx, ny, { x: x2, y: y2 }))

                    lastControlX = x2
                    lastControlY = y2
                    x = nx
                    y = ny
                }
                break
            }

            case 'S': {
                // Smooth cubic: x2 y2 x y (x1 отражается)
                while (i + 3 < tokens.length && typeof tokens[i + 1] === 'number') {
                    // Отражаем предыдущую контрольную точку
                    let x1, y1
                    const last = result[result.length - 1]
                    if (last && (last.command === 'C' || last.command === 'S')) {
                        x1 = x * 2 - lastControlX
                        y1 = y * 2 - lastControlY
                    } else {
                        x1 = x
                        y1 = y
                    }

                    let x2 = tokens[++i]
                    let y2 = tokens[++i]
                    let nx = tokens[++i]
                    let ny = tokens[++i]

                    if (isRelative) {
                        x2 += x; y2 += y
                        nx += x; ny += y
                    }

                    setLastOutHandle(x1, y1)
                    result.push(createPoint('S', nx, ny, { x: x2, y: y2 }))

                    lastControlX = x2
                    lastControlY = y2
                    x = nx
                    y = ny
                }
                break
            }

            case 'Q': {
                // Quadratic Bezier: x1 y1 x y
                // Конвертируем в кубические хендлы: control * 2/3
                while (i + 3 < tokens.length && typeof tokens[i + 1] === 'number') {
                    let qx = tokens[++i]
                    let qy = tokens[++i]
                    let nx = tokens[++i]
                    let ny = tokens[++i]

                    if (isRelative) {
                        qx += x; qy += y
                        nx += x; ny += y
                    }

                    // Конвертация квадратичной в кубическую
                    const outX = x + (qx - x) * 2/3
                    const outY = y + (qy - y) * 2/3
                    const inX = nx + (qx - nx) * 2/3
                    const inY = ny + (qy - ny) * 2/3

                    setLastOutHandle(outX, outY)
                    result.push(createPoint('Q', nx, ny, { x: inX, y: inY }))

                    lastControlX = qx
                    lastControlY = qy
                    x = nx
                    y = ny
                }
                break
            }

            case 'T': {
                // Smooth quadratic
                while (i + 1 < tokens.length && typeof tokens[i + 1] === 'number') {
                    let qx, qy
                    const last = result[result.length - 1]
                    if (last && (last.command === 'Q' || last.command === 'T')) {
                        qx = x * 2 - lastControlX
                        qy = y * 2 - lastControlY
                    } else {
                        qx = x
                        qy = y
                    }

                    let nx = tokens[++i]
                    let ny = tokens[++i]

                    if (isRelative) {
                        nx += x; ny += y
                    }

                    const outX = x + (qx - x) * 2/3
                    const outY = y + (qy - y) * 2/3
                    const inX = nx + (qx - nx) * 2/3
                    const inY = ny + (qy - ny) * 2/3

                    setLastOutHandle(outX, outY)
                    result.push(createPoint('T', nx, ny, { x: inX, y: inY }))

                    lastControlX = qx
                    lastControlY = qy
                    x = nx
                    y = ny
                }
                break
            }

            case 'A': {
                // Arc - упрощённая обработка (без конвертации в безье)
                while (i + 6 < tokens.length && typeof tokens[i + 1] === 'number') {
                    const rx = tokens[++i]
                    const ry = tokens[++i]
                    const xAxisRotation = tokens[++i]
                    const largeArcFlag = tokens[++i]
                    const sweepFlag = tokens[++i]
                    let nx = tokens[++i]
                    let ny = tokens[++i]

                    if (isRelative) {
                        nx += x
                        ny += y
                    }

                    setLastOutHandle(x, y)
                    result.push(createPoint('A', nx, ny, { x: x, y: y }))

                    x = nx
                    y = ny
                    lastControlX = x
                    lastControlY = y
                }
                break
            }

            case 'Z': {
                // Close path
                setLastOutHandle(x, y)
                result.push(createPoint('Z', startX, startY, { x: startX, y: startY }))
                x = startX
                y = startY
                break
            }
        }
        i++
    }

    return result
}

export default parsePathData