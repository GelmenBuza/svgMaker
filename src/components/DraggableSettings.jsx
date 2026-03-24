import {useEffect, useMemo, useRef, useState} from "react";
import {elementsStore} from "../stores/elementsStore.jsx";
import parsePathData from "../utils/parsePathData.js";
import getCenterPath from "../utils/getCenterPath.js";
import rotatePoints from "../utils/rotatePoints.js";
import pointsArrToString from "../utils/pointsArrToString.js";
import getMinMaxCords from "../utils/getMinMaxCords.js";

const normalizeAngle = (angle) => {
    angle = angle % 360;
    if (angle < 0) angle += 360;
    return angle;
};

export default function DraggableSettings({
                                              id,
                                              onDrag,
                                              onRotateCommit
                                          }) {

    const {elements, setElementRotation} = elementsStore()

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

    const isRotatingRef = useRef(false)

    const [dragAngle, setDragAngle] = useState(null)
    const isDraggingRef = useRef(false)  // используется для pointer capture
    const rotationStartRef = useRef({startAngle: 0, initialRotate: 0})
    const svgRef = useRef(null)

    if (prevIdRef.current !== id) {
        setDragAngle(null);
        isRotatingRef.current = false;

        visualRotationRef.current = 0;

        originalPointsRef.current = currentPointsArr
        const [cx, cy] = getCenterPath(currentPointsArr)
        originalCenterRef.current = [cx, cy]
        cxRef.current = cx
        cyRef.current = cy

        radiusRef.current = (maxY - minY) * 1.3

        prevIdRef.current = id
    }

    useEffect(() => {
        if (prevIdRef.current === id && !isRotatingRef.current) {
            originalPointsRef.current = currentPointsArr
            const [cx, cy] = getCenterPath(currentPointsArr)
            originalCenterRef.current = [cx, cy]
            cxRef.current = cx
            cyRef.current = cy

            radiusRef.current = (maxY - minY) * 1.3

            visualRotationRef.current = 0
        }
    }, [currentPointsArr, id, maxY, minY])

    const [cx, cy] = originalCenterRef.current || [0, 0]
    const radius = radiusRef.current || 0

    const getCircleAngle = () => {
        if (dragAngle !== null) {
            return dragAngle;
        }
        // В состоянии покоя круг всегда сверху по центру (фиксированное положение)
        return -Math.PI / 2; // -90 градусов (вверх от центра)
    }

    const circleAngle = getCircleAngle();
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
        isRotatingRef.current = true
        svgRef.current = e.currentTarget.ownerSVGElement

        const startAngle = -Math.PI / 2;
        setDragAngle(startAngle)

        rotationStartRef.current = {
            startAngle: startAngle,
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
        const newRotate = normalizeAngle(initialRotate + degreesDelta)

        visualRotationRef.current = newRotate

        const rotated = rotatePoints(originalPointsRef.current, newRotate, cxRef.current, cyRef.current)
        requestAnimationFrame(() => {
            setElementRotation(id, newRotate)
            onDrag?.(id, {points: rotated, rotate: newRotate})
        })
    }

    const handleDragEnd = (e) => {
        if (isDraggingRef.current) {
            isDraggingRef.current = false
            isRotatingRef.current = false
            setDragAngle(null)
            requestAnimationFrame(() => {
                onRotateCommit?.(id, {})
            })
            e.currentTarget.releasePointerCapture?.(e.pointerId)
        }
    }

    useEffect(() => {
        const handleGlobalUp = () => {
            if (isDraggingRef.current) {
                isDraggingRef.current = false
                isRotatingRef.current = false
                setDragAngle(null)
            }
        }
        window.addEventListener('pointerup', handleGlobalUp)
        return () => window.removeEventListener('pointerup', handleGlobalUp)
    }, [])

    useEffect(() => {
        return () => {
            setDragAngle(null);
            isDraggingRef.current = false;
            isRotatingRef.current = false;
        };
    }, []);

    const edgeLength = Math.max(maxX - minX + 10, maxY - minY + 10)


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
            <rect
                x={`${minX - 10}`}
                y={`${minY - 10}`}
                width={`${edgeLength}`}
                height={`${edgeLength}`}
                fill="none"
                stroke="#4CAF50"
                strokeDasharray="4 2"
                strokeWidth={1}
                style={{pointerEvents: 'none'}}
            />
        </>
    )
}