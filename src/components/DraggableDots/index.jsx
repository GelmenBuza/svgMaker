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
    const dotsArr = useMemo(() => parsePathData(customEll.d), [customEll])

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

            if (e.target.id.includes('vertex')) {
                const movedVertex = +e.target.id.split('-').at(-1)
                let counter = 0;


                for (const obj of dotsArr) {
                    if (obj.command.toUpperCase() === 'Z') {
                        counter++;
                        continue;
                    }
                    if (movedVertex === dotsArr.length - 2 && (dotsArr[0].x === dotsArr.at(-1).x && dotsArr[0].y === dotsArr.at(-1).y)) {
                        dotsArr[0].x = initialPosRef.current.cx + deltaX
                        dotsArr[0].y = initialPosRef.current.cy + deltaY
                        dotsArr[dotsArr.length - 1].x = initialPosRef.current.cx + deltaX
                        dotsArr[dotsArr.length - 1].y = initialPosRef.current.cy + deltaY
                        dotsArr[dotsArr.length - 2].x = initialPosRef.current.cx + deltaX
                        dotsArr[dotsArr.length - 2].y = initialPosRef.current.cy + deltaY
                        counter++
                        continue
                    }
                    if (counter === movedVertex) {
                        obj.x = initialPosRef.current.cx + deltaX
                        obj.y = initialPosRef.current.cy + deltaY
                        if (obj.type === 'line') {
                            if (obj.in) {
                                obj.in.x = initialPosRef.current.cx + deltaX
                                obj.in.y = initialPosRef.current.cy + deltaY
                            }
                            if (obj.out) {
                                obj.out.x = initialPosRef.current.cx + deltaX
                                obj.out.y = initialPosRef.current.cy + deltaY
                            }
                        }
                    }
                    counter++
                }
            } else {
                const splitId = e.target.id.split('-')
                const guideLineIndex = +splitId.at(-1)
                const type = splitId.at(-2)

                const targetDotIndex = guideLinesArr[guideLineIndex]?.at(-1)

                if (targetDotIndex !== undefined) {
                    const obj = dotsArr[targetDotIndex]
                    if (type === 'in' && obj.in) {
                        obj.in.x = initialPosRef.current.cx + deltaX
                        obj.in.y = initialPosRef.current.cy + deltaY
                    }
                    if (type === 'out' && obj.out) {
                        obj.out.x = initialPosRef.current.cx + deltaX
                        obj.out.y = initialPosRef.current.cy + deltaY
                    }
                }
            }
            onDrag?.(id, {points: dotsArr})
        }
    }

    const handlePointerUp = (e) => {
        if (isDragging) {
            setIsDragging(false)
            onDragEnd?.(id)
            e.currentTarget.releasePointerCapture?.(e.pointerId)
        }
    }

    const vertexArr = []
    const guideLinesArr = []
    let dotsIndex = 0
    const lastIndex = dotsArr.filter(obj => obj.command.toUpperCase() !== 'Z').length - 1
    for (const obj of dotsArr) {
        if (obj.command.toUpperCase() === 'Z') {
            dotsIndex++
            continue
        }
        const vType = obj.type
        vertexArr.push([obj.x, obj.y])
        if (obj.out && dotsIndex !== lastIndex) {
            guideLinesArr.push([obj.out.x, obj.out.y, 'out', vType, dotsIndex])
        }
        if (obj.in) {
            guideLinesArr.push([obj.in.x, obj.in.y, 'in', vType, dotsIndex])
        }
        dotsIndex++
    }

    return (
        <>
            {vertexArr.map((vertex, index) => {
                    return (
                        <ellipse
                            key={`${id}-vertex-${index}`}
                            id={`${id}-vertex-${index}`}
                            className={style.DraggableDot}
                            cx={vertex[0]}
                            cy={vertex[1]}
                            rx={5}
                            ry={5}
                            fill={index === 0 ? 'red' : index === vertexArr.length - 1 ? 'green' : 'currentColor'}
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
            )}
            {guideLinesArr.map((dot, index) => {
                if (dot.at(-2) !== 'line') {
                    return (
                        <ellipse
                            key={`${id}-vNum=${dot.at(-1)}-guideLine-${dot[2]}-${index}`}
                            id={`${id}-vNum=${dot.at(-1)}-guideLine-${dot[2]}-${index}`}
                            className={style.DraggableDot}
                            cx={dot[0]}
                            cy={dot[1]}
                            rx={5}
                            ry={5}
                            fill={'brown'}
                            stroke={'transparent'}
                            strokeWidth={0}


                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerUp}
                            onContextMenu={(e) => e.preventDefault()}
                        />
                    )
                }
            })

            }

        </>
    )
}