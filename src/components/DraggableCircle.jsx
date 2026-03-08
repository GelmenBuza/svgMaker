import {useState} from "react";


export default function DraggableCircle({id, cx, cy, rx, ry, fill, stroke, onDrag, onDragEnd}) {
    const [isDragging, setIsDragging] = useState(false)
    const [startPos, setStartPos] = useState({cx: 0, cy: 0})
    const [initialPos, setInitialPos] = useState({cx, cy})

    const handlePointerDown = (e) => {
        e.preventDefault()
        e.stopPropagation()

        setIsDragging(true)
        setStartPos({cx: e.clientX, cy: e.clientY})
        setInitialPos({cx, cy})

        e.currentTarget.setPointerCapture?.(e.pointerId)
    }

    const handlePointerMove = (e) => {
        if (!isDragging) return

        const svg = e.currentTarget.ownerSVGElement;
        if (svg) {
            const ctm = svg.getScreenCTM()
            if (ctm) {
                const deltaX = (e.clientX - startPos.cx) / ctm.a
                const deltaY = (e.clientY - startPos.cy) / ctm.d

                onDrag?.(id, {cx: initialPos.cx + deltaX, cy: initialPos.cy + deltaY})
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
        <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry ? ry : rx}
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