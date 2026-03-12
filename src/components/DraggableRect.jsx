import {useRef, useState} from "react";
import {elementsStore} from "../stores/elementsStore.jsx";


export default function DraggableRect({
                                          id,
                                          x,
                                          y,
                                          rx,
                                          ry,
                                          width,
                                          height,
                                          fill,
                                          stroke,
                                          strokeWidth,
                                          rotate,
                                          onDrag,
                                          openSettings,
                                          onDragEnd
                                      }) {
    const [isDragging, setIsDragging] = useState(false)
    const [startPos, setStartPos] = useState({x: 0, y: 0})
    const initialPosRef = useRef({x, y})
    const svgRef = useRef(null)
    const {isSelected, toggleSelected} = elementsStore()

    const handlePointerDown = (e) => {
        e.preventDefault()
        e.stopPropagation()

        setIsDragging(true)
        setStartPos({x: e.clientX, y: e.clientY})
        initialPosRef.current = {x, y}
        svgRef.current = e.currentTarget.ownerSVGElement

        e.currentTarget.setPointerCapture?.(e.pointerId)
    }

    const handlePointerMove = (e) => {
        if (!isDragging || !svgRef.current) return


        const ctm = svgRef.current.getScreenCTM()
        if (ctm) {
            const deltaX = (e.clientX - startPos.x) / ctm.a
            const deltaY = (e.clientY - startPos.y) / ctm.d

            onDrag?.(id, {x: initialPosRef.current.x + deltaX, y: initialPosRef.current.y + deltaY})
        }
    }

    const handlePointerUp = (e) => {
        if (isDragging) {
            setIsDragging(false)
            onDragEnd?.(id)
            e.currentTarget.releasePointerCapture?.(e.pointerId)
        }
    }

    const cx = x + width / 2;
    const cy = y + height / 2;
    const rotation = rotate || 0;

    return (
        <rect
            x={x}
            y={y}
            rx={rx}
            ry={ry}
            width={width}
            height={height}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            scale={2}

            onDoubleClick={() => {
                openSettings(id)
            }}

            transform={rotation ? `rotate(${rotation} ${cx} ${cy})` : undefined}
            // onClick={() => toggleSelected(id)}
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