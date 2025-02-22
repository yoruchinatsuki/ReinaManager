import { useEffect, useState } from 'react';
import { useBGM_TOKEN } from '@/store';

export const Settings: React.FC = () => {
    const { BGM_TOKEN, setBGM_TOKEN } = useBGM_TOKEN();
    const [inputToken, setInputToken] = useState('');

    useEffect(() => {
        setInputToken(BGM_TOKEN);
    }, [BGM_TOKEN]);

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
            <a className="text-blue visited:text-blue"
                target='_blank'
                rel="noreferrer"
                href="https://next.bgm.tv/demo/access-token/create" >获取token</a>
        </div>
    );
};