import {useMemo, useRef, useState} from "react";
import {elementsStore} from "../stores/elementsStore.jsx";
import parsePathData from "../utils/parsePathData.js";


export default function DraggableDots({
                                          id,

                                          onDrag,
                                          onDragEnd
                                      }) {
    const {elements} = elementsStore()

    const customEll = useMemo(() =>
            elements.find(elem => elem.id === id),
        [elements, id]
    )

    if (!customEll) return null;

    /* const [isDragging, setIsDragging] = useState(false)
    const [startPos, setStartPos] = useState({cx: 0, cy: 0})
    const initialPosRef = useRef({cx, cy})
    const svgRef = useRef(null)


    const handlePointerDown = (e) => {
        e.preventDefault()
        e.stopPropagation()

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

            if ((initialPosRef.current.cx + deltaX <= 0 || initialPosRef.current.cy + deltaY <= 0) || (initialPosRef.current.cx + deltaX >= areaWidth - ry || initialPosRef.current.cy + deltaY >= areaWidth - rx)) {
                return;
            }

            onDrag?.(id, {cx: initialPosRef.current.cx + deltaX, cy: initialPosRef.current.cy + deltaY})
        }
    }

    const handlePointerUp = (e) => {
        if (isDragging) {
            setIsDragging(false)
            onDragEnd?.(id)
            e.currentTarget.releasePointerCapture?.(e.pointerId)
        }
    }

    const rotation = rotate || 0;
    */

    const dots = parsePathData(customEll.d)
    const normalizedDots = []
    for (const obj of dots) {
        if (obj.command.toUpperCase() === 'Z') continue;

        for (let i = 0; i < obj.params.length; i += 2) {
            normalizedDots.push([obj.params[i], obj.params[i + 1]])
        }

    }
    console.log(normalizedDots)


    return normalizedDots.map((vertex, index) => (
        <ellipse
            key={`${id}-vertex-${index}`}
            id={`${id}-vertex-${index}`}
            cx={vertex[0]}
            cy={vertex[1]}
            rx={5}
            ry={5}
            fill={'rgba(118,118,118,0.4)'}
            stroke={'transparent'}
            strokeWidth={0}


            // onPointerDown={handlePointerDown}
            // onPointerMove={handlePointerMove}
            // onPointerUp={handlePointerUp}
            // onPointerLeave={handlePointerUp}
            // style={{
            //     cursor: isDragging ? 'grabbing' : 'grab',
            //     pointerEvents: 'all',
            // }}
        />
    ))
}