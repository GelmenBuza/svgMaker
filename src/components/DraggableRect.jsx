import {useState} from "react";


export default function DraggableRect({id, x, y, rx, ry, width, height, fill, stroke, onDrag, onDragEnd}) {
    const [isDragging, setIsDragging] = useState(false)
    const [startPos, setStartPos] = useState({x: 0, y: 0})
    const [initialPos, setInitialPos] = useState({x, y})

    const handlePointerDown = (e) => {
        e.preventDefault()
        e.stopPropagation()

        setIsDragging(true)
        setStartPos({x: e.clientX, y: e.clientY})
        setInitialPos({x, y})

        e.currentTarget.setPointerCapture?.(e.pointerId)
    }

    const handlePointerMove = (e) => {
        if (!isDragging) return

        const svg = e.currentTarget.ownerSVGElement;
        if (svg) {
            const ctm = svg.getScreenCTM()
            if (ctm) {
                const deltaX = (e.clientX - startPos.x) / ctm.a
                const deltaY = (e.clientY - startPos.y) / ctm.d

                onDrag?.(id, {x: initialPos.x + deltaX, y: initialPos.y + deltaY})
            }
        }
    }

    const handlePointerUp = (e) => {
        if (isDragging) {
            setIsDragging(false)
            onDragEnd?.(id)
            e.currentTarget.releasePointerCapture?.(e.pointerId)
        }
    }

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
            strokeWidth={1}

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