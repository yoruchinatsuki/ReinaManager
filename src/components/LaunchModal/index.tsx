import Button from '@mui/material/Button';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TimerIcon from '@mui/icons-material/Timer';
import { useStore } from '@/store';
import { useGamePlayStore } from '@/store/gamePlayStore';
import { isTauri } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';

interface LaunchModalProps {
    game_id?: string;
}

export const LaunchModal = ({ game_id }: LaunchModalProps) => {
    const { t } = useTranslation();
    const { selectedGameId, getGameById, useIsLocalGame } = useStore();
    const { launchGame, isGameRunning } = useGamePlayStore();

    // 确定要使用的游戏ID（优先使用props传入的，否则使用全局状态）
    const effectiveGameId = game_id || selectedGameId;

    // 检查这个特定游戏是否在运行
    const isThisGameRunning = isGameRunning(effectiveGameId === null ? undefined : effectiveGameId);

    // 确定是否可以启动游戏
    const canUse = (): boolean => {
        // 如果不是Tauri环境，无法启动游戏
        if (!isTauri()) return false;

        // 如果没有有效的游戏ID，无法启动
        if (!effectiveGameId) return false;

        // 如果该游戏已在运行，不能再次启动
        if (isThisGameRunning) return false;

        // 检查是否为本地游戏，只有本地游戏才能启动
        return useIsLocalGame(effectiveGameId);
    };

    const handleStartGame = async () => {
        if (!effectiveGameId) return;

        try {
            const selectedGame = await getGameById(effectiveGameId);
            if (!selectedGame || !selectedGame.localpath) {
                console.error(t('components.LaunchModal.gamePathNotFound'));
                return;
            }

            // 使用游戏启动函数
            await launchGame(selectedGame.localpath, effectiveGameId);
        } catch (error) {
            console.error(t('components.LaunchModal.launchFailed'), error);
        }
    };

    // 使用 Box 组件包裹按钮，解决样式问题
    // 渲染不同状态的按钮
    if (isThisGameRunning) {
        return (
            <Button
                startIcon={<TimerIcon />}
                disabled
            >
                {t('components.LaunchModal.playing')}
            </Button>
        );
    }

    return (
        <Button
            startIcon={<PlayArrowIcon />}
            onClick={handleStartGame}
            disabled={!canUse()}
        >
            {t('components.LaunchModal.launchGame')}
        </Button>
    );
};