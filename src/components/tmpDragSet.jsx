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

    const {elements, getElementRotation, setElementRotation} = elementsStore()

    const customEll = useMemo(() =>
            elements.find(elem => elem.id === id),
        [elements, id]
    )

    if (!customEll) return null

    const currentPointsArr = useMemo(() => parsePathData(customEll.d), [customEll?.d])
    const {min, max} = useMemo(() => getMinMaxCords(currentPointsArr), [currentPointsArr])
    const [minX, minY] = min
    const [maxX, maxY] = max

    const originalPointsRef = useRef(null)
    const originalCenterRef = useRef(null)
    const radiusRef = useRef(null)
    const cxRef = useRef(0)
    const cyRef = useRef(0)
    const visualRotationRef = useRef(0)
    const prevIdRef = useRef(null)
    const needsBakeRef = useRef(false)
    const bakedDataRef = useRef(null)

    const [dragAngle, setDragAngle] = useState(null)
    const isDraggingRef = useRef(false)
    const rotationStartRef = useRef({startAngle: 0, initialRotate: 0})
    const svgRef = useRef(null)

    // ✅ Инициализация БЕЗ вызова setState
    if (prevIdRef.current !== id) {
        // ✅ Берём из elementRotation (если есть) или из customEll.rotate
        const storedRotation = getElementRotation(id)
        visualRotationRef.current = storedRotation !== undefined ? storedRotation : (customEll.rotate || 0)

        if (customEll.rotate !== 0) {
            // ✅ Готовим данные для запекания, но НЕ вызываем onDrag здесь
            const [origCx, origCy] = getCenterPath(currentPointsArr)
            const rotated = rotatePoints(currentPointsArr, customEll.rotate, origCx, origCy)
            const bakedD = pointsArrToString(rotated)

            originalPointsRef.current = rotated
            const [cx, cy] = getCenterPath(rotated)
            originalCenterRef.current = [cx, cy]
            cxRef.current = cx
            cyRef.current = cy

            // ✅ Сохраняем данные для запекания
            bakedDataRef.current = {d: bakedD, rotation: visualRotationRef.current}
            needsBakeRef.current = true
        } else {
            originalPointsRef.current = currentPointsArr
            const [cx, cy] = getCenterPath(currentPointsArr)
            originalCenterRef.current = [cx, cy]
            cxRef.current = cx
            cyRef.current = cy

            bakedDataRef.current = null
            needsBakeRef.current = false
        }

        radiusRef.current = (maxY - minY) * 1.3
        prevIdRef.current = id
    }

    const [cx, cy] = originalCenterRef.current || [0, 0]
    const radius = radiusRef.current || 0

    const currentRotateRad = visualRotationRef.current * Math.PI / 180
    const circleAngle = dragAngle !== null ? dragAngle : (currentRotateRad - Math.PI / 2)
    const circleX = cx + radius * Math.cos(circleAngle)
    const circleY = cy + radius * Math.sin(circleAngle)

    const getAngleFromCenter = (clientX, clientY) => {
        const svg = svgRef.current
        if (!svg) return 0
        const ctm = svg.getScreenCTM()
        if (!ctm) return 0
        const x = (clientX - ctm.e) / ctm.a
        const y = (clientY - ctm.f) / ctm.d
        return Math.atan2(y - cyRef.current, x - cxRef.current)
    }

    const handleDragStart = (e) => {
        e.preventDefault()
        e.stopPropagation()
        isDraggingRef.current = true
        svgRef.current = e.currentTarget.ownerSVGElement
        const currentAngle = getAngleFromCenter(e.clientX, e.clientY)
        rotationStartRef.current = {
            startAngle: currentAngle,
            initialRotate: visualRotationRef.current
        }
        e.currentTarget.setPointerCapture?.(e.pointerId)
    }

    const handleDragMove = (e) => {
        if (!isDraggingRef.current || !svgRef.current) return
        const currentAngle = getAngleFromCenter(e.clientX, e.clientY)
        const {startAngle, initialRotate} = rotationStartRef.current
        setDragAngle(currentAngle)

        let angleDelta = currentAngle - startAngle
        if (angleDelta > Math.PI) angleDelta -= 2 * Math.PI
        else if (angleDelta < -Math.PI) angleDelta += 2 * Math.PI

        const degreesDelta = (angleDelta * 180) / Math.PI
        const newRotate = initialRotate + degreesDelta

        visualRotationRef.current = newRotate

        const rotated = rotatePoints(originalPointsRef.current, newRotate, cxRef.current, cyRef.current)
        const newD = pointsArrToString(rotated)

        requestAnimationFrame(() => {
            setElementRotation(id, newRotate)
            onDrag?.(id, {d: newD, rotate: newRotate})
        })
    }

    const handleDragEnd = (e) => {
        if (isDraggingRef.current) {
            isDraggingRef.current = false
            setDragAngle(null)
            requestAnimationFrame(() => {
                onRotateCommit?.(id, {})
            })
            e.currentTarget.releasePointerCapture?.(e.pointerId)
        }
    }

    // ✅ Запекаем ПОСЛЕ рендера
    useEffect(() => {
        if (needsBakeRef.current && bakedDataRef.current) {
            const {d, rotation} = bakedDataRef.current
            // ✅ Сохраняем визуальный угол
            setElementRotation(id, rotation)
            // ✅ Запекаем
            onDrag?.(id, {d, rotate: 0})
            needsBakeRef.current = false
            bakedDataRef.current = null
        }
    }, [id])

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
                style={{pointerEvents: 'none'}}
            />
        </>
    )
}