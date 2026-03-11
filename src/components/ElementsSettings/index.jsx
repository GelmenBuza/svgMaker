import {elementsStore} from "../../stores/elementsStore.jsx";
import {useEffect, useState} from "react";


export default function ElementSettings () {
    const {customizableElement, elements, updateElements} = elementsStore()

    const element = elements.find(el => el.props?.id === customizableElement);

    if(element?.props) return null;

    const handleChange = (field, value) => {
        const numValue = Math.max(0, parseInt(value) || 0);

        updateElements(prev => prev.map(el =>
            el.props?.id === customizableElement
                ? { ...el, props: { ...el.props, [field]: numValue } }
                : el
        ));
    }

    return (
        <div className="settings" id={customizableElement.props.id}>
            <label htmlFor="">
                <input type="number" min={0} value={element.props.width || 0} onChange={(e) => handleChange('width', e.target.value)} />
            </label>
            <label htmlFor="">
                <input type="number" min={0} value={element.props.height || 0} onChange={(e) => handleChange('height', e.target.value)} />
            </label>
        </div>
    )
}