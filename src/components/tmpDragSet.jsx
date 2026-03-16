import {useEffect, useMemo, useRef, useState} from "react";
import {elementsStore} from "../stores/elementsStore.jsx";
import parsePathData from "../utils/parsePathData.js";
import getCenterPath from "../utils/getCenterPath.js";
import rotatePoints from "../utils/rotatePoints.js";
import pointsArrToString from "../utils/pointsArrToString.js";
import getMinMaxCords from "../utils/getMinMaxCords.js";

export default function DraggableSettings({
                                              id,
                                              onDrag,
                                              onRotateCommit
                                          }) {

    const {elements} = elementsStore()

    const customEll = useMemo(() =>
            elements.find(elem => elem.id === id),
        [elements, id]
    )

    if (!customEll) return null

    const currentPointsArr = useMemo(() => parsePathData(customEll.d), [customEll?.d])
    const {min, max} = useMemo(() => getMinMaxCords(currentPointsArr), [currentPointsArr])
    const [minX, minY] = min
    const [maxX, maxY] = max
    const [cx, cy] = useMemo(() => getCenterPath(currentPointsArr), [currentPointsArr])

    // ✅ Реф для радиуса — вычисляем ОДИН раз и не меняем!
    const radiusRef = useRef(null)

    // ✅ Вычисляем радиус только если ещё не вычислен
    if (radiusRef.current === null) {
        radiusRef.current = (maxY - minY) * 1.3
    }

    const radius = radiusRef.current

    // ✅ Стейт для угла мыши ВО ВРЕМЯ драга
    const [dragAngle, setDragAngle] = useState(null)

    const isDraggingRef = useRef(false)
    const rotationStartRef = useRef({
        startAngle: 0,
        initialRotate: customEll.rotate || 0
    })
    const svgRef = useRef(null)
    const originalPointsRef = useRef(currentPointsArr)

    // ✅ Обновляем оригинальные точки при изменении d
    useEffect(() => {
        originalPointsRef.current = currentPointsArr
        // ✅ Сбрасываем радиус при смене элемента (опционально)
        // radiusRef.current = (maxY - minY) * 1.3
    }, [currentPointsArr])

    // ✅ Вычисляем угол для круга
    const currentRotateRad = (customEll.rotate || 0) * Math.PI / 180
    const circleAngle = dragAngle !== null ? dragAngle : (currentRotateRad - Math.PI / 2)

    // ✅ Позиция круга
    const circleX = cx + radius * Math.cos(circleAngle)
    const circleY = cy + radius * Math.sin(circleAngle)

    const getAngleFromCenter = (clientX, clientY) => {
        const svg = svgRef.current
        if (!svg) return 0

        const ctm = svg.getScreenCTM()
        if (!ctm) return 0

        const x = (clientX - ctm.e) / ctm.a
        const y = (clientY - ctm.f) / ctm.d

        return Math.atan2(y - cy, x - cx)
    }

    const handleDragStart = (e) => {
        e.preventDefault()
        e.stopPropagation()

        isDraggingRef.current = true
        svgRef.current = e.currentTarget.ownerSVGElement

        const currentAngle = getAngleFromCenter(e.clientX, e.clientY)

        rotationStartRef.current = {
            startAngle: currentAngle,
            initialRotate: customEll.rotate || 0
        }

        e.currentTarget.setPointerCapture?.(e.pointerId)
    }

    const handleDragMove = (e) => {
        if (!isDraggingRef.current || !svgRef.current) return

        const currentAngle = getAngleFromCenter(e.clientX, e.clientY)
        const { startAngle, initialRotate } = rotationStartRef.current

        setDragAngle(currentAngle)

        const angleDelta = currentAngle - startAngle
        const degreesDelta = (angleDelta * 180) / Math.PI
        const newRotate = initialRotate + degreesDelta

        const rotated = rotatePoints(originalPointsRef.current, newRotate, cx, cy)
        const newD = pointsArrToString(rotated)

        onDrag?.(id, { d: newD, rotate: newRotate })
    }

    // В handleDragEnd — теперь передаём команду на запекание:
    const handleDragEnd = (e) => {
        if (isDraggingRef.current) {
            isDraggingRef.current = false
            setDragAngle(null)
            // ✅ Передаём пустой объект — запекание будет в App.jsx
            onRotateCommit?.(id, {})
            e.currentTarget.releasePointerCapture?.(e.pointerId)
        }
    }

    useEffect(() => {
        const handleGlobalUp = () => {
            if (isDraggingRef.current) {
                isDraggingRef.current = false
                setDragAngle(null)
            }
        }

        window.addEventListener('pointerup', handleGlobalUp)
        return () => window.removeEventListener('pointerup', handleGlobalUp)
    }, [])

    return (
        <>
            <circle
                cx={circleX}
                cy={circleY}
                r={6}
                fill="#4CAF50"
                stroke="#2E7D32"
                strokeWidth={2}
                style={{
                    cursor: isDraggingRef.current ? 'grabbing' : 'grab',
                    pointerEvents: 'all',
                    userSelect: 'none',
                    touchAction: 'none'
                }}
                onPointerDown={handleDragStart}
                onPointerMove={handleDragMove}
                onPointerUp={handleDragEnd}
                onPointerLeave={handleDragEnd}
            />

            <path
                d={`M ${minX},${minY} ${maxX},${minY} ${maxX},${maxY} ${minX},${maxY} Z`}
                fill="none"
                stroke="#4CAF50"
                strokeDasharray="4 2"
                strokeWidth={1}
                style={{ pointerEvents: 'none' }}
            />
        </>
    )
}