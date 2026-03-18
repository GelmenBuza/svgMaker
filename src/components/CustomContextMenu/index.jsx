import style from './style.module.css'
import {useEffect, useMemo, useRef, useState} from "react";
import {elementsStore} from "../../stores/elementsStore.jsx";
import parsePathData from "../../utils/parsePathData.js";


export default function CustomContextMenu({menuRef, menu}) {
    const {elements, customizableElementId} = elementsStore();

    const currentEl = useMemo(() =>
            elements.find(elem => elem.id === customizableElementId),
        [elements, customizableElementId]
    )

    console.log(menu.id)

    const vertexIndex = +menu.id.split('-').at(-1)


    const dotsArr = parsePathData(currentEl.d)

    let counter = 0
    let dotCommand = null
    for (const obj of dotsArr) {
        if (obj.command.toUpperCase() === 'Z') continue;
        for (let i = 0; i < obj.params.length; i += 2) {
            if (vertexIndex === counter) {
                console.log(vertexIndex, counter, i, obj)
                counter++
                dotCommand = obj.command
                break
            }
            console.log(i)
            counter++
        }
    }

    return (
        <div
            ref={menuRef}
            style={{
                top: menu.y,
                left: menu.x,
            }}
            className={style['menu']}
        >
            <span>Тип точки:{dotCommand}</span>

        </div>
    )
}