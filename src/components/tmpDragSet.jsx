import {useEffect, useMemo, useRef, useState} from "react";
import {elementsStore} from "../stores/elementsStore.jsx";
import parsePathData from "../utils/parsePathData.js";
import getCenterPath from "../utils/getCenterPath.js";
import rotatePoints from "../utils/rotatePoints.js";
import pointsArrToString from "../utils/pointsArrToString.js";
import getMinMaxCords from "../utils/getMinMaxCords.js";

// Функция для нормализации угла в диапазон [0, 360)
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
        // ✅ Сбрасываем dragAngle при смене элемента
        setDragAngle(null);

        // ✅ ВАЖНО: Теперь мы НЕ используем rotate из пропсов для visualRotationRef
        // visualRotationRef.current должен быть 0, потому что d уже содержит повернутые координаты
        visualRotationRef.current = 0;

        // ✅ Сохраняем оригинальные точки (они уже повернуты в d)
        originalPointsRef.current = currentPointsArr
        const [cx, cy] = getCenterPath(currentPointsArr)
        originalCenterRef.current = [cx, cy]
        cxRef.current = cx
        cyRef.current = cy

        bakedDataRef.current = null
        needsBakeRef.current = false

        radiusRef.current = (maxY - minY) * 1.3
        prevIdRef.current = id
    }

    const [cx, cy] = originalCenterRef.current || [0, 0]
    const radius = radiusRef.current || 0

    // ✅ Вычисляем угол для круга
    const getCircleAngle = () => {
        if (dragAngle !== null) {
            return dragAngle; // Во время перетаскивания используем текущий угол
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
        svgRef.current = e.currentTarget.ownerSVGElement

        // При начале перетаскивания устанавливаем угол круга в текущую позицию
        const startAngle = -Math.PI / 2; // Начинаем с верхней позиции
        setDragAngle(startAngle)

        rotationStartRef.current = {
            startAngle: startAngle,
            initialRotate: visualRotationRef.current // visualRotationRef.current всегда 0
        }
        e.currentTarget.setPointerCapture?.(e.pointerId)
    }

    const handleDragMove = (e) => {
        if (!isDraggingRef.current || !svgRef.current) return
        const currentAngle = getAngleFromCenter(e.clientX, e.clientY)
        const {startAngle, initialRotate} = rotationStartRef.current

        // Обновляем визуальный угол круга
        setDragAngle(currentAngle)

        // Вычисляем дельту относительно начального угла (-PI/2)
        let angleDelta = currentAngle - startAngle
        if (angleDelta > Math.PI) angleDelta -= 2 * Math.PI
        else if (angleDelta < -Math.PI) angleDelta += 2 * Math.PI

        // Поворачиваем элемент на ту же дельту
        const degreesDelta = (angleDelta * 180) / Math.PI
        const newRotate = normalizeAngle(initialRotate + degreesDelta)

        visualRotationRef.current = newRotate

        // Поворачиваем точки для отображения
        const rotated = rotatePoints(originalPointsRef.current, newRotate, cxRef.current, cyRef.current)
        const newD = pointsArrToString(rotated)

        requestAnimationFrame(() => {
            setElementRotation(id, newRotate)
            // ✅ Отправляем повернутые точки и угол поворота
            onDrag?.(id, {d: newD, rotate: newRotate})
        })
    }

    const handleDragEnd = (e) => {
        if (isDraggingRef.current) {
            isDraggingRef.current = false
            // Сбрасываем dragAngle, чтобы круг вернулся в верхнее положение
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
                setDragAngle(null)
            }
        }
        window.addEventListener('pointerup', handleGlobalUp)
        return () => window.removeEventListener('pointerup', handleGlobalUp)
    }, [])

    // ✅ Сброс при размонтировании
    useEffect(() => {
        return () => {
            setDragAngle(null);
            isDraggingRef.current = false;
        };
    }, []);

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