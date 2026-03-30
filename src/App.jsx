import {useEffect, useMemo, useRef, useState} from 'react'
import './App.css'
import ElementSettings from "./components/ElementsSettings/index.jsx";
import {elementsStore} from "./stores/elementsStore.jsx";
import DraggablePath from "./components/DraggablePath.jsx";
import DraggableSettings from "./components/DraggableSettings.jsx";
import DraggableDots from "./components/DraggableDots";
import CustomContextMenu from "./components/CustomContextMenu/index.jsx";
import parsePathData from "./utils/parsePathData.js";


const SVG = ({ell, svgWidth, handleContextMenu, onSvgClick, isTrackingMode}) => {
    const {customizableElementId, updateElements} = elementsStore()
    const svgRef = useRef(null)

    const handleClick = (e) => {
        if (!isTrackingMode || !onSvgClick) return;

        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        onSvgClick(x, y);
    }

    return (
        <svg
            ref={svgRef}
            className={'svg-area'}
            width={`${svgWidth}px`}
            viewBox={`0 0 ${svgWidth} ${svgWidth}`}
            xmlns="http://www.w3.org/2000/svg"

            onClick={handleClick}
            style={{cursor: isTrackingMode ? 'crosshair' : 'default'}}
        >
            {customizableElementId &&
                <DraggableSettings key={`dragSettings-${customizableElementId}`} id={customizableElementId}
                                   onDrag={updateElements}
                                   onRotateCommit={updateElements}
                />}
            {ell}
            <DraggableDots key={`dragDots-${customizableElementId}`} id={customizableElementId} onDrag={updateElements}
                           handleContextMenu={handleContextMenu}/>
        </svg>
    )
}

const generateSVGCode = (elements, svgWidth) => {
    const ell = elements.map(el => {
        const type_ell = el.id.split('_')[0]
        switch (type_ell) {
            case 'path': {
                return `    <path \n\td="${el.d}"\n\tfill="${el.fill}"\n\tstroke="${el.stroke}"\n\tstroke-width="${el.strokeWidth}"/>`;
            }
            default:
                console.warn(`Unknown element type: ${type_ell}`)
        }
    }).join('\n')

    return `<svg width="${svgWidth}" viewBox="0 0 ${svgWidth} ${svgWidth}" xmlns="http://www.w3.org/2000/svg">\n${ell}\n</svg>`
}


