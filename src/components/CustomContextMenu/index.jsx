import style from './style.module.css'
import {useMemo, useState} from "react";
import {elementsStore} from "../../stores/elementsStore.jsx";

const getCurrentType = (index, dotsArr) => {
    let dotType = null
    let counter = 0
    for (const obj of dotsArr) {
        if (obj.command.toUpperCase() === 'Z') continue;
        if (counter === index) {
            dotType = obj.type
        }
        counter++
    }
    return dotType
}

const getSVGPoint = (svg, clientX, clientY) => {
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    return pt.matrixTransform(svg.getScreenCTM().inverse());
}

const distanceToSegment = (px, py, x1, y1, x2, y2) => {
    const A = px - x1
    const B = py - y1
    const C = x2 - x1
    const D = y2 - y1

    const dot = A * C + B * D
    const lenSq = C * C + D * D
    let param = -1

    if (lenSq !== 0) param = dot / lenSq

    let xx, yy

    if (param < 0) {
        xx = x1
        yy = y1
    } else if (param > 1) {
        xx = x2
        yy = y2
    } else {
        xx = x1 + param * C
        yy = y1 + param * D
    }

    const dx = px - xx
    const dy = py - yy
    return Math.sqrt(dx * dx + dy * dy)
}

const addNewVertex = (e, menu, currentEl, update) => {
    e.preventDefault()
    const pt = getSVGPoint(menu.svg, menu.x, menu.y)
    const { points } = currentEl
    let minDistance = Infinity
    let insertIndex = 1

    for (let i = 0; i < points.length - 1; i++) {
        if (points[i].command === 'Z' || points[i + 1]?.command === 'Z') continue

        const p1 = points[i]
        const p2 = points[i + 1]
        const distance = distanceToSegment(pt.x, pt.y, p1.x, p1.y, p2.x, p2.y)

        if (distance < minDistance) {
            minDistance = distance
            insertIndex = i + 1
        }
    }

    const newPoint = {
        command: 'c',
        x: pt.x,
        y: pt.y,
        type: 'cusp',
        in: { x: pt.x , y: pt.y },
        out: { x: pt.x, y: pt.y }
    }

    points.splice(insertIndex, 0, newPoint)

    update(currentEl.id, {points})
}


const changeType = (id, index, dotsArr, e, setType, update) => {
    const value = e.target.value
    if ((dotsArr[0].x === dotsArr[index].x) && (dotsArr[0].y === dotsArr[index].y)) {
        switch (value) {
            case 'line':
                dotsArr[index] = {
                    ...dotsArr[index],
                    in: {x: dotsArr[index].x, y: dotsArr[index].y},
                    out: {x: dotsArr[index].x, y: dotsArr[index].y}
                }
                dotsArr[0] = {
                    ...dotsArr[0],
                    out: {x: dotsArr[0].x, y: dotsArr[0].y},
                }
                break
            case 'cusp':
                dotsArr[index] = {
                    ...dotsArr[index],
                    in: {x: dotsArr[index].x - 20, y: dotsArr[index].y + 20},
                    out: {x: dotsArr[index].x + 20, y: dotsArr[index].y - 10}
                }
                dotsArr[0] = {
                    ...dotsArr[0],
                    out: {x: dotsArr[0].x + 20, y: dotsArr[0].y - 10},
                }
                break
            case 'smooth':
                dotsArr[index] = {
                    ...dotsArr[index],
                    in: {x: dotsArr[index].x - 15, y: dotsArr[index].y + 15},
                    out: {x: dotsArr[index].x + 10, y: dotsArr[index].y - 10}
                }
                dotsArr[0] = {
                    ...dotsArr[0],
                    out: {x: dotsArr[0].x + 10, y: dotsArr[0].y - 10},
                }
                break
            case 'symmetric':
                dotsArr[index] = {
                    ...dotsArr[index],
                    in: {x: dotsArr[index].x - 10, y: dotsArr[index].y + 10},
                    out: {x: dotsArr[index].x + 10, y: dotsArr[index].y - 10}
                }
                dotsArr[0] = {
                    ...dotsArr[0],
                    out: {x: dotsArr[0].x + 10, y: dotsArr[0].y - 10},
                }
                break
        }
    }
    switch (value) {
        case 'line':
            dotsArr[index] = {
                ...dotsArr[index],
                in: {x: dotsArr[index].x, y: dotsArr[index].y},
                out: {x: dotsArr[index].x, y: dotsArr[index].y}
            }
            break
        case 'cusp':
            dotsArr[index] = {
                ...dotsArr[index],
                in: {x: dotsArr[index].x - 20, y: dotsArr[index].y + 20},
                out: {x: dotsArr[index].x + 20, y: dotsArr[index].y - 10}
            }
            break
        case 'smooth':
            dotsArr[index] = {
                ...dotsArr[index],
                in: {x: dotsArr[index].x - 15, y: dotsArr[index].y + 15},
                out: {x: dotsArr[index].x + 10, y: dotsArr[index].y - 10}
            }
            break
        case 'symmetric':
            dotsArr[index] = {
                ...dotsArr[index],
                in: {x: dotsArr[index].x - 10, y: dotsArr[index].y + 10},
                out: {x: dotsArr[index].x + 10, y: dotsArr[index].y - 10}
            }
            break
    }
    dotsArr[index].type = value
    update(id, {points: dotsArr})
    setType(value)
}

