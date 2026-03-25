import {useMemo, useRef, useState} from "react";
import {elementsStore} from "../stores/elementsStore.jsx";
import parsePathData from "../utils/parsePathData.js";
import getCenterPath from "../utils/getCenterPath.js";

export default function DraggablePath({
                                          id,
                                          d,
                                          fill,
                                          stroke,
                                          strokeWidth,
                                          openSettings,
                                          onDrag,
                                          onDragEnd,
                                      }) {
    const [isDragging, setDragging] = useState(false)
    const currentPointsArr = useMemo(() => parsePathData(d), [d])
    const [cx, cy] = useMemo(() => getCenterPath(currentPointsArr), [currentPointsArr])

    const [startPos, setStartPos] = useState({x: 0, y: 0})
    const initialPosRef = useRef(currentPointsArr)
    const svgRef = useRef(null)

    const {areaWidth, isSelected, toggleSelected} = elementsStore()

    const handlePointerDown = (e) => {
        e.preventDefault();
        e.stopPropagation()

        if (!isSelected(id)) toggleSelected(id)

        setDragging(true)
        setStartPos({x: e.clientX, y: e.clientY})
        initialPosRef.current = currentPointsArr
        svgRef.current = e.currentTarget.ownerSVGElement

        e.currentTarget.setPointerCapture?.(e.pointerId)
    }

    const initialPosPlusDelta = (deltaX, deltaY) => {
        const result = []
        for (const obj of initialPosRef.current) {
            const subResult = {command: obj.command.toUpperCase(), x: obj.x + deltaX, y: obj.y + deltaY, type: obj.type};

            if (obj.in) {
                subResult.in = {x: obj.in.x + deltaX, y: obj.in.y + deltaY};
            }

            if (obj.out) {
                subResult.out = {x: obj.out.x + deltaX, y: obj.out.y + deltaY};
            }

            result.push(subResult)
        }
        return result
    }

    const checkPosition = (pointsToCheck) => {
        for (const obj of pointsToCheck) {
            const cmd = obj.command.toUpperCase()
            if (cmd === 'Z') continue

            if (obj.x < 0 || obj.y < 0 || obj.x > areaWidth || obj.y > areaWidth) return false;
        }
        return true;
    }

    const handlePointerMove = (e) => {
        if (!isDragging) return

        const ctm = svgRef.current?.getScreenCTM()
        if (ctm) {
            const deltaX = (e.clientX - startPos.x) / ctm.a
            const deltaY = (e.clientY - startPos.y) / ctm.d

            const newPos = initialPosPlusDelta(deltaX, deltaY)

            if (checkPosition(newPos)) {
                onDrag?.(id, {points: newPos})
            }
        }
    }

    const handlePointerUp = (e) => {
        if (isDragging) {
            setDragging(false)
            onDragEnd?.(id)
            e.currentTarget.releasePointerCapture?.(e.pointerId)
        }
    }

    const displayD = useMemo(() => d, [d])

    return (
        <path
            d={displayD}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}

            onDoubleClick={() => openSettings(id)}
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