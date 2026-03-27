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

const addNewVertex = (e, menu, currentEl) => {
    e.preventDefault()
    const svg = menu.svg
    const pt = getSVGPoint(svg, menu.x, menu.y)
    const {id, points} = currentEl
    console.log('Все точки: ',points)
    let pointPrev = points[0]
    let pointNext = points[1]
    for (let i = 2; i < points.length; i++) {
        if (pointPrev.x < points[i].x && points[i].x < pt.x) {
            pointPrev = points[i]
            console.log(points[i], pt)
            if (pointNext.x > points[i].x && pointNext > pt.x) {

            }
        }
    }
}


const changeType = (id, index, dotsArr, e, setType, update) => {
    const value = e.target.value
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
    const {elements, customizableElementId, updateElements} = elementsStore();
    const currentEl = useMemo(() =>
            elements.find(elem => elem.id === customizableElementId),
        [elements, customizableElementId]
    )
    const {menuRef, menu} = data
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
                    <button onClick={(e) => addNewVertex(e, menu, currentEl)}>Добавить узел</button>
                </label>
            </div>
        )
    }

}