export default function CustomContextMenu({data}) {
    const {elements, updateElements} = elementsStore();
    const {menuRef, menu} = data
    const currentEl = useMemo(() =>
            elements.find(elem => elem.id === menu.id),
        [elements, menu]
    )
    const menuType = menu.id.includes('vertex') ? 'vertex' : 'element'
    if (menuType === 'vertex') {

        const vertexIndex = +menu.id.split('-').at(-1)

        const [type, setType] = useState(getCurrentType(vertexIndex, currentEl.points))

        return (
            <div
                ref={menuRef}
                style={{
                    top: menu.y,
                    left: menu.x,
                }}
                className={style['menu']}
            >
                <span>Тип точки:{type}</span>
                <label htmlFor="">
                    {type === 'line' ?
                        <input type="radio" name='angleType' value={'line'} checked/> :
                        <input type="radio" name='angleType' value={'line'}
                               onChange={(e) => changeType(currentEl.id, vertexIndex, currentEl.points, e, setType, updateElements)}/>
                    }
                    line
                </label>
                <label htmlFor="">
                    {type === 'cusp' ?
                        <input type="radio" name='angleType' value={'cusp'} checked/> :
                        <input type="radio" name='angleType' value={'cusp'}
                               onChange={(e) => changeType(currentEl.id, vertexIndex, currentEl.points, e, setType, updateElements)}/>
                    }
                    cusp
                </label>
                <label htmlFor="">
                    {type === 'smooth' ?
                        <input type="radio" name='angleType' value={'smooth'} checked/> :
                        <input type="radio" name='angleType' value={'smooth'}
                               onChange={(e) => changeType(currentEl.id, vertexIndex, currentEl.points, e, setType, updateElements)}/>
                    }
                    smooth
                </label>
                <label htmlFor="">
                    {type === 'symmetric' ?
                        <input type="radio" name='angleType' value={'symmetric'} checked/> :
                        <input type="radio" name='angleType' value={'symmetric'}
                               onChange={(e) => changeType(currentEl.id, vertexIndex, currentEl.points, e, setType, updateElements)}/>
                    }
                    symmetric
                </label>
            </div>
        )
    } else if (menuType === 'element') {
        return (
            <div
                ref={menuRef}
                style={{
                    top: menu.y,
                    left: menu.x,
                }}
                className={style['menu']}
            >
                <label htmlFor="">
                    <button onClick={(e) => addNewVertex(e, menu, currentEl, updateElements)}>Добавить узел</button>
                </label>
            </div>
        )
    } else return null

}
