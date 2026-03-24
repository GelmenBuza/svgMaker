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
            dotCommand = obj.command
            dotType = obj.type
        }
        counter++
    }
    return dotType
}

const changeType = (index, dotsArr, value, setType) => {
    console.log(index, dotsArr, value)
    dotsArr[index].type = value
    setType(value)
    console.log(index, dotsArr, value)
}

export default function CustomContextMenu({menuRef, menu}) {
    const {elements, customizableElementId} = elementsStore();
    const currentEl = useMemo(() =>
            elements.find(elem => elem.id === customizableElementId),
        [elements, customizableElementId]
    )
    const vertexIndex = +menu.id.split('-').at(-1)
    const dotsArrRef = useRef(() => parsePathData(currentEl.d))
    const [type, setType] = useState(getCurrentType(vertexIndex, dotsArrRef.current()))






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
                           onChange={(e) => changeType(vertexIndex, dotsArrRef.current(), e.target.value, setType)}/>
                }
                line
            </label>
            <label htmlFor="">
                {type === 'cusp' ?
                    <input type="radio" name='angleType' value={'cusp'} checked/> :
                    <input type="radio" name='angleType' value={'cusp'}
                           onChange={(e) => changeType(vertexIndex, dotsArrRef.current(), e.target.value, setType)}/>
                }
                cusp
            </label>
            <label htmlFor="">
                {type === 'smooth' ?
                    <input type="radio" name='angleType' value={'smooth'} checked/> :
                    <input type="radio" name='angleType' value={'smooth'}
                           onChange={(e) => changeType(vertexIndex, dotsArrRef.current(), e.target.value, setType)}/>
                }
                smooth
            </label>
            <label htmlFor="">
                {type === 'symmetric' ?
                    <input type="radio" name='angleType' value={'symmetric'} checked/> :
                    <input type="radio" name='angleType' value={'symmetric'}
                           onChange={(e) => changeType(vertexIndex, dotsArrRef.current(), e.target.value, setType)}/>
                }
                symmetric
            </label>
        </div>
    )
}
