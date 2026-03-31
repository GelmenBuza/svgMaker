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
    let x = 0, y = 0
    let startX = 0, startY = 0
    let lastControlX = 0, lastControlY = 0

    const round = (v) => Math.round(v * 1000) / 1000

    // === 🔧 Исправленная: Определение типа узла с защитой от null ===
    const detectNodeType = (anchor, inH, outH) => {
        // 🛡️ Защита: если ручки null, считаем их равными якорю
        const hIn = inH || { ...anchor }
        const hOut = outH || { ...anchor }

        // Если обе ручки схлопнуты в узел → линия
        if (
            Math.abs(hIn.x - anchor.x) < 0.001 && Math.abs(hIn.y - anchor.y) < 0.001 &&
            Math.abs(hOut.x - anchor.x) < 0.001 && Math.abs(hOut.y - anchor.y) < 0.001
        ) {
            return 'line'
        }

        // Векторы от узла к ручкам
        const vIn = { x: hIn.x - anchor.x, y: hIn.y - anchor.y }
        const vOut = { x: hOut.x - anchor.x, y: hOut.y - anchor.y }

        // Длина векторов
        const lenIn = Math.sqrt(vIn.x ** 2 + vIn.y ** 2)
        const lenOut = Math.sqrt(vOut.x ** 2 + vOut.y ** 2)

        // Если одна из ручек нулевая → угол (cusp)
        if (lenIn < 0.001 || lenOut < 0.001) {
            return 'cusp'
        }

        // Проверка на коллинеарность (угол ~180°)
        const dot = vIn.x * vOut.x + vIn.y * vOut.y
        const cosAngle = dot / (lenIn * lenOut)
        const isCollinear = Math.abs(cosAngle + 1) < 0.01

        if (isCollinear) {
            const lenDiff = Math.abs(lenIn - lenOut)
            return lenDiff < 0.01 ? 'symmetric' : 'smooth'
        }

        return 'cusp'
    }

    // === Создание узла ===
    const createNode = (command, px, py, inHandle, outHandle) => {
        const anchor = { x: round(px), y: round(py) }
        const hIn = inHandle ? { x: round(inHandle.x), y: round(inHandle.y) } : null
        const hOut = outHandle ? { x: round(outHandle.x), y: round(outHandle.y) } : null

        return {
            command,
            x: anchor.x,
            y: anchor.y,
            in: hIn,
            out: hOut,
            type: detectNodeType(anchor, hIn, hOut)
        }
    }

    // === Установка outHandle для предыдущего узла ===
    const setPrevOutHandle = (hx, hy) => {
        if (result.length > 0) {
            const last = result[result.length - 1]
            last.out = { x: round(hx), y: round(hy) }
            // 🛡️ Пересчитываем тип, detectNodeType теперь безопасен
            last.type = detectNodeType({ x: last.x, y: last.y }, last.in, last.out)
        }
    }

    // === 2. Парсинг команд ===
    while (i < tokens.length) {
        const token = tokens[i]
        if (typeof token !== 'string') { i++; continue }

        const cmd = token
        const cmdUpper = cmd.toUpperCase()
        const isRelative = cmd === cmd.toLowerCase()

        switch (cmdUpper) {
            case 'M': {
                let nx = tokens[++i], ny = tokens[++i]
                if (nx === undefined || ny === undefined) break
                if (isRelative) { nx += x; ny += y }

                // Первый узел: in = null (нет предыдущего сегмента)
                result.push({
                    command: 'M',
                    x: round(nx), y: round(ny),
                    in: null,
                    out: { x: round(nx), y: round(ny) },
                    type: 'line'
                })

                startX = nx; startY = ny; x = nx; y = ny
                lastControlX = x; lastControlY = y

                while (i + 1 < tokens.length && typeof tokens[i + 1] === 'number') i += 2
                break
            }

            case 'L':
            case 'H':
            case 'V': {
                while (i + 1 < tokens.length && typeof tokens[i + 1] === 'number') {
                    let nx = x, ny = y
                    if (cmdUpper === 'L') {
                        nx = tokens[++i]; ny = tokens[++i]
                    } else if (cmdUpper === 'H') {
                        nx = tokens[++i]
                    } else if (cmdUpper === 'V') {
                        ny = tokens[++i]
                    }
                    if (isRelative) {
                        if (cmdUpper === 'H') nx += x
                        else if (cmdUpper === 'V') ny += y
                        else { nx += x; ny += y }
                    }

                    setPrevOutHandle(x, y)
                    result.push(createNode('L', nx, ny, { x: nx, y: ny }, { x: nx, y: ny }))

                    x = nx; y = ny
                    lastControlX = x; lastControlY = y
                }
                break
            }

            case 'C': {
                while (i + 5 < tokens.length && typeof tokens[i + 1] === 'number') {
                    let x1 = tokens[++i], y1 = tokens[++i]
                    let x2 = tokens[++i], y2 = tokens[++i]
                    let nx = tokens[++i], ny = tokens[++i]

                    if (isRelative) {
                        x1 += x; y1 += y; x2 += x; y2 += y; nx += x; ny += y
                    }

                    setPrevOutHandle(x1, y1)
                    result.push(createNode('C', nx, ny, { x: x2, y: y2 }, null))

                    lastControlX = x2; lastControlY = y2
                    x = nx; y = ny
                }
                break
            }

            case 'S': {
                while (i + 3 < tokens.length && typeof tokens[i + 1] === 'number') {
                    let x1, y1
                    const last = result[result.length - 1]
                    if (last && (last.command === 'C' || last.command === 'S')) {
                        x1 = x * 2 - lastControlX
                        y1 = y * 2 - lastControlY
                    } else {
                        x1 = x; y1 = y
                    }

                    let x2 = tokens[++i], y2 = tokens[++i]
                    let nx = tokens[++i], ny = tokens[++i]
                    if (isRelative) { x2 += x; y2 += y; nx += x; ny += y }

                    setPrevOutHandle(x1, y1)
                    result.push(createNode('S', nx, ny, { x: x2, y: y2 }, null))

                    lastControlX = x2; lastControlY = y2
                    x = nx; y = ny
                }
                break
            }

            case 'Q': {
                while (i + 3 < tokens.length && typeof tokens[i + 1] === 'number') {
                    let qx = tokens[++i], qy = tokens[++i]
                    let nx = tokens[++i], ny = tokens[++i]
                    if (isRelative) { qx += x; qy += y; nx += x; ny += y }

                    const outX = x + (qx - x) * 2/3
                    const outY = y + (qy - y) * 2/3
                    const inX = nx + (qx - nx) * 2/3
                    const inY = ny + (qy - ny) * 2/3

                    setPrevOutHandle(outX, outY)
                    result.push(createNode('Q', nx, ny, { x: inX, y: inY }, null))

                    lastControlX = qx; lastControlY = qy
                    x = nx; y = ny
                }
                break
            }

            case 'T': {
                while (i + 1 < tokens.length && typeof tokens[i + 1] === 'number') {
                    let qx, qy
                    const last = result[result.length - 1]
                    if (last && (last.command === 'Q' || last.command === 'T')) {
                        qx = x * 2 - lastControlX
                        qy = y * 2 - lastControlY
                    } else { qx = x; qy = y }

                    let nx = tokens[++i], ny = tokens[++i]
                    if (isRelative) { nx += x; ny += y }

                    const outX = x + (qx - x) * 2/3
                    const outY = y + (qy - y) * 2/3
                    const inX = nx + (qx - nx) * 2/3
                    const inY = ny + (qy - ny) * 2/3

                    setPrevOutHandle(outX, outY)
                    result.push(createNode('T', nx, ny, { x: inX, y: inY }, null))

                    lastControlX = qx; lastControlY = qy
                    x = nx; y = ny
                }
                break
            }

            // case 'A': {
            //     while (i + 6 < tokens.length && typeof tokens[i + 1] === 'number') {
            //         const rx = tokens[++i], ry = tokens[++i]
            //         const xAxisRotation = tokens[++i]
            //         const largeArcFlag = tokens[++i]
            //         const sweepFlag = tokens[++i]
            //         let nx = tokens[++i], ny = tokens[++i]
            //         if (isRelative) { nx += x; ny += y }
            //
            //         setPrevOutHandle(x, y)
            //         result.push(createNode('A', nx, ny, { x: nx, y: ny }, { x: nx, y: ny }))
            //
            //         x = nx; y = ny
            //         lastControlX = x; lastControlY = y
            //     }
            //     break
            // }

            case 'Z': {
                setPrevOutHandle(x, y)
                result.push(createNode('Z', startX, startY, { x: startX, y: startY }, { x: startX, y: startY }))
                x = startX; y = startY
                break
            }
        }
        i++
    }

    return result
}

export default parsePathData