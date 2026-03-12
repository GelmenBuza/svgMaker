import {useRef, useState} from "react";
import {elementsStore} from "../stores/elementsStore.jsx";


export default function DraggableLine({
                                          id,
                                          x1,
                                          y1,
                                          x2,
                                          y2,
                                          stroke,
                                          strokeWidth,
                                          rotate,
                                          openSettings,
                                          onDrag,
                                          onDragEnd
                                      }) {
    const [isDragging, setIsDragging] = useState(false)
    const [startPos, setStartPos] = useState({x1: 0, y1: 0})
    const initialPosRef = useRef({x1, y1, x2, y2})
    const svgRef = useRef(null)
    const {areaWidth, isSelected, toggleSelected} = elementsStore()

    const handlePointerDown = (e) => {
        e.preventDefault()
        e.stopPropagation()

        setIsDragging(true)
        setStartPos({x1: e.clientX, y1: e.clientY})
        initialPosRef.current = {x1, y1, x2, y2}
        svgRef.current = e.currentTarget.ownerSVGElement

        e.currentTarget.setPointerCapture?.(e.pointerId)
    }

    const handlePointerMove = (e) => {
        if (!isDragging) return

        const ctm = svgRef.current.getScreenCTM()
        if (ctm) {
            const deltaX = (e.clientX - startPos.x1) / ctm.a
            const deltaY = (e.clientY - startPos.y1) / ctm.d

            if (((initialPosRef.current.x1 + deltaX < 0) || (initialPosRef.current.x2 + deltaX < 0) ||
                    (initialPosRef.current.y1 + deltaY < 0) || (initialPosRef.current.y2 + deltaY < 0)) ||
                ((initialPosRef.current.x1 + deltaX >= areaWidth) || (initialPosRef.current.x2 + deltaX >= areaWidth) ||
                    (initialPosRef.current.y1 + deltaY >= areaWidth) || (initialPosRef.current.y2 + deltaY >= areaWidth))) {
                return;
            }

            onDrag?.(id, {
                x1: initialPosRef.current.x1 + deltaX,
                y1: initialPosRef.current.y1 + deltaY,
                x2: initialPosRef.current.x2 + deltaX,
                y2: initialPosRef.current.y2 + deltaY
            })
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

    return (<line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={stroke}
        strokeWidth={strokeWidth}

        transform={rotation ? `rotate(${rotation} ${x1} ${y1})` : undefined}


        onDoubleClick={() => {
            openSettings(id)
        }}

        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
            cursor: isDragging ? 'grabbing' : 'grab', pointerEvents: 'all',
        }}
    />)
}