import {useState} from "react";


export default function DraggableLine({id, x1, y1, x2, y2, stroke, strikeWidth, onDrag, onDragEnd}) {
    const [isDragging, setIsDragging] = useState(false)
    const [startPos, setStartPos] = useState({x1: 0, y1: 0})
    const [initialPos, setInitialPos] = useState({x1, y1, x2, y2})

    const handlePointerDown = (e) => {
        e.preventDefault()
        e.stopPropagation()

        setIsDragging(true)
        setStartPos({x1: e.clientX, y1: e.clientY})
        setInitialPos({x1, y1, x2, y2})

        e.currentTarget.setPointerCapture?.(e.pointerId)
    }

    const handlePointerMove = (e) => {
        if (!isDragging) return

        const svg = e.currentTarget.ownerSVGElement;
        if (svg) {
            const ctm = svg.getScreenCTM()
            if (ctm) {
                const deltaX = (e.clientX - startPos.x1) / ctm.a
                const deltaY = (e.clientY - startPos.y1) / ctm.d

                onDrag?.(id, {
                    x1: initialPos.x1 + deltaX,
                    y1: initialPos.y1 + deltaY,
                    x2: initialPos.x2 + deltaX,
                    y2: initialPos.y2 + deltaY
                })
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
        <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={stroke}
            strokeWidth={strikeWidth}

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