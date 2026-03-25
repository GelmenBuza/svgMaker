import style from './style.module.css'
import {useMemo,useState} from "react";
import {elementsStore} from "../../stores/elementsStore.jsx";

const getCurrentType = (index, dotsArr) => {
    console.log(dotsArr)
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
        case 'smooth':
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

export default function CustomContextMenu({menuRef, menu}) {
    const {elements, customizableElementId, updateElements} = elementsStore();
    const currentEl = useMemo(() =>
            elements.find(elem => elem.id === customizableElementId),
        [elements, customizableElementId]
    )
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
}
