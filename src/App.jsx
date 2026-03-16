import {useMemo, useState} from 'react'
import './App.css'
import DraggableRect from "./components/DraggableRect.jsx";
import DraggableLine from "./components/DraggableLine.jsx";
import DraggableCircle from "./components/DraggableCircle.jsx";
import DraggablePolyline from "./components/DraggablePolyline.jsx";
import DraggablePolygon from "./components/DraggablePolygon.jsx";
import ElementSettings from "./components/ElementsSettings/index.jsx";
import {elementsStore} from "./stores/elementsStore.jsx";
import DraggablePath from "./components/tmpDragPath.jsx";
import DraggableSettings from "./components/tmpDragSet.jsx";


const SVG = ({ell, svgWidth}) => {
    const {customizableElementId, updateElements} = elementsStore()
    return (
        <svg
            className={'svg-area'}
            width={`${svgWidth}px`}
            viewBox={`0 0 ${svgWidth} ${svgWidth}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            {customizableElementId &&
                <DraggableSettings key={`dragSettings-${customizableElementId}`} id={customizableElementId}
                                   onDrag={updateElements}
                                   onRotateCommit={updateElements}
                />}
            {ell}
        </svg>
    )
}

const generateSVGCode = (elements, svgWidth) => {
    const ell = elements.map(el => {
        const type_ell = el.id.split('_')[0]
        switch (type_ell) {
            case 'path': {
                return `    <path d="${el.d}" fill="${el.fill}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" />`;
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

    const addPath = () => {
        const id = `path_${counter}`

        const newPathData = {
            id: id,
            type: 'path',
            d: "M 10,90 C 30,90 25,10 50,10 S 70,90 90,90",
            fill: '#ffffff',
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

    const renderedElements = useMemo(() => {
        return elements.map(el => {
            const type = el.type || el.id?.split('_')[0]

            const commonProps = {
                id: el.id,
                openSettings: openSettings,
                onDrag: updateElements,
                onDragEnd: () => {
                },
                onRotateCommit: updateElements
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
                    </div>


                    <SVG ell={renderedElements} svgWidth={areaWidth}/>

                    <h2 style={{cursor: 'pointer', fontWeight: 'bold'}}>SVG код</h2>
                    <pre style={{
                        textAlign: 'left',
                        background: '#1e1e1e',
                        color: '#d4d4d4',
                        padding: '15px',
                        borderRadius: '6px',
                        overflow: 'auto',
                        fontSize: '13px',
                        lineHeight: '1.4'
                    }}>
                        <code>
                            {svgCode}
                        </code>
                    </pre>
                </div>
            </div>

            {customizableElementId && <ElementSettings/>}
        </>
    )
}

export default App
