import { useEffect, useState } from 'react';
import { useBGM_TOKEN } from '@/store';
import { openurl } from '@/utils';

export const Settings: React.FC = () => {
    const { BGM_TOKEN, setBGM_TOKEN } = useBGM_TOKEN();
    const [inputToken, setInputToken] = useState('');

    useEffect(() => {
        setInputToken(BGM_TOKEN);
    }, [BGM_TOKEN]);

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
            <button type="button" onClick={() => setBGM_TOKEN(inputToken)}>
                保存
            </button>
            <span className=" text-blue-400 hover:cursor-pointer" onClick={handleOpen}>获取token</span>
        </div>
    );
};