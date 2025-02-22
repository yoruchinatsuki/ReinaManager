import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArticleIcon from '@mui/icons-material/Article';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect } from 'react';
import { Link } from 'react-router';
import { useGameStore } from '@/store';

interface RightMenuProps {
    isopen: boolean;
    anchorPosition?: { top: number; left: number };
    setAnchorEl: (value: null) => void;
    id: string | null | undefined;
}

const RightMenu: React.FC<RightMenuProps> = ({ isopen, anchorPosition, setAnchorEl, id }) => {
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
        top: `min(${anchorPosition?.top ?? 0}px, calc(100vh - 11rem))`,
        left: anchorPosition?.left ?? 0,
    };

    const handleDeleteGame = async () => {
        if (id) {
            await useGameStore.getState().deleteGame(id);
        }
        setAnchorEl(null);
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
                    onClick={() => {
                        // 处理点击事件
                        setAnchorEl(null);
                    }}
                >
                    <PlayCircleOutlineIcon className="mr-2" />
                    <span>启动游戏</span>
                </div>
                <Link
                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer no-underline text-black visited:text-black"
                    to={`/libraries/${id}`}
                    onClick={() => {
                        setAnchorEl(null)
                    }
                    }>
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
                    onClick={() => setAnchorEl(null)}
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
