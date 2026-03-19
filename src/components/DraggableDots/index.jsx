import {useEffect, useMemo, useRef, useState} from "react";
import {elementsStore} from "../../stores/elementsStore.jsx";
import parsePathData from "../../utils/parsePathData.js";
import style from './style.module.css'
import pointsArrToString from "../../utils/pointsArrToString.js";
import CustomContextMenu from "../CustomContextMenu/index.jsx";

export default function DraggableDots({
                                          id,

                                          onDrag,
                                          onDragEnd,
                                          handleContextMenu
                                      }) {
    const {elements} = elementsStore()

    const customEll = useMemo(() =>
            elements.find(elem => elem.id === id),
        [elements, id]
    )

    if (!customEll) return null;

    const [isDragging, setIsDragging] = useState(false)
    const [startPos, setStartPos] = useState({cx: 0, cy: 0})
    const initialPosRef = useRef(null)
    const svgRef = useRef(null)

    const handlePointerDown = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const cx = e.target.cx.baseVal.value
        const cy = e.target.cy.baseVal.value
        setIsDragging(true)
        setStartPos({cx: e.clientX, cy: e.clientY})
        initialPosRef.current = {cx, cy}
        svgRef.current = e.currentTarget.ownerSVGElement

        e.currentTarget.setPointerCapture?.(e.pointerId)
    }

    const handlePointerMove = (e) => {
        if (!isDragging) return

        const ctm = svgRef.current.getScreenCTM()
        if (ctm) {
            const deltaX = (e.clientX - startPos.cx) / ctm.a
            const deltaY = (e.clientY - startPos.cy) / ctm.d
            const dotsArr = parsePathData(customEll.d)

            const movedVertex = +e.target.id.split('-').at(-1)
            let counter = 0;

            let totalCount = 0
            for (const obj of dotsArr) {
                // console.log(obj)
                if (obj.params) {
                    totalCount += obj.params.length
                }
            }

            for (const obj of dotsArr) {
                if (obj.command.toUpperCase() === 'Z') {
                    counter++;
                    continue;
                }
                // console.log('M', dotsArr[0].params[0], dotsArr[0].params[1], '\n', 'last', dotsArr.at(-1).params.at(-2), dotsArr.at(-1).params.at(-1), totalCount/2)
                // console.log(movedVertex)
                if (movedVertex === totalCount/2-1 && (dotsArr[0].params[0] === dotsArr.at(-1).params.at(-2) && dotsArr[0].params[1] === dotsArr.at(-1).params.at(-1))) {
                    dotsArr[0].params[0] = initialPosRef.current.cx + deltaX
                    dotsArr[0].params[1] = initialPosRef.current.cy + deltaY
                    dotsArr[dotsArr.length-1].params[dotsArr[dotsArr.length-1].params.length-2] = initialPosRef.current.cx + deltaX
                    dotsArr.at(dotsArr.length-1).params[dotsArr[dotsArr.length-1].params.length-1] = initialPosRef.current.cy + deltaY
                    counter++
                    continue
                }
                for (let i = 0; i < obj.params.length; i += 2) {
                    if (counter === movedVertex) {
                        obj.params[i] = initialPosRef.current.cx + deltaX
                        obj.params[i + 1] = initialPosRef.current.cy + deltaY
                    }
                    counter++
                }
            }

            onDrag?.(id, {d: pointsArrToString(dotsArr)})
        }
    }

    const handlePointerUp = (e) => {
        if (isDragging) {
            setIsDragging(false)
            onDragEnd?.(id)
            e.currentTarget.releasePointerCapture?.(e.pointerId)
        }
    }


    const dots = parsePathData(customEll.d)
    const normalizedDots = []
    for (const obj of dots) {
        if (obj.command.toUpperCase() === 'Z') continue;


        for (let i = 0; i < obj.params.length; i += 2) {
            normalizedDots.push([obj.params[i], obj.params[i + 1]])
        }
    }
    // console.log(normalizedDots.length)


    return normalizedDots.map((vertex, index) => {
            if (index !== 0) {
                return (
                    <ellipse
                        key={`${id}-vertex-${index}`}
                        id={`${id}-vertex-${index}`}
                        className={style.DraggableDot}
                        cx={vertex[0]}
                        cy={vertex[1]}
                        rx={5}
                        ry={5}
                        fill={index === 0 ? 'red' : index === normalizedDots.length - 1 ? 'green' : 'currentColor'}
                        stroke={'transparent'}
                        strokeWidth={0}


                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        onContextMenu={(e) => handleContextMenu(e)}
                    />
                )

            }
        }
    )
}