import { useMemo, useRef, useState } from "react";
import { elementsStore } from "../../stores/elementsStore.jsx";
import parsePathData from "../../utils/parsePathData.js";
import style from './style.module.css'

export default function DraggableDots({
    id,
    onDrag,
    handleContextMenu
}) {
    const { elements } = elementsStore()

    const customEll = useMemo(() =>
        elements.find(elem => elem.id === id),
        [elements, id]
    )
    if (!customEll) return null;

    const [isDragging, setIsDragging] = useState(false)
    const [startPos, setStartPos] = useState({ cx: 0, cy: 0 })
    const initialPosRef = useRef(null)
    const svgRef = useRef(null)
    const dotsArr = useMemo(
        () => (customEll.points?.length ? customEll.points : parsePathData(customEll.d)),
        [customEll]
    )


    const handlePointerDown = (e) => {
        e.preventDefault()
        e.stopPropagation()
        let objIndex;
        if (e.target.id.includes('vertex')) {
            objIndex = +e.target.id.split('-').at(-1)
        } else {
            objIndex = +e.target.id.split('-')[1].split('=')[1]
        }
        const isClosedShape = dotsArr[0].x === dotsArr.at(-1).x && dotsArr[0].y === dotsArr.at(-1).y
        const lastSharedIndex = dotsArr.length - 2
        if (isClosedShape && (objIndex === lastSharedIndex || objIndex === 0)) {
            initialPosRef.current = {
                cx: dotsArr[lastSharedIndex].x,
                cy: dotsArr[lastSharedIndex].y,
                in: { ...dotsArr[lastSharedIndex].in },
                out: { ...dotsArr[0].out },
                type: dotsArr[lastSharedIndex].type
            }
        } else {
            initialPosRef.current = {
                cx: dotsArr[objIndex].x,
                cy: dotsArr[objIndex].y,
                in: { ...dotsArr[objIndex].in },
                out: { ...dotsArr[objIndex].out },
                type: dotsArr[objIndex].type
            }
        }
        setIsDragging(true)
        setStartPos({ cx: e.clientX, cy: e.clientY })
        svgRef.current = e.currentTarget.ownerSVGElement

        e.currentTarget.setPointerCapture?.(e.pointerId)
    }

    const handlePointerMove = (e) => {
        if (!isDragging) return

        const ctm = svgRef.current.getScreenCTM()
        if (ctm) {
            const deltaX = (e.clientX - startPos.cx) / ctm.a
            const deltaY = (e.clientY - startPos.cy) / ctm.d

            if (e.target.id.includes('vertex')) {
                const movedVertex = +e.target.id.split('-').at(-1)
                let counter = 0;

                for (const obj of dotsArr) {
                    if (obj.command.toUpperCase() === 'Z') {
                        counter++;
                        continue;
                    }
                    if (movedVertex === dotsArr.length - 2 && (dotsArr[0].x === dotsArr.at(-1).x && dotsArr[0].y === dotsArr.at(-1).y)) {

                        dotsArr[0].x = initialPosRef.current.cx + deltaX
                        dotsArr[0].y = initialPosRef.current.cy + deltaY
                        if (dotsArr[0].in) {
                            dotsArr[0].in.x = initialPosRef.current.in.x + deltaX
                            dotsArr[0].in.y = initialPosRef.current.in.y + deltaY
                        }
                        if (dotsArr[0].out) {
                            dotsArr[0].out.x = initialPosRef.current.out.x + deltaX
                            dotsArr[0].out.y = initialPosRef.current.out.y + deltaY
                        }

                        dotsArr[dotsArr.length - 1].x = initialPosRef.current.cx + deltaX
                        dotsArr[dotsArr.length - 1].y = initialPosRef.current.cy + deltaY

                        if (dotsArr[dotsArr.length - 1].in) {
                            dotsArr[dotsArr.length - 1].in.x = initialPosRef.current.in.x + deltaX
                            dotsArr[dotsArr.length - 1].in.y = initialPosRef.current.in.y + deltaY
                        }
                        if (dotsArr[dotsArr.length - 1].out) {
                            dotsArr[dotsArr.length - 1].out.x = initialPosRef.current.out.x + deltaX
                            dotsArr[dotsArr.length - 1].out.y = initialPosRef.current.out.y + deltaY
                        }


                        dotsArr[dotsArr.length - 2].x = initialPosRef.current.cx + deltaX
                        dotsArr[dotsArr.length - 2].y = initialPosRef.current.cy + deltaY
                        if (dotsArr[dotsArr.length - 2].in) {
                            dotsArr[dotsArr.length - 2].in.x = initialPosRef.current.in.x + deltaX
                            dotsArr[dotsArr.length - 2].in.y = initialPosRef.current.in.y + deltaY
                        }
                        if (dotsArr[dotsArr.length - 2].out) {
                            dotsArr[dotsArr.length - 2].out.x = initialPosRef.current.out.x + deltaX
                            dotsArr[dotsArr.length - 2].out.y = initialPosRef.current.out.y + deltaY
                        }

                        counter++
                        continue
                    }
                    if (counter === movedVertex) {
                        obj.x = initialPosRef.current.cx + deltaX
                        obj.y = initialPosRef.current.cy + deltaY
                        if (obj.in) {
                            obj.in.x = initialPosRef.current.in.x + deltaX
                            obj.in.y = initialPosRef.current.in.y + deltaY
                        }
                        if (obj.out) {
                            obj.out.x = initialPosRef.current.out.x + deltaX
                            obj.out.y = initialPosRef.current.out.y + deltaY
                        }
                    }
                    counter++
                }
            } else {
                const splitId = e.target.id.split('-')
                const guideLineIndex = +splitId.at(-1)
                const type = splitId.at(-2)

                const targetDotIndex = guideLinesArr[guideLineIndex]?.at(-1)

                if (targetDotIndex !== undefined) {
                    const obj = dotsArr[targetDotIndex]
                    const isClosedShape = dotsArr[0].x === dotsArr.at(-1).x && dotsArr[0].y === dotsArr.at(-1).y
                    const lastSharedIndex = dotsArr.length - 2
                    const isSharedClosingNode = isClosedShape && (targetDotIndex === lastSharedIndex || targetDotIndex === 0)
                    if (isSharedClosingNode) {
                        const sharedInNode = dotsArr[lastSharedIndex]
                        const sharedOutNode = dotsArr[0]
                        if (initialPosRef.current.type === 'symmetric') {
                            if (e.target.id.split('-').at(-2) === 'in') {
                                sharedInNode.in.x = initialPosRef.current.in.x + deltaX
                                sharedInNode.in.y = initialPosRef.current.in.y + deltaY
                                sharedOutNode.out.x = initialPosRef.current.out.x - deltaX
                                sharedOutNode.out.y = initialPosRef.current.out.y - deltaY
                            } else if (e.target.id.split('-').at(-2) === 'out') {
                                sharedInNode.in.x = initialPosRef.current.in.x - deltaX
                                sharedInNode.in.y = initialPosRef.current.in.y - deltaY
                                sharedOutNode.out.x = initialPosRef.current.out.x + deltaX
                                sharedOutNode.out.y = initialPosRef.current.out.y + deltaY
                            }
                        } else if (initialPosRef.current.type === 'smooth') {
                            const anchorX = sharedInNode.x;
                            const anchorY = sharedInNode.y;
                            const isDraggingIn = e.target.id.split('-').at(-2) === 'in';

                            if (isDraggingIn) {
                                sharedInNode.in.x = initialPosRef.current.in.x + deltaX;
                                sharedInNode.in.y = initialPosRef.current.in.y + deltaY;
                            } else if (obj.out) {
                                sharedOutNode.out.x = initialPosRef.current.out.x + deltaX;
                                sharedOutNode.out.y = initialPosRef.current.out.y + deltaY;
                            }

                            const activeHandle = isDraggingIn ? sharedInNode.in : sharedOutNode.out;
                            const dx = activeHandle.x - anchorX;
                            const dy = activeHandle.y - anchorY;

                            const distanceActive = Math.sqrt(dx * dx + dy * dy);

                            if (distanceActive > 0.1) {
                                const oppositeType = isDraggingIn ? 'out' : 'in';
                                const initialOpp = initialPosRef.current[oppositeType];
                                const initialAnchor = initialPosRef.current;

                                const lenOpp = Math.sqrt(
                                    Math.pow(initialOpp.x - initialAnchor.cx, 2) + Math.pow(initialOpp.y - initialAnchor.cy, 2)
                                );
                                if (oppositeType === 'in') {
                                    sharedInNode[oppositeType].x = anchorX - (dx / distanceActive) * lenOpp;
                                    sharedInNode[oppositeType].y = anchorY - (dy / distanceActive) * lenOpp;
                                } else {
                                    sharedOutNode[oppositeType].x = anchorX - (dx / distanceActive) * lenOpp;
                                    sharedOutNode[oppositeType].y = anchorY - (dy / distanceActive) * lenOpp;
                                }
                            } else {
                                const oppositeType = isDraggingIn ? 'out' : 'in';
                                if (oppositeType === 'in') {
                                    sharedInNode[oppositeType].x = anchorX;
                                    sharedInNode[oppositeType].y = anchorY;
                                } else {
                                    sharedOutNode[oppositeType].x = anchorX;
                                    sharedOutNode[oppositeType].y = anchorY;
                                }
                            }
                        } else {
                            if (type === 'in' && obj.in) {
                                obj.in.x = initialPosRef.current.in.x + deltaX
                                obj.in.y = initialPosRef.current.in.y + deltaY
                            }
                            if (type === 'out' && obj.out) {
                                obj.out.x = initialPosRef.current.out.x + deltaX
                                obj.out.y = initialPosRef.current.out.y + deltaY
                            }
                        }
                    } else {
                        if (initialPosRef.current.type === 'symmetric') {
                            if (e.target.id.split('-').at(-2) === 'in') {
                                obj.in.x = initialPosRef.current.in.x + deltaX
                                obj.in.y = initialPosRef.current.in.y + deltaY
                                obj.out.x = initialPosRef.current.out.x - deltaX
                                obj.out.y = initialPosRef.current.out.y - deltaY
                            } else if (e.target.id.split('-').at(-2) === 'out') {
                                obj.in.x = initialPosRef.current.in.x - deltaX
                                obj.in.y = initialPosRef.current.in.y - deltaY
                                obj.out.x = initialPosRef.current.out.x + deltaX
                                obj.out.y = initialPosRef.current.out.y + deltaY
                            }

                        } else if (initialPosRef.current.type === 'smooth') {
                            const anchorX = obj.x;
                            const anchorY = obj.y;
                            const isDraggingIn = e.target.id.split('-').at(-2) === 'in';
                            if (isDraggingIn) {
                                obj.in.x = initialPosRef.current.in.x + deltaX;
                                obj.in.y = initialPosRef.current.in.y + deltaY;
                            } else if (obj.out) {
                                obj.out.x = initialPosRef.current.out.x + deltaX;
                                obj.out.y = initialPosRef.current.out.y + deltaY;
                            }

                            const activeHandle = isDraggingIn ? obj.in : obj.out;
                            const dx = activeHandle.x - anchorX;
                            const dy = activeHandle.y - anchorY;

                            const distanceActive = Math.sqrt(dx * dx + dy * dy);

                            if (distanceActive > 0.1) {
                                const oppositeType = isDraggingIn ? 'out' : 'in';
                                const initialOpp = initialPosRef.current[oppositeType];
                                const initialAnchor = initialPosRef.current;

                                const lenOpp = Math.sqrt(
                                    Math.pow(initialOpp.x - initialAnchor.cx, 2) + Math.pow(initialOpp.y - initialAnchor.cy, 2)
                                );

                                obj[oppositeType].x = anchorX - (dx / distanceActive) * lenOpp;
                                obj[oppositeType].y = anchorY - (dy / distanceActive) * lenOpp;
                            } else {
                                const oppositeType = isDraggingIn ? 'out' : 'in';
                                obj[oppositeType].x = anchorX;
                                obj[oppositeType].y = anchorY;
                            }
                        } else {
                            if (type === 'in' && obj.in) {
                                obj.in.x = initialPosRef.current.in.x + deltaX
                                obj.in.y = initialPosRef.current.in.y + deltaY
                            }
                            if (type === 'out' && obj.out) {
                                obj.out.x = initialPosRef.current.out.x + deltaX
                                obj.out.y = initialPosRef.current.out.y + deltaY
                            }
                        }
                    }
                }
            }
            onDrag?.(id, { points: dotsArr })
        }
    }

    const handlePointerUp = (e) => {
        if (isDragging) {
            setIsDragging(false)

            e.currentTarget.releasePointerCapture?.(e.pointerId)
        }
    }

    const vertexArr = []
    const guideLinesArr = []
    let dotsIndex = 0
    const lastIndex = dotsArr.filter(obj => obj.command.toUpperCase() !== 'Z').length - 1
    for (const obj of dotsArr) {
        if (obj.command.toUpperCase() === 'Z') {
            dotsIndex++
            continue
        }
        const vType = obj.type
        vertexArr.push([obj.x, obj.y])
        if (obj.out && dotsIndex !== lastIndex) {
            guideLinesArr.push([obj.out.x, obj.out.y, 'out', vType, dotsIndex])
        }
        if (obj.in) {
            guideLinesArr.push([obj.in.x, obj.in.y, 'in', vType, dotsIndex])
        }
        dotsIndex++
    }

    return (
        <>
            {vertexArr.map((vertex, index) => {
                return (
                    <ellipse
                        key={`${id}-vertex-${index}`}
                        id={`${id}-vertex-${index}`}
                        className={style.DraggableDot}
                        cx={vertex[0]}
                        cy={vertex[1]}
                        rx={5}
                        ry={5}
                        fill={index === 0 ? 'red' : index === vertexArr.length - 1 ? 'green' : 'currentColor'}
                        stroke={'transparent'}
                        strokeWidth={0}


                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        onContextMenu={(e) => handleContextMenu(e)}
                    />
                )
            }
            )}
            {guideLinesArr.map((dot, index) => {
                if (dot.at(-2) !== 'line') {
                    return (
                        <ellipse
                            key={`${id}-vNum=${dot.at(-1)}-guideLine-${dot[2]}-${index}`}
                            id={`${id}-vNum=${dot.at(-1)}-guideLine-${dot[2]}-${index}`}
                            className={style.DraggableDot}
                            cx={dot[0]}
                            cy={dot[1]}
                            rx={5}
                            ry={5}
                            fill={'brown'}
                            stroke={'transparent'}
                            strokeWidth={0}


                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerUp}
                            onContextMenu={(e) => e.preventDefault()}
                        />
                    )
                }
            })
            }
        </>
    )
}