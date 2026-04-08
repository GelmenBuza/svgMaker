export default function scalePoints(points, scaleX, scaleY, cx, cy) {
    const sx = Number.isFinite(scaleX) ? scaleX : 1;
    const sy = Number.isFinite(scaleY) ? scaleY : 1;

    return points.map((p) => {
        const nextPoint = {
            ...p,
            x: cx + (p.x - cx) * sx,
            y: cy + (p.y - cy) * sy
        };
        if (p.in) {
            nextPoint.in = {
                x: cx + (p.in.x - cx) * sx,
                y: cy + (p.in.y - cy) * sy
            };
        };
        if (p.out) {
            nextPoint.out = {
                x: cx + (p.out.x - cx) * sx,
                y: cy + (p.out.y - cy) * sy
            };
        };
        return nextPoint
    })
}