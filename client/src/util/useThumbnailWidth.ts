import { useLayoutEffect, useState, type RefObject } from "react";
import { snapThumbnailWidth } from "../api/urls";

/**
 * Measures the rendered width of the referenced element and returns the
 * device-pixel width to request a thumbnail at, snapped to a supported bucket.
 * Returns 0 until the element has been measured.
 *
 * The value only changes when the measurement crosses a bucket boundary, so
 * consumers can safely use it to build an image src without causing a reload on
 * every pixel of a resize. Measurement runs before paint (useLayoutEffect) so
 * the first painted <img> already requests the correct size - no full-res flash
 * - and a ResizeObserver keeps it in sync as the responsive layout reflows.
 */
export function useThumbnailWidth(ref: RefObject<HTMLElement | null>): number {
    const [width, setWidth] = useState(0)

    useLayoutEffect(() => {
        const el = ref.current
        if (!el) return

        const measure = () => {
            const cssWidth = el.clientWidth
            if (cssWidth > 0) {
                setWidth(snapThumbnailWidth(cssWidth * (window.devicePixelRatio || 1)))
            }
        }

        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(el)
        return () => observer.disconnect()
    }, [ref])

    return width
}
