import {useEffect, useMemo, useRef, useState} from "react";
import {elementsStore} from "../stores/elementsStore.jsx";
import parsePathData from "../utils/parsePathData.js";
import getCenterPath from "../utils/getCenterPath.js";
import rotatePoints from "../utils/rotatePoints.js";
import pointsArrToString from "../utils/pointsArrToString.js";
import getMinMaxCords from "../utils/getMinMaxCords.js";

export default function DraggableSettings({
                                              id,
                                              rotate,
                                              onDrag,
                                              onDragEnd,
                                              onRotateCommit
                                          }) {

    const {elements, customizableElementId, areaWidth, isSelected, toggleSelected} = elementsStore()
    const [isDragging, setDragging] = useState(false)
    const [isRotating, setIsRotating] = useState(false)
    const customEll = elements.find(elem => elem.id === customizableElementId)

    const currentPointsArr = useMemo(() => parsePathData(customEll.d), [customEll])
    const [minX, minY] = useMemo(() => getMinMaxCords(currentPointsArr).min, [currentPointsArr])
    const [maxX, maxY] = useMemo(() => getMinMaxCords(currentPointsArr).max, [currentPointsArr])


    const [cx, cy] = useMemo(() => getCenterPath(currentPointsArr), [currentPointsArr])

    // const [startPos, setStartPos] = useState({x: 0, y: 0})
    // const initialPosRef = useRef(currentPointsArr)
    // const svgRef = useRef(null)
    //
    //
    // useEffect(() => {
    //     if (rotate !== 0) {
    //         const rotated = rotatePoints(currentPointsArr, rotate, cx, cy)
    //         const newD = pointsArrToString(rotated)
    //
    //         onRotateCommit?.(id, {d: newD, rotate: 0})
    //     }
    // }, [rotate])
    //
    // const handlePointerDown = (e) => {
    //     e.preventDefault();
    //     e.stopPropagation()
    //
    //     if (!isSelected(id)) toggleSelected(id)
    //
    //     setDragging(true)
    //     setStartPos({x: e.clientX, y: e.clientY})
    //
    //     initialPosRef.current = currentPointsArr
    //     svgRef.current = e.currentTarget.ownerSVGElement
    //
    //     e.currentTarget.setPointerCapture?.(e.pointerId)
    // }
    //
    // const initialPosPlusDelta = (deltaX, deltaY) => {
    //     const result = []
    //     for (const obj of initialPosRef.current) {
    //         const subResult = {command: obj.command, params: []};
    //         for (let i = 0; i < obj.params.length; i += 2) {
    //             if (i + 1 >= obj.params.length) break;
    //             subResult.params.push(obj.params[i] + deltaX);
    //             subResult.params.push(obj.params[i + 1] + deltaY);
    //         }
    //         result.push(subResult)
    //     }
    //     return result
    // }
    //
    // const checkPosition = (pointsToCheck) => {
    //
    //     for (const obj of pointsToCheck) {
    //         const cmd = obj.command.toUpperCase()
    //         if (cmd === 'Z') continue
    //
    //         for (let i = 0; i < obj.params.length; i += 2) {
    //             if (i + 1 >= obj.params.length) continue;
    //
    //             const x = obj.params[i];
    //             const y = obj.params[i + 1];
    //
    //             if (x < 0 || y < 0 || x > areaWidth || y > areaWidth) return false;
    //         }
    //     }
    //     return true;
    // }
    //
    // const handlePointerMove = (e) => {
    //     if (!isDragging) return
    //
    //     const ctm = svgRef.current?.getScreenCTM()
    //     if (ctm) {
    //         const deltaX = (e.clientX - startPos.x) / ctm.a
    //         const deltaY = (e.clientY - startPos.y) / ctm.d
    //
    //         const newPos = initialPosPlusDelta(deltaX, deltaY)
    //
    //         if (checkPosition(newPos)) {
    //             const newD = pointsArrToString(newPos)
    //             onDrag?.(id, {d: newD})
    //         }
    //     }
    // }
    //
    // const handlePointerUp = (e) => {
    //     if (isDragging) {
    //         setDragging(false)
    //         onDragEnd?.(id)
    //         e.currentTarget.releasePointerCapture?.(e.pointerId)
    //     }
    // }
    //
    // const displayPoints = useMemo(() => {
    //     if (rotate !== 0) {
    //         return rotatePoints(currentPointsArr, rotate, cx, cy);
    //     }
    //     return currentPointsArr
    // }, [currentPointsArr, rotate, cx, cy]);
    //
    // const displayD = useMemo(() => pointsArrToString(displayPoints), [displayPoints])

    return (
        <>
            <circle
                cx={cx}
                cy={cy - (maxY - minY)}
                strokeWidth={1}
                r={5}

                style={{
                    cursor: isRotating ? 'grabbing' : 'grab',
                    pointerEvents: 'all',
                }}
            />
            <path
                d={`M ${minX - 0.01 * minX},${minY - 0.01 * minY} ${maxX + 0.01 * maxX},${minY - 0.01 * minY} ${maxX + 0.01 * maxX},${maxY + 0.01 * maxY} ${minX - 0.01 * minX},${maxY + 0.01 * maxY} Z`}
                fill={'transparent'}
                stroke={'#ffffff'}
                strokeWidth={1}
                style={{
                    zIndex: -1,
                }}
                //
                // onDoubleClick={() => openSettings(id)}
                // onPointerDown={handlePointerDown}
                // onPointerMove={handlePointerMove}
                // onPointerUp={handlePointerUp}
                // onPointerLeave={handlePointerUp}
                // style={{
                //     cursor: isDragging ? 'grabbing' : 'grab',
                //     pointerEvents: 'all',
                // }}
            />
        </>


    )
}