function App() {
    const {
        areaWidth,
        elements,
        updateElements,
        customizableElementId,
        setCustomizableElement,
    } = elementsStore()
    const [counter, setCounter] = useState(0)
    const [menu, setMenu] = useState(null)
    const menuRef = useRef(null)

    const [isTrackingMode, setIsTrackingMode] = useState(false)
    const [activeDIYPathId, setActiveDIYPathId] = useState(null)

    const handleContextMenu = (e) => {
        e.preventDefault()
        setMenu({x: e.clientX, y: e.clientY, id: e.currentTarget.id, svg: e.currentTarget.ownerSVGElement})
    }

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenu(null)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    const addPath = () => {
        const id = `path_${counter}`
        // d: "M 10,90 C 30,90 25,10 50,10 S 70,90 90,90",
        // d: "M 20,20 C 20,20 20,20 100,20 L 100,100 C 100,100 100,100 20,100 C 20,100 20,100 20,20 Z",
        const d = "M 20,20 C 35,20 85,20 100,20 C 100,35 100,85 100,100 C 85,100 35,100 20,100 C 20,85 20,35 20,20 Z"

        const newPathData = {
            id: id,
            type: 'path',
            d,
            points: parsePathData(d),
            fill: 'transparent',
            stroke: '#000000',
            strokeWidth: 1,
            rotate: 0
        }

        updateElements((prev) => [...prev, newPathData])
        setCounter(prev => prev + 1)
    }

    const openSettings = (id) => {
        console.log("+")
        setCustomizableElement(id)
    }

    const handlePath = () => {
        const id = `path_${counter}`

        const newPathData = {
            id: id,
            type: 'path',
            d: '',
            points: [],
            fill: 'transparent',
            stroke: '#000000',
            strokeWidth: 2,
            rotate: 0,
            isDIY: true
        }

        updateElements((prev) => [...prev, newPathData])
        // setCustomizableElement(id)
        setActiveDIYPathId(id)
        setIsTrackingMode(true)
        setCounter(prev => prev + 1)
    }

    const handleSvgClick = (x, y) => {
        if (!isTrackingMode || !activeDIYPathId) return;

        const currentPath = elements.find(el => el.id === activeDIYPathId);
        if (!currentPath) return;

        let newPoints = [...(currentPath.points || [])];
        let newD = '';

        if (newPoints.length === 0) {
            const newPoint = {
                x, y,
                command: 'M',
                out: {x, y}
            };
            newPoints.push(newPoint);
            newD = `M ${x} ${y}`;

        } else {
            const lastIdx = newPoints.length - 1;
            const prevPoint = newPoints[lastIdx];

            newPoints[lastIdx] = {
                ...prevPoint,
                out: {x: prevPoint.x, y: prevPoint.y}
            };

            const newPoint = {
                x, y,
                command: 'C',
                in: {x, y},
                out: {x, y}
            };
            newPoints.push(newPoint);

            newD = currentPath.d + ` C ${prevPoint.out.x} ${prevPoint.out.y}, ${newPoint.in.x} ${newPoint.in.y}, ${x} ${y}`;
        }

        updateElements(prev => prev.map(el =>
            el.id === activeDIYPathId
                ? { ...el, d: newD, points: newPoints }
                : el
        ));
    }

    const toggleTrackingMode = () => {
        setIsTrackingMode(prev => !prev);
        if (isTrackingMode) {
            setActiveDIYPathId(null);
        }
    }

    const renderedElements = useMemo(() => {
        return elements.map(el => {
            const type = el.type || el.id?.split('_')[0]

            const commonProps = {
                id: el.id,
                openSettings: openSettings,
                onDrag: updateElements,
                onDragEnd: () => {
                },
                handleContextMenu: handleContextMenu,
            }

            switch (type) {
                case 'path':
                    return (
                        <DraggablePath
                            key={el.id}
                            {...commonProps}
                            d={el.d}
                            fill={el.fill}
                            stroke={el.stroke}
                            strokeWidth={el.strokeWidth}
                            rotate={el.rotate}
                        />
                    )
                default:
                    return null
            }
        })
    }, [elements, updateElements])

    const svgCode = useMemo(() => generateSVGCode(elements, areaWidth), [elements, areaWidth]);

    return (
        <>
            <div className="main-container">
                <div className="svg-container">
                    <div className='create-btn'>
                        <button onClick={() => addPath()}>Path</button>
                        <button
                            onClick={isTrackingMode && activeDIYPathId ? toggleTrackingMode : handlePath}
                            style={{
                                backgroundColor: isTrackingMode && activeDIYPathId ? '#4CAF50' : 'inherit',
                                color: isTrackingMode && activeDIYPathId ? 'white' : 'inherit',
                                border: isTrackingMode && activeDIYPathId ? '2px solid #4CAF50' : '1px solid #ccc'
                            }}
                            title={isTrackingMode ? "Кликните по SVG для добавления точек. Нажмите для завершения." : "Создать новый путь в режиме рисования"}
                        >
                            {isTrackingMode && activeDIYPathId ? '✓ Finish DIY' : 'DIY'}
                        </button>
                    </div>


                    <SVG ell={renderedElements}
                         svgWidth={areaWidth}
                         handleContextMenu={handleContextMenu}
                         onSvgClick={handleSvgClick}
                         isTrackingMode={isTrackingMode}
                    />

                    <h2 style={{cursor: 'pointer', fontWeight: 'bold'}}>SVG код</h2>
                    <pre style={{
                        textAlign: 'left',
                        background: '#1e1e1e',
                        color: '#d4d4d4',
                        padding: '15px',
                        borderRadius: '6px',
                        overflow: 'auto',
                        fontSize: '13px',
                        lineHeight: '1.4',
                        maxWidth: "60vw",
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                    }}>
                        <code>
                            {svgCode}
                        </code>
                    </pre>
                </div>
            </div>
            {menu && (<CustomContextMenu data={{menuRef, menu}}/>)}
            {customizableElementId && <ElementSettings/>}
        </>
    )
}

export default App
