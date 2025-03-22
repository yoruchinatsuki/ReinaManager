import Button from '@mui/material/Button';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useStore } from '@/store';
import { invoke } from '@tauri-apps/api/core';

interface LaunchModalProps {
    game_id?: string;
}

export const LaunchModal = ({ game_id }: LaunchModalProps) => {
    const { selectedGameId, getGameById } = useStore();

    const handleStartGame = async (id?: string) => {
        if (!selectedGameId || (id === undefined && !selectedGameId)) {
            return;
        }

        try {

            const selectedGame = await getGameById(id ? id : selectedGameId);
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
        <Button startIcon={<PlayArrowIcon />}
            onClick={() => {
                console.log(game_id)
                if (game_id)
                    handleStartGame(game_id)
                else
                    handleStartGame()
            }}
            disabled={!selectedGameId} // 当没有选择游戏时禁用按钮
        >
            启动游戏
        </Button>
    );
}
