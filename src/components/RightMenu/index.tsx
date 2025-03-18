import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArticleIcon from '@mui/icons-material/Article';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect } from 'react';
import { Link } from 'react-router';
import { useStore } from '@/store';
import { invoke } from '@tauri-apps/api/core';
import { path } from '@tauri-apps/api';

interface RightMenuProps {
    isopen: boolean;
    anchorPosition?: { top: number; left: number };
    setAnchorEl: (value: null) => void;
    id: string | null | undefined;
}

const RightMenu: React.FC<RightMenuProps> = ({ isopen, anchorPosition, setAnchorEl, id }) => {
    const { getGameById } = useStore();
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
        if (id) {
            await useStore.getState().deleteGame(id);
        }
        setAnchorEl(null);
    }

    const handleStartGame = async () => {
        if (!id) {
            console.error('未选择游戏');
            return;
        }
        try {

            const selectedGame = await getGameById(id);
            if (!selectedGame || !selectedGame.localpath) {
                console.error('游戏路径未找到');
                return;
            }
            // 调用Rust后端启动游戏
            await invoke('launch_game', {
                gamePath: selectedGame.localpath,
            });
            setAnchorEl(null);
        } catch (error) {
            console.error('游戏启动失败:', error);
            // 这里可以添加错误提示UI
        }
    }

    const handleOpenFolder = async () => {
        if (!id) {
            console.error('未选择游戏');
            return;
        }
        try {
            const selectedGame = await getGameById(id);
            if (!selectedGame || !selectedGame.localpath) {
                console.error('游戏路径未找到');
                return;
            }
            const folder = await path.dirname(selectedGame.localpath);
            if (folder) {
                // 使用我们自己的后端函数打开文件夹
                await invoke('open_directory', { dirPath: folder });
            }
            setAnchorEl(null);

        } catch (error) {
            console.error('打开文件夹失败:', error);
        }
    }

    return (
        <div
            className="fixed z-50 animate-fade-in animate-duration-200"
            style={menuStyle}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="bg-white rounded-lg shadow-lg min-w-[200px] py-1 border border-gray-200">
                <div
                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={handleStartGame}>
                    <PlayCircleOutlineIcon className="mr-2" />
                    <span>启动游戏</span>
                </div>
                <Link
                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer no-underline text-black visited:text-black"
                    to={`/libraries/${id}`}>
                    <ArticleIcon className="mr-2" />
                    <span>进入详情页</span>
                </Link>
                <div
                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={handleDeleteGame}
                >
                    <DeleteIcon className="mr-2" />
                    <span>删除游戏</span>
                </div>
                <div className="h-[1px] bg-gray-200 my-1" />
                <div
                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={handleOpenFolder}
                >
                    <FolderOpenIcon className="mr-2" />
                    <span>打开本地文件夹</span>
                </div>
                <div
                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => setAnchorEl(null)}
                >
                    <MoreHorizIcon className="mr-2" />
                    <span>更多</span>
                </div>
            </div>
        </div>
    );
};

export default RightMenu;
