import style from './style.module.css'
import {useEffect, useMemo, useRef, useState} from "react";
import {elementsStore} from "../../stores/elementsStore.jsx";
import parsePathData from "../../utils/parsePathData.js";


const getCurrentType = (index, dotsArr) => {
    let dotCommand = null
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

const changeType = (index, dotsArr, e, setType, update) => {
    const value = e.target.value
    switch (value) {
        case 'line':
            dotsArr[index] = {...dotsArr[index], in: {x: dotsArr[index].x, y: dotsArr[index].y}}
            break
        case 'cusp':
            dotsArr[index] = {...dotsArr[index], in: {x: dotsArr[index].x + dotsArr[index].x*0.05, y: dotsArr[index].y + dotsArr[index].y*0.05}}
            break
        case 'smooth':
            dotsArr[index] = {...dotsArr[index], in: {x: dotsArr[index].x + dotsArr[index].x*0.05, y: dotsArr[index].y + dotsArr[index].y*0.05}}
            break
        case 'symmetric':
            dotsArr[index] = {...dotsArr[index], in: {x: dotsArr[index].x + dotsArr[index].x*0.05, y: dotsArr[index].y + dotsArr[index].y*0.05}}
    }
    dotsArr[index].type = value
    update(dotsArr)
    setType(value)
    console.log(index, dotsArr[index], value)
}

export default function CustomContextMenu({menuRef, menu}) {
    const {elements, customizableElementId, updateElements} = elementsStore();
    const currentEl = useMemo(() =>
            elements.find(elem => elem.id === customizableElementId),
        [elements, customizableElementId]
    )
    const vertexIndex = +menu.id.split('-').at(-1)
    const dotsArrRef = useRef(elements.points)

    console.log(elements)
    const [type, setType] = useState(getCurrentType(vertexIndex, dotsArrRef.current))






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
                           onChange={(e) => changeType(vertexIndex, dotsArrRef.current(), e, setType, updateElements)}/>
                }
                line
            </label>
            <label htmlFor="">
                {type === 'cusp' ?
                    <input type="radio" name='angleType' value={'cusp'} checked/> :
                    <input type="radio" name='angleType' value={'cusp'}
                           onChange={(e) => changeType(vertexIndex, dotsArrRef.current(), e, setType, updateElements)}/>
                }
                cusp
            </label>
            <label htmlFor="">
                {type === 'smooth' ?
                    <input type="radio" name='angleType' value={'smooth'} checked/> :
                    <input type="radio" name='angleType' value={'smooth'}
                           onChange={(e) => changeType(vertexIndex, dotsArrRef.current(), e, setType, updateElements)}/>
                }
                smooth
            </label>
            <label htmlFor="">
                {type === 'symmetric' ?
                    <input type="radio" name='angleType' value={'symmetric'} checked/> :
                    <input type="radio" name='angleType' value={'symmetric'}
                           onChange={(e) => changeType(vertexIndex, dotsArrRef.current(), e, setType, updateElements)}/>
                }
                symmetric
            </label>
        </div>
    )
}
