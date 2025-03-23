import Button from '@mui/material/Button';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useStore } from '@/store';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next'; // 导入翻译hook

interface LaunchModalProps {
    game_id?: string;
}

export const LaunchModal = ({ game_id }: LaunchModalProps) => {
    const { t } = useTranslation(); // 使用翻译函数
    const { selectedGameId, getGameById } = useStore();

    const handleStartGame = async (id?: string) => {
        if (!selectedGameId || (id === undefined && !selectedGameId)) {
            return;
        }

        try {
            const selectedGame = await getGameById(id ? id : selectedGameId);
            if (!selectedGame || !selectedGame.localpath) {
                console.error(t('components.LaunchModal.gamePathNotFound'));
                return;
            }

            // 调用Rust后端启动游戏
            await invoke('launch_game', {
                gamePath: selectedGame.localpath,
            });
        } catch (error) {
            console.error(t('components.LaunchModal.launchFailed'), error);
            // 这里可以添加错误提示UI
        }
    }

    return (
        <Button
            startIcon={<PlayArrowIcon />}
            onClick={() => {
                console.log(game_id);
                if (game_id)
                    handleStartGame(game_id);
                else
                    handleStartGame();
            }}
            disabled={!selectedGameId || !isTauri()} // 当没有选择游戏时禁用按钮
        >
            {t('components.LaunchModal.launchGame')}
        </Button>
    );
}