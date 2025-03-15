import { useStore } from '@/store';
import { PageContainer } from '@toolpad/core';
import { useLocation } from 'react-router';
import type { GameData } from '@/types';
import { useEffect, useState } from 'react';
export const Detail: React.FC = () => {

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

    if (loading) return <div>加载中...</div>;
    if (!game) return <div>未找到游戏数据</div>;
    return (
        <PageContainer sx={{ maxWidth: '100% !important' }}>
            <div>
                <h3>简介</h3>
                <p>{game.summary}</p>
                <h3>游戏评分</h3>
                <p>{game.score}</p>
                <h3>游戏发布时间</h3>
                <p>{game.date}</p>
                <h3>游戏排行</h3>
                <p>{game.rank}</p>
            </div>

        </PageContainer>
    )
}