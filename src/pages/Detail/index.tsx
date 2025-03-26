import { useStore } from '@/store';
import { PageContainer } from '@toolpad/core';
import { useLocation } from 'react-router';
import type { GameData } from '@/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Box, Stack, Chip, Paper } from '@mui/material';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TodayIcon from '@mui/icons-material/Today';
import BackupIcon from '@mui/icons-material/Backup';


interface InfoBoxProps {
    game: GameData;
}

// 封装的统计信息组件
const InfoBox: React.FC<InfoBoxProps> = () => {
    const { t } = useTranslation();


    // 统计数据项（颜色、图标、标题、值）
    const statsItems = [
        {
            color: 'primary',
            icon: <SportsEsportsIcon fontSize="small" />,
            title: t('pages.Detail.playCount'),
            // value: game.playCount || '0'
            value: '0'
        },
        {
            color: 'primary',
            icon: <AccessTimeIcon fontSize="small" />,
            title: t('pages.Detail.totalPlayTime'),
            // value: game.totalPlayTime ? `${game.totalPlayTime}h` : '0h'
            value: '0'
        },
        {
            color: 'primary',
            icon: <TodayIcon fontSize="small" />,
            title: t('pages.Detail.todayPlayTime'),
            // value: game.todayPlayTime ? `${game.todayPlayTime}h` : '0h'
            value: '0'
        },
        {
            color: 'primary',
            icon: <BackupIcon fontSize="small" />,
            title: t('pages.Detail.backupCount'),
            // value: game.backupCount || '0'
            value: '0'
        }
    ];

    // 统计框背景色映射
    const bgColors = {
        primary: 'rgba(25, 118, 210, 0.04)',
    };

    // 统计框边框色映射
    const borderColors = {
        primary: 'rgba(25, 118, 210, 0.1)',
    };

    return (
        <Box sx={{ mt: 4, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                {t('pages.Detail.gameStats')}
            </Typography>

            <Stack
                direction="row"
                spacing={2}
                sx={{
                    width: '100%',
                    '& > *': { width: 'calc(25% - 12px)' } // 确保每个项目占据相等宽度
                }}
            >
                {statsItems.map((item) => (
                    <Paper
                        key={item.title}
                        elevation={0}
                        sx={{
                            p: 2,
                            bgcolor: bgColors[item.color as keyof typeof bgColors],
                            borderRadius: 2,
                            border: `1px solid ${borderColors[item.color as keyof typeof borderColors]}`,
                            minWidth: 0, // 允许缩小到比内容更小
                            overflow: 'hidden' // 确保内容不溢出
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <Box sx={{ color: `${item.color}.main` }}>{item.icon}</Box>
                            <Typography
                                variant="body2"
                                fontWeight="medium"
                                color="textSecondary"
                                noWrap // 防止长标题换行
                                title={item.title} // 添加tooltip
                            >
                                {item.title}
                            </Typography>
                        </Stack>
                        <Typography variant="h6" fontWeight="bold">
                            {item.value}
                        </Typography>
                    </Paper>
                ))}
            </Stack>
        </Box>
    );
};

export const Detail: React.FC = () => {
    const { t } = useTranslation();
    const { getGameById } = useStore();
    const [game, setGame] = useState<GameData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const id = useLocation().pathname.split('/').pop();
    useEffect(() => {
        if (!id) return;
        getGameById(id)
            .then(data => setGame(data))
            .catch(error => {
                console.error('获取游戏数据失败:', error);
            })
            .finally(() => setLoading(false));
    }, [id, getGameById]);

    if (loading) return <div>{t('pages.Detail.loading')}</div>;
    if (!game) return <div>{t('pages.Detail.notFound')}</div>;
    return (

        <PageContainer sx={{ maxWidth: '100% !important' }}>
            <Box sx={{ p: 2 }}>
                {/* 顶部区域：图片和基本信息 */}
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                    {/* 左侧：游戏图片 */}
                    <Box>
                        <img
                            src={game.image}
                            alt={game.name}
                            className="max-h-65 max-w-40 lg:max-w-80 rounded-lg shadow-lg"
                        />
                    </Box>

                    {/* 右侧：游戏信息 */}
                    <Box sx={{ flex: 1 }}>
                        {/* 修复换行样式问题的Stack */}
                        <Stack
                            spacing={0} // 移除原始间距
                            direction={{ xs: 'column', sm: 'row' }}
                            sx={{
                                flexWrap: 'wrap',
                                display: 'flex',
                                '& > div': {
                                    mr: 5,  // 右边距
                                    mb: 2,  // 底部边距，替代spacing属性
                                }
                            }}
                        >
                            {game.image !== "/images/default.png" &&
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold">{t('pages.Detail.gameDatafrom')}</Typography>
                                    <Typography>{game.bgm_id ? "Bangumi" : "Vndb"}</Typography>
                                </Box>}

                            <Box>
                                <Typography variant="subtitle2" fontWeight="bold">{t('pages.Detail.gameDeveloper')}</Typography>
                                <Typography>{game.developer || '-'}</Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" fontWeight="bold">{t('pages.Detail.releaseDate')}</Typography>
                                <Typography>{game.date || '-'}</Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" fontWeight="bold">{t('pages.Detail.addTime')}</Typography>
                                <Typography>{new Date(game.time).toLocaleDateString()}</Typography>
                            </Box>

                            {game.rank &&
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold">{t('pages.Detail.gameRanking')}</Typography>
                                    <Typography>{game.rank || '-'}</Typography>
                                </Box>}
                            <Box>
                                <Typography variant="subtitle2" fontWeight="bold">{t('pages.Detail.gameScore')}</Typography>
                                <Typography>{game.score || '-'}</Typography>
                            </Box>
                        </Stack>

                        {/* 标签 */}
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{t('pages.Detail.gameTags')}</Typography>
                            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                                {game.tags?.map(tag => (
                                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                                ))}
                            </Stack>
                        </Box>
                    </Box>
                </Stack>

                <InfoBox game={game} />

                {/* 游戏简介 */}
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" fontWeight="bold">{t('pages.Detail.introduction')}</Typography>
                    <Typography sx={{ mt: 1 }}>{game.summary}</Typography>
                </Box>
            </Box>
        </PageContainer>
    )
}