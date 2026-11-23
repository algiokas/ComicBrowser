import { useEffect } from "react";

export interface useGalleryNavigationOptions {
    currentPage: number,
    totalPages: number,
    setPage: (pageNum: number) => void,
    isEnabled: boolean
}

export function useGalleryNavigation({
    currentPage, totalPages, setPage, isEnabled = true
}: useGalleryNavigationOptions) {
    useEffect(() => {
        if (!isEnabled) return;

        const handleKeyDown = (e: KeyboardEvent): void => {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                setPage(Math.min(currentPage + 1, totalPages - 1));
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setPage(Math.max(currentPage - 1, 0));
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown)

    }, [totalPages, setPage, isEnabled])
}