import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArticleIcon from '@mui/icons-material/Article';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useStore } from '@/store';
import { handleOpenFolder } from '@/utils';
import { AlertDeleteBox } from '@/components/AlertBox';
import { useTranslation } from 'react-i18next'; // 引入国际化hook
import { isTauri } from '@tauri-apps/api/core';
import { useGamePlayStore } from '@/store/gamePlayStore';

interface RightMenuProps {
    isopen: boolean;
    anchorPosition?: { top: number; left: number };
    setAnchorEl: (value: null) => void;
    id: number | null | undefined;
}

const RightMenu: React.FC<RightMenuProps> = ({ isopen, anchorPosition, setAnchorEl, id }) => {
    const { getGameById, deleteGame, useIsLocalGame } = useStore();
    const { launchGame, isGameRunning } = useGamePlayStore();
    const [openAlert, setOpenAlert] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { t } = useTranslation(); // 使用翻译函数

    // 检查这个特定游戏是否在运行
    const isThisGameRunning = isGameRunning(id === null ? undefined : id);

    // 确定是否可以启动游戏
    const canUse = () => {
        if (id !== undefined && id !== null)
            return isTauri() && useIsLocalGame(id) && !isThisGameRunning;
    }



    useEffect(() => {
        const handleInteraction = () => {
            setAnchorEl(null);
        };

        if (isopen) {
            // 添加全局事件监听
            document.addEventListener('click', handleInteraction);
            document.addEventListener('scroll', handleInteraction, true);
            window.addEventListener('resize', handleInteraction);
        }

        return () => {
            // 清理事件监听
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('scroll', handleInteraction, true);
            window.removeEventListener('resize', handleInteraction);
        };
    }, [isopen, setAnchorEl]);
    if (!isopen) return null;

    const menuStyle = {
        top: `min(${anchorPosition?.top ?? 0}px, calc(100vh - 14rem))`,
        left: anchorPosition?.left ?? 0,
    };

    const handleDeleteGame = async () => {
        if (!id) return;

        try {
            setIsDeleting(true);
            setAnchorEl(null); // 关闭菜单
            await deleteGame(id);
        } catch (error) {
            console.error('删除游戏失败:', error);
            // 可以添加错误提示
        } finally {
            setAnchorEl(null); // 关闭菜单
            setIsDeleting(false);
            setOpenAlert(false);
        }
    }

    const handleStartGame = async () => {
        if (!id) return;

        try {
            const selectedGame = await getGameById(id);
            if (!selectedGame || !selectedGame.localpath) {
                console.error(t('components.LaunchModal.gamePathNotFound'));
                return;
            }

            // 使用游戏启动函数
            await launchGame(selectedGame.localpath, id);
        } catch (error) {
            console.error(t('components.LaunchModal.launchFailed'), error);
        }
    };

    return (
        <div
            className="fixed z-50 animate-fade-in animate-duration-200 select-none"
            style={menuStyle}
            onClick={(e) => e.stopPropagation()}
        >
            <AlertDeleteBox open={openAlert} setOpen={setOpenAlert} onConfirm={handleDeleteGame} isLoading={isDeleting} />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg min-w-[200px] py-1 border border-gray-200 dark:border-gray-700">
                <div
                    className={`flex items-center px-4 py-2 text-black dark:text-white ${canUse()
                        ? 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                        }`}
                    onClick={() => {
                        handleStartGame();
                        setAnchorEl(null);
                    }}
                >
                    <PlayCircleOutlineIcon className="mr-2" />
                    <span>{t('components.RightMenu.startGame')}</span>
                </div>
                <Link
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer no-underline text-black dark:text-white visited:text-black dark:visited:text-white"
                    to={`/libraries/${id}`}>
                    <ArticleIcon className="mr-2" />
                    <span>{t('components.RightMenu.enterDetails')}</span>
                </Link>
                <div
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-black dark:text-white"
                    onClick={() => {
                        setOpenAlert(true);
                    }}
                >
                    <DeleteIcon className="mr-2" />
                    <span>{t('components.RightMenu.deleteGame')}</span>
                </div>
                <div className="h-[1px] bg-gray-200 dark:bg-gray-700 my-1" />
                <div
                    className={`flex items-center px-4 py-2 text-black dark:text-white ${isTauri()
                        ? 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                        }`}
                    onClick={() => {
                        handleOpenFolder({ id, getGameById });
                        setAnchorEl(null);
                    }}
                >
                    <FolderOpenIcon className="mr-2" />
                    <span>{t('components.RightMenu.openGameFolder')}</span>
                </div>
                <div
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-black dark:text-white"
                    onClick={() => setAnchorEl(null)}
                >
                    <MoreHorizIcon className="mr-2" />
                    <span>{t('components.RightMenu.more')}</span>
                </div>
            </div>
        </div>
    );
};

export default RightMenu;
