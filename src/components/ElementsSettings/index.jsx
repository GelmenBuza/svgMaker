import {elementsStore} from "../../stores/elementsStore.jsx";
import style from "./style.module.css";
import parsePathData from "../../utils/parsePathData.js";
import getCenterPath from "../../utils/getCenterPath.js";
import rotatePoints from "../../utils/rotatePoints.js";
import pointsArrToString from "../../utils/pointsArrToString.js";

export default function ElementSettings() {
    const {customizableElementId, elements, updateElements, setCustomizableElement} = elementsStore()

    const element = elements.find(el => el?.id === customizableElementId);

    if (!element) return null;

    const rotation = element?.rotate ?? 0;

    const element_type = element.id.split("_")[0]

    const handleChange = (field, value) => {
        if (!element) return;
        let newValue
        if (field === "rotate") {
            newValue = Math.max(0, Math.min(360, parseInt(value) || 0));
            handleAngleChange(element.id, newValue);
            return;
        }

        if (["fill", "stroke"].includes(field)) {
            newValue = value
        } else if (field === "strokeWidth") {
            newValue = Math.max(0, parseInt(value) || 0);
        } else {
            newValue = value
        }
        updateElements(element.id, {
                ...element,
                [field]: newValue,
            }
        );
    }

    const handleAngleChange = (id, newAngel) => {
        const targetElement = elements.find(el => el?.id === id);
        if (!targetElement || !targetElement.d) return;

        if (newAngel === 0 && (targetElement.rotate ?? 0) === 0) return;

        const points = parsePathData(targetElement.d);
        if (points.length === 0) return;

        const [cx, cy] = getCenterPath(points)

        const currentRotation = targetElement.rotate ?? 0;
        const deltaAngle = newAngel - currentRotation;

        if (deltaAngle === 0) {
            updateElements([{...targetElement, rotate: newAngel}]);
            return;
        }

        const rotatedPoints = rotatePoints(points, deltaAngle, cx, cy)

        const newD = pointsArrToString(rotatedPoints)

        updateElements(element.id, {
                ...targetElement,
                d: newD,
                rotate: 0,
            }
        )
    }

    return (
        <div className={style.settings} id={customizableElementId}>
            <label htmlFor="">
                Rotate:
                <input type="number" min={0} max={360} value={rotation}
                       onChange={(e) => handleChange('rotate', e.target.value)}/>
            </label>
            <label htmlFor="">
                Fill:
                <input type="color" value={element.fill ?? "#000000"}
                       onChange={(e) => handleChange('fill', e.target.value)}/>
            </label>
            <label htmlFor="">
                Stroke:
                <input type="color" value={element.stroke ?? "#000000"}
                       onChange={(e) => handleChange('stroke', e.target.value)}/>
            </label>
            <label htmlFor="">
                Stroke width:
                <input type="number" min={0} value={element.strokeWidth ?? 0}
                       onChange={(e) => handleChange('strokeWidth', e.target.value)}/>
            </label>
        </div>
    )
}