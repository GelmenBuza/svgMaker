import {elementsStore} from "../../stores/elementsStore.jsx";
import {useEffect, useState} from "react";


export default function ElementsSettings ({ell}) {
    const {selected} = elementsStore()
    console.log(ell)
    const [width, setWidth] = useState('')
    const [height, setHeight] = useState('')

    return (
        <div className="settings">
            {selected.map(id => {
                const type = id.split('_')[0]
                switch(type) {
                    case 'rectangle':
                        // onSubmit={(e) => onResize(e, id, +width, +height)}
                        return (
                            <form>
                                <p>{id}</p>
                                <label>
                                    width:
                                    <input type="text" value={width} onChange={(e) => setWidth(e.target.value)} />
                                </label>
                                <label>
                                    height:
                                    <input type="text" value={height} onChange={(e) => setHeight(e.target.value)} />
                                </label>
                                <button type="submit">Submit</button>
                            </form>
                        )
                }}

                )
            }
        </div>
    )
}