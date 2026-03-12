import {elementsStore} from "../../stores/elementsStore.jsx";
import style from "./style.module.css";

export default function ElementSettings() {
    const {customizableElementId, elements, updateElements, setCustomizableElement} = elementsStore()

    const element = elements.find(el => el.props?.id === customizableElementId);

    if (!element) return null;
    const rotation = element.props?.rotate ?? 0;

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
                Rotate:
                <input type="number" min={0} max={360} value={rotation}
                       onChange={(e) => handleChange('rotate', e.target.value)}/>
            </label>
            <label htmlFor="">
                Fill:
                <input type="color" value={element.props.fill ?? 0}
                       onChange={(e) => handleChange('fill', e.target.value)}/>
            </label>
            <label htmlFor="">
                Stroke:
                <input type="color" value={element.props.stroke ?? 0}
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