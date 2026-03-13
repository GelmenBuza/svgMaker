import {useEffect, useMemo, useRef, useState} from "react";
import {elementsStore} from "../stores/elementsStore.jsx";

const parsePathData = (d) => {
    const commands = []
    const regex = /([MmLlHhVvCcSsQqTtAaZz])|(-?\d*\.?\d+)/g
    let match
    let currentCommand = null
    let params = []

    while ((match = regex.exec(d)) !== null) {
        if (match[1]) {
            if (currentCommand && params.length > 0) {
                commands.push({command: currentCommand, params})
                params = []
            }
            currentCommand = match[1]
        } else {
            params.push(match[2])
        }
    }
    if (currentCommand && params.length > 0) {
        commands.push({command: currentCommand, params})
    }

    return commands
}

const getCenterPath = (pointsArr) => {
    let count = 0
    let xSum = 0
    let ySum = 0
    for (const obj of pointsArr) {
        for (let i = 0; i < obj.params.length; i += 2) {
            xSum += +obj.params[i];
            ySum += +obj.params[i + 1];
            count += 1
        }
    }

    return count ? [xSum / count, ySum / count] : [0, 0]
}

const rotatePoints = (pointsArr, angleDeg, cx, cy) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    const result = []
    for (const obj of pointsArr) {
        const subResult = {command: obj.command, params: []};
        for (let i = 0; i < obj.params.length; i += 2) {
            const x = +obj.params[i];
            const y = +obj.params[i + 1];

            const dx = x - cx
            const dy = y - cy

            const newX = dx * cos - dy * sin
            const newY = dx * sin + dy * cos

            subResult.params.push(newX)
            subResult.params.push(newY)
        }
        result.push(subResult)
    }
    return result
}

const pointsArrToString = (pointsArr) => {
    let result = ''
    for (const obj of pointsArr) {
        const params = []
        for (let i = 0; i < obj.params.length; i += 2) {
            const x = +obj.params[i];
            const y = +obj.params[i + 1];
            params.push(`${x},${y}`);
        }
        result += `${obj.command} ${params.join(' ')}\n`
    }
    return result.trim()
}

export default function DraggablePath(id, d, fill, stroke, strokeWidth, rotate, openSettings, onDrag, onDragEnd, onRotateCommit) {
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
            onRotateCommit?.(id, {points: rotated, rotate: 0})
        }
    }, [rotate, currentPointsArr, cx, cy, id, onRotateCommit])

    const hadlePointerDown = (e) => {
        e.preventDefault();
        e.stopPropagation()

        if (!isSelected) toggleSelected(id)

        setDragging(true)
        setStartPos({x: e.clientX, y: e.clientY})

        initialPosRef.current = currentPointsArr
        svgRef.current = e.currentTarget.ownerSVGElement

        e.currentTarget.setPointerCapture?.(e.pointerId)
    }

    const initialPosPlusDelta = (deltaX, deltaY) => {
        const result = {}
        for ()
    }

    return (
        <path>

        </path>
    )
}