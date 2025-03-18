import { useState, useRef } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { ThemeSwitcher } from '@toolpad/core/DashboardLayout';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GamesIcon from '@mui/icons-material/Games';
import AddModal from '@/components/AddModal';
import SortModal from '@/components/SortModal';
import FilterModal from '@/components/FilterModal';
import { Link } from 'react-router';
import { useStore } from '@/store';
import { invoke } from '@tauri-apps/api/core';

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
    const { selectedGameId, getGameById } = useStore();

    const handleStartGame = async () => {
        if (!selectedGameId) {
            console.error('未选择游戏');
            return;
        }

        try {

            const selectedGame = await getGameById(selectedGameId);
            if (!selectedGame || !selectedGame.localpath) {
                console.error('游戏路径未找到');
                return;
            }

            // 调用Rust后端启动游戏
            await invoke('launch_game', {
                gamePath: selectedGame.localpath,
            });
        } catch (error) {
            console.error('游戏启动失败:', error);
            // 这里可以添加错误提示UI
        }
    }

    return (
        <>
            <Button startIcon={<PlayArrowIcon />}
                onClick={handleStartGame}
                disabled={!selectedGameId} // 当没有选择游戏时禁用按钮
            >
                启动游戏
            </Button>
            <AddModal />
            <SortModal />
            <FilterModal />
        </>
    );
}
