import {useMemo, useState} from 'react'
import './App.css'
import DraggableRect from "./components/DraggableRect.jsx";
import DraggableLine from "./components/DraggableLine.jsx";
import DraggableCircle from "./components/DraggableCircle.jsx";
import DraggablePolyline from "./components/DraggablePolyline.jsx";
import DraggablePolygon from "./components/DraggablePolygon.jsx";


const SVG = ({ell, svgWidth}) => {
    return (
        <svg
            width={`${svgWidth}px`}
            viewBox={`0 0 ${svgWidth} ${svgWidth}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            {ell}
        </svg>
    )
}

const generateSVGCode = (elements, svgWidth) => {
    const ell = elements.map(el => {
        const type_ell = el.props.id.split('_')[0]
        switch (type_ell) {
            case 'rectangle':
                return `    <rect x="${el.props.x}" y="${el.props.y}" width="${el.props.width}" height="${el.props.height}"${el.props.rx ? ` rx="${el.props.rx}"` : ''}${el.props.ry ? ` ry="${el.props.ry}"` : ''} fill="${el.props.fill}"${el.props.stroke ? ` stroke="${el.props.stroke}"` : ''}${el.props.strokeWidth ? ` stroke-width="${el.props.strokeWidth}"` : ''}/>`;
            case 'line':
                return `    <line x1="${el.props.x1}" y1="${el.props.y1}" x2="${el.props.x2}" y2="${el.props.y2}"${el.props.stroke ? ` stroke="${el.props.stroke}"` : ''}${el.props.strokeWidth ? ` stroke-width="${el.props.strokeWidth}"` : ''}/>`
            case 'ellipse':
                return `    <ellipse cx="${el.props.cx}" cy="${el.props.cy}" rx="${el.props.rx}" ry="${el.props.ry ? el.props.ry : el.props.rx}" fill="${el.props.fill}"${el.props.stroke ? ` stroke="${el.props.stroke}"` : ''}${el.props.strokeWidth ? ` stroke-width="${el.props.strokeWidth}"` : ''}/>`
            case 'polyline':
                return `    <polyline points="${el.props.points}" fill="${el.props.fill}" stroke="${el.props.stroke}" stroke-width="${el.props.strokeWidth}" />`
            case 'polygon':
                return `    <polygon points="${el.props.points}" fill="${el.props.fill}" stroke="${el.props.stroke}" stroke-width="${el.props.strokeWidth}" />`
        }
    }).join('\n')

    return `<svg width="${svgWidth}" viewBox="0 0 ${svgWidth} ${svgWidth}" xmlns="http://www.w3.org/2000/svg">\n${ell}\n</svg>`
}

function App() {
    const [svgWidth, setSvgWidth] = useState(500)
    const [elements, setElements] = useState([])
    const [counter, setCounter] = useState(0)

    const svgCode = useMemo(() => generateSVGCode(elements, svgWidth), [elements, svgWidth])

    const coordinatesToString = (coordinates) => {
        let result = ''
        for (const key of Object.keys(coordinates.points)) {
            result += `${coordinates.points[key].x},${coordinates.points[key].y} `
        }
        return result.trim()
    }

    const handleElementDrag = (id, coordinates) => {
        setElements(prev => prev.map(ell => {
            if (ell.key === id) {
                const ellType = id.split('_')[0]
                switch (ellType) {
                    case 'rectangle':
                        return {
                            ...ell,
                            props: {
                                ...ell.props,
                                x: coordinates.x,
                                y: coordinates.y,
                            }
                        }
                    case 'line':
                        return {
                            ...ell,
                            props: {
                                ...ell.props,
                                x1: coordinates.x1,
                                y1: coordinates.y1,
                                x2: coordinates.x2,
                                y2: coordinates.y2,

                            }
                        }
                    case 'ellipse':
                        return {
                            ...ell,
                            props: {
                                ...ell.props,
                                cx: coordinates.cx,
                                cy: coordinates.cy,
                            }
                        }
                    case 'polyline':
                        return {
                            ...ell,
                            props: {
                                ...ell.props,
                                points: coordinatesToString(coordinates),
                            }
                        }
                    case 'polygon':
                        return {
                            ...ell,
                            props: {
                                ...ell.props,
                                points: coordinatesToString(coordinates),
                            }
                        }
                }
            }
            return ell;
        }))
    }


    const addRectangle = () => {
        const id = `rectangle_${counter}`

        const newRect = (
            <DraggableRect
                key={id}
                id={id}
                x={0}
                y={0}
                rx={10}
                ry={10}
                width={50}
                height={50}
                fill={'white'}
                stroke={'black'}

                onDrag={handleElementDrag}
            />
        )

        setElements((prev) => [...prev, newRect])
        setCounter(counter + 1)
    }

    const addLine = () => {
        const id = `line_${counter}`
        const newLine = (
            <DraggableLine
                key={id}
                id={id}
                x1={0}
                y1={0}
                x2={50}
                y2={50}
                stroke={'white'}
                strokeWidth={1}

                onDrag={handleElementDrag}
            />
        )

        setElements((prev) => [...prev, newLine])
        setCounter(counter + 1)
    }

    const addCircle = () => {
        const id = `ellipse_${counter}`

        const newCircle = (
            <DraggableCircle
                key={id}
                id={id}
                cx={50}
                cy={50}
                rx={10}
                fill={'white'}
                stroke={'black'}

                onDrag={handleElementDrag}
            />
        )
        setElements((prev) => [...prev, newCircle])
        setCounter(counter + 1)
    }

    const addPolygon = () => {
        const id = `polygon_${counter}`

        const newPolygon = (
            <DraggablePolygon
                key={id}
                id={id}
                points={`0,100 50,50 100,100`}
                fill={'none'}
                stroke={'white'}
                strokeWidth={1}

                onDrag={handleElementDrag}
            />
        )
        setElements((prev) => [...prev, newPolygon])
        setCounter(counter + 1)
    }

    const addPolyline = () => {
        const id = `polyline_${counter}`

        const newPolyline = (
            <DraggablePolyline
                key={id}
                id={id}
                points={`0,100 50,50 100,100`}
                fill={'none'}
                stroke={'white'}
                strokeWidth={1}

                onDrag={handleElementDrag}
            />
        )
        setElements((prev) => [...prev, newPolyline])
        setCounter(counter + 1)
    }

    return (
        <div className="main-container">
            <button onClick={() => addRectangle()}>Rectangle</button>

            <button onClick={() => addLine()}>Line</button>

            <button onClick={() => addCircle()}>Circle</button>

            <button onClick={() => addPolygon()}>polygon</button>

            <button onClick={() => addPolyline()}>polyline</button>

            <SVG ell={elements} svgWidth={svgWidth}/>

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
    )
}

export default App
