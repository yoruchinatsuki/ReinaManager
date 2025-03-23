import { useStore } from '@/store';
import { PageContainer } from '@toolpad/core';
import { useLocation } from 'react-router';
import type { GameData } from '@/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
            <div>
                <h3>{t('pages.Detail.introduction')}</h3>
                <p>{game.summary}</p>
                <h3>{t('pages.Detail.gameScore')}</h3>
                <p>{game.score}</p>
                <h3>{t('pages.Detail.releaseDate')}</h3>
                <p>{game.date}</p>
                <h3>{t('pages.Detail.gameRanking')}</h3>
                <p>{game.rank}</p>
            </div>
        </PageContainer>
    )
}