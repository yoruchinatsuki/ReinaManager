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
    const { selectedGameId, getGameById, useIsLocalGame } = useStore();

    // 确定是否可以启动游戏
    // 正确的canUse函数实现
    const canUse = (): boolean => {
        // 如果不是Tauri环境，无法启动游戏
        if (!isTauri()) return false;

        // 确定要使用的游戏ID（优先使用props传入的，否则使用全局状态）
        const effectiveGameId = game_id || selectedGameId;

        // 如果没有有效的游戏ID，无法启动
        if (!effectiveGameId) return false;

        // 检查是否为本地游戏，只有本地游戏才能启动
        return useIsLocalGame(effectiveGameId);
    };

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
                if (game_id)
                    handleStartGame(game_id);
                else
                    handleStartGame();
            }}
            disabled={!canUse()} // 当没有选择游戏时禁用按钮
        >
            {t('components.LaunchModal.launchGame')}
        </Button>
    );
}