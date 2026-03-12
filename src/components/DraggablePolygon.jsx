import {useRef, useState} from "react";
import {elementsStore} from "../stores/elementsStore.jsx";


export default function DraggablePolygon({
                                             id,
                                             points,
                                             fill,
                                             stroke,
                                             strokeWidth,
                                             rotate,
                                             openSettings,
                                             onDrag,
                                             onDragEnd
                                         }) {
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
    const initialPosRef = useRef(getInitialPos())
    const svgRef = useRef(null)
    const {areaWidth, isSelected, toggleSelected} = elementsStore()


    const handlePointerDown = (e) => {
        e.preventDefault()
        e.stopPropagation()

        setIsDragging(true)
        setStartPos({x: e.clientX, y: e.clientY})
        initialPosRef.current = getInitialPos()
        svgRef.current = e.currentTarget.ownerSVGElement

        e.currentTarget.setPointerCapture?.(e.pointerId)
    }

    const initialPosPlusDelta = (deltaX, deltaY) => {
        const result = {}
        for (const key of Object.keys(initialPosRef.current)) {
            result[key] = {x: initialPosRef.current[key].x + deltaX, y: initialPosRef.current[key].y + deltaY}
        }
        return result;
    }

    const checkPosition = (deltaX, deltaY) => {

        for (const key of Object.keys(initialPosRef.current)) {
            if (initialPosRef.current[key].x + deltaX < 0 || initialPosRef.current[key].y + deltaY < 0) return false
            if (initialPosRef.current[key].x + deltaX > areaWidth || initialPosRef.current[key].y + deltaY > areaWidth) return false
        }

        return true
    }

    const getCenterPoly = () => {
        let count = 0
        let xSum = 0
        let ySum = 0

        for (const key of Object.keys(initialPosRef.current)) {
            xSum += initialPosRef.current[key].x
            ySum += initialPosRef.current[key].y
            count += 1
        }

        return [xSum / count, ySum / count]
    }

    const handlePointerMove = (e) => {
        if (!isDragging) return


        const ctm = svgRef.current.getScreenCTM()
        if (ctm) {
            const deltaX = (e.clientX - startPos.x) / ctm.a
            const deltaY = (e.clientY - startPos.y) / ctm.d

            if (checkPosition(deltaX, deltaY)) {
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

    const rotation = rotate || 0;
    const [cx, cy] = getCenterPoly()
    console.log(cx, cy)

    return (
        <polygon
            points={points}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}

            transform={rotation ? `rotate(${rotation} ${cx} ${cy})` : undefined}


            onDoubleClick={() => {
                openSettings(id)
            }}

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