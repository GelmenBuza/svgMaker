import {useEffect, useMemo, useRef, useState} from "react";
import {elementsStore} from "../stores/elementsStore.jsx";
import parsePathData from "../utils/parsePathData.js";
import getCenterPath from "../utils/getCenterPath.js";
import rotatePoints from "../utils/rotatePoints.js";
import pointsArrToString from "../utils/pointsArrToString.js";

export default function DraggablePath({
                                          id,
                                          d,
                                          fill,
                                          stroke,
                                          strokeWidth,
                                          rotate,
                                          openSettings,
                                          onDrag,
                                          onDragEnd,
                                          onRotateCommit
                                      }) {
    const [isDragging, setDragging] = useState(false)
    const currentPointsArr = useMemo(() => parsePathData(d), [d])

    const [cx, cy] = useMemo(() => getCenterPath(currentPointsArr), [currentPointsArr])

    const [startPos, setStartPos] = useState({x: 0, y: 0})
    const initialPosRef = useRef(currentPointsArr)
    const svgRef = useRef(null)

    const {areaWidth, isSelected, toggleSelected} = elementsStore()

    useEffect(() => {
        if (rotate !== 0) {
            const rotated = rotatePoints(currentPointsArr, rotate, cx, cy)
            const newD = pointsArrToString(rotated)

            onRotateCommit?.(id, {d: newD, rotate: 0})
        }
    }, [rotate])

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
            const subResult = {command: obj.command, params: []};
            for (let i = 0; i < obj.params.length; i += 2) {
                if (i + 1 >= obj.params.length) break;
                subResult.params.push(obj.params[i] + deltaX);
                subResult.params.push(obj.params[i + 1] + deltaY);
            }
            result.push(subResult)
        }
        return result
    }

    const checkPosition = (pointsToCheck) => {

        for (const obj of pointsToCheck) {
            const cmd = obj.command.toUpperCase()
            if (cmd === 'Z') continue

            for (let i = 0; i < obj.params.length; i += 2) {
                if (i + 1 >= obj.params.length) continue;

                const x = obj.params[i];
                const y = obj.params[i + 1];

                if (x < 0 || y < 0 || x > areaWidth || y > areaWidth) return false;
            }
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
                const newD = pointsArrToString(newPos)
                onDrag?.(id, {d: newD})
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

    const displayPoints = useMemo(() => {
        if (rotate !== 0) {
            return rotatePoints(currentPointsArr, rotate, cx, cy);
        }
        return currentPointsArr
    }, [currentPointsArr, rotate, cx, cy]);

    const displayD = useMemo(() => pointsArrToString(displayPoints), [displayPoints])

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


