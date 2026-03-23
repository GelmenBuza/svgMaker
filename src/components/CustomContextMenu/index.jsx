import style from './style.module.css'
import {useEffect, useMemo, useRef, useState} from "react";
import {elementsStore} from "../../stores/elementsStore.jsx";
import parsePathData from "../../utils/parsePathData.js";


const getCurrentCommand = (index, dotsArr) => {
    let dotCommand = null
    let counter = 0
    for (const obj of dotsArr) {
        if (obj.command.toUpperCase() === 'Z') continue;
        if (counter === index) {
            dotCommand = obj.command
        }
        counter++
    }
    return dotCommand
}

export default function CustomContextMenu({menuRef, menu}) {
    const {elements, customizableElementId} = elementsStore();

    const currentEl = useMemo(() =>
            elements.find(elem => elem.id === customizableElementId),
        [elements, customizableElementId]
    )

    const vertexIndex = +menu.id.split('-').at(-1)

    const dotsArr = parsePathData(currentEl.d)

    const currentCommand = getCurrentCommand(vertexIndex, dotsArr)


    return (
        <div
            ref={menuRef}
            style={{
                top: menu.y,
                left: menu.x,
            }}
            className={style['menu']}
        >
            <span>Тип точки:{currentCommand}</span>

        </div>
    )
}