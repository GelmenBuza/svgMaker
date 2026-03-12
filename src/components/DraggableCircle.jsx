import {useRef, useState} from "react";
import {elementsStore} from "../stores/elementsStore.jsx";


export default function DraggableCircle({
                                            id,
                                            cx,
                                            cy,
                                            rx,
                                            ry,
                                            fill,
                                            stroke,
                                            strokeWidth,
                                            rotate,
                                            openSettings,
                                            onDrag,
                                            onDragEnd
                                        }) {
    const [isDragging, setIsDragging] = useState(false)
    const [startPos, setStartPos] = useState({cx: 0, cy: 0})
    const initialPosRef = useRef({cx, cy})
    const svgRef = useRef(null)
    const {areaWidth, isSelected, toggleSelected} = elementsStore()


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

    return (
        <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry ? ry : rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}

            onDoubleClick={() => {
                openSettings(id)
            }}

            transform={rotation ? `rotate(${rotation} ${cx} ${cy})` : undefined}

            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{
                cursor: isDragging ? 'grabbing' : 'grab',
                pointerEvents: 'all',
            }}
        />
    )
}