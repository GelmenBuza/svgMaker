import {elementsStore} from "../../stores/elementsStore.jsx";
import style from "./style.module.css";

export default function ElementSettings() {
    const {customizableElementId, elements, updateElements, setCustomizableElement, areaWidth} = elementsStore()

    const element = elements.find(el => el.props?.id === customizableElementId);

    if (!element) return null;
    const rotation = element.props?.rotate ?? 0;
    const element_type = element.props.id.split("_")[0]

    const handleChange = (field, value) => {
        let numValue
        if (field === "rotate") {
            numValue = Math.max(0, Math.min(360, parseInt(value) || 0));
        } else if (["fill", "stroke"].includes(field)) {
            numValue = value
        } else {
            numValue = Math.max(0, parseInt(value) || 0);
        }
        updateElements(prev => prev.map(el =>
            el.props?.id === customizableElementId
                ? {...el, props: {...el.props, [field]: numValue}}
                : el
        ));
    }

    return (
        <div className={style.settings} id={customizableElementId}>
            {element_type === 'rectangle' && (
                <>
                    <label htmlFor="">
                        Width:
                        <input type="number" min={0} value={element.props.width ?? 0}
                               onChange={(e) => handleChange('width', e.target.value)}/>
                    </label>
                    <label htmlFor="">
                        Height:
                        <input type="number" min={0} value={element.props.height ?? 0}
                               onChange={(e) => handleChange('height', e.target.value)}/>
                    </label>
                </>
            )}
            {element_type === 'circle' && (
                <>
                    <label htmlFor="">
                        cx:
                        <input type="number" min={0} value={element.props.cx ?? 0}
                               onChange={(e) => handleChange('cx', e.target.value)}/>
                    </label>
                    <label htmlFor="">
                        cy:
                        <input type="number" min={0} value={element.props.cy ?? 0}
                               onChange={(e) => handleChange('cy', e.target.value)}/>
                    </label>
                </>
            )}
            {element_type === 'line' && (
                <>
                    <label htmlFor="">
                        x1:
                        <input type="number" min={0} max={areaWidth} value={element.props.x1 ?? 0}
                               onChange={(e) => handleChange('x1', e.target.value)}/>
                    </label>
                    <label htmlFor="">
                        y1:
                        <input type="number" min={0} max={areaWidth} value={element.props.y1 ?? 0}
                               onChange={(e) => handleChange('y1', e.target.value)}/>
                    </label>
                    <label htmlFor="">
                        x2:
                        <input type="number" min={0} max={areaWidth} value={element.props.x2 ?? 0}
                               onChange={(e) => handleChange('x2', e.target.value)}/>
                    </label>
                    <label htmlFor="">
                        y2:
                        <input type="number" min={0} max={areaWidth} value={element.props.y2 ?? 0}
                               onChange={(e) => handleChange('y1', e.target.value)}/>
                    </label>
                </>
            )}
            {element_type !== 'line' && (
                <>
                    <label htmlFor="">
                        rx:
                        <input type="number" min={0} value={element.props.rx ?? 0}
                               onChange={(e) => handleChange('rx', e.target.value)}/>
                    </label>
                    <label htmlFor="">
                        ry:
                        <input type="number" min={0} value={element.props.ry ?? 0}
                               onChange={(e) => handleChange('ry', e.target.value)}/>
                    </label>
                    <label htmlFor="">
                        Fill:
                        <input type="color" value={element.props.fill ?? "#ffffff"}
                               onChange={(e) => handleChange('fill', e.target.value)}/>
                    </label>
                </>
            )}

            <label htmlFor="">
                Rotate:
                <input type="number" min={0} max={360} value={rotation}
                       onChange={(e) => handleChange('rotate', e.target.value)}/>
            </label>

            <label htmlFor="">
                Stroke:
                <input type="color" value={element.props.stroke ?? "#000000"}
                       onChange={(e) => handleChange('stroke', e.target.value)}/>
            </label>
            <label htmlFor="">
                Stroke width:
                <input type="number" min={0} value={element.props.strokeWidth ?? 0}
                       onChange={(e) => handleChange('strokeWidth', e.target.value)}/>
            </label>
        </div>
    )
}