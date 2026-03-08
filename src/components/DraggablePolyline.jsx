import { useState} from "react";


export default function DraggablePolyline({id, points, fill, stroke, strokeWidth, onDrag, onDragEnd}) {
    const [isDragging, setIsDragging] = useState(false)

    const getInitialPos = () => {
        const result = {}
        points.split(' ').map((dots, index) => {
            const [x, y] = dots.split(',')
            result[index] = {x: +x, y: +y}
        })
        return result
    }

    const [startPos, setStartPos] = useState({x: 0, y: 0})
    const [initialPos, setInitialPos] = useState(getInitialPos())



    const handlePointerDown = (e) => {
        e.preventDefault()
        e.stopPropagation()

        setIsDragging(true)
        setStartPos({x: e.clientX, y: e.clientY})
        setInitialPos(getInitialPos())

        e.currentTarget.setPointerCapture?.(e.pointerId)
    }

    const initialPosPlusDelta = (deltaX, deltaY) => {
        const result = {}
        for (const key of Object.keys(initialPos)) {
            result[key] = {x: initialPos[key].x + deltaX, y: initialPos[key].y + deltaY}
        }
        return result;
    }

    const handlePointerMove = (e) => {
        if (!isDragging) return

        const svg = e.currentTarget.ownerSVGElement;
        if (svg) {
            const ctm = svg.getScreenCTM()
            if (ctm) {
                const deltaX = (e.clientX - startPos.x) / ctm.a
                const deltaY = (e.clientY - startPos.y) / ctm.d
                const newPos = initialPosPlusDelta(deltaX, deltaY)
                onDrag?.(id, {points: newPos})
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
        <polyline
            points={points}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}

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