import { useState, useRef } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { ThemeSwitcher } from '@toolpad/core/DashboardLayout';
// import { useLocation } from 'react-router';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddModal from '@/components/AddModal';
import SortModal from '@/components/SortModal';
import FilterModal from '@/components/FilterModal';

export const useModal = () => {
    const [isopen, setisopen] = useState(false);
    const previousFocus = useRef<HTMLElement | null>(null);
    const handleOpen = () => {
        // Store the currently focused element before opening modal
        previousFocus.current = document.activeElement as HTMLElement;
        setisopen(true);
    };
    const handleClose = () => {
        setisopen(false);
        // Return focus to the previous element after modal closes
        if (previousFocus.current) {
            previousFocus.current.focus();
        }
    };
    return { isopen, handleOpen, handleClose };
}

export const Toolbars = () => {
    return (
        <Stack direction="row">
            <Buttongroup />
            <ThemeSwitcher />
        </Stack>
    );
}
export const Toolbarsswitch = (path: string) => {
    return (
        (path === "/libraries")
    );
}
const Buttongroup = () => {
    // const location = useLocation();
    // const pagepath = location.pathname;

    return (
        <>
            <Button startIcon={<PlayArrowIcon />}>启动游戏</Button>
            <AddModal />
            <SortModal />
            <FilterModal />
            {/* {pagepath !== '/' &&
                <div>
                    <Button startIcon={<PlayArrowIcon />}>启动游戏</Button>
                    <AddModal />
                    <SortModal />
                    <FilterModal />
                </div>
            } */}
        </>
    );
}
