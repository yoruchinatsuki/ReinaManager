import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import { openurl } from '@/utils';

export const Settings: React.FC = () => {
    const { bgmToken, setBgmToken } = useStore();
    const [inputToken, setInputToken] = useState('');

    useEffect(() => {
        setInputToken(bgmToken);
    }, [bgmToken]);

    const handleOpen = () => {
        openurl("https://next.bgm.tv/demo/access-token/create");
    }
    return (
        <div>
            <span>BGM_TOKEN</span>
            <input
                type="password"
                placeholder="请填写你的BGM_TOKEN"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
            />
            <button type="button" onClick={() => setBgmToken(inputToken)}>
                保存
            </button>
            <span className=" text-blue-400 hover:cursor-pointer" onClick={handleOpen}>获取token</span>
        </div>
    );
};