import { useState, useRef } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { ThemeSwitcher } from '@toolpad/core/DashboardLayout';
// import { useLocation } from 'react-router';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GamesIcon from '@mui/icons-material/Games';
import AddModal from '@/components/AddModal';
import SortModal from '@/components/SortModal';
import FilterModal from '@/components/FilterModal';
import { Link } from 'react-router';


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
export const ToLibraries = () => {
    return (
        <>
            <Link className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer no-underline text-blue visited:text-blue"
                to={'/libraries'}>
                <GamesIcon />
                <span>返回游戏库</span>
            </Link >
            <ThemeSwitcher />
        </>
    );
}

const Buttongroup = () => {
    return (
        <>
            <Button startIcon={<PlayArrowIcon />}>启动游戏</Button>
            <AddModal />
            <SortModal />
            <FilterModal />
        </>
    );
}
