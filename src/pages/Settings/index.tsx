import { useBGM_TOKEN } from '@/store';
export const Settings: React.FC = () => {
    const { BGM_TOKEN, setBGM_TOKEN } = useBGM_TOKEN();
    return (
        <div>
            <span>BGM_TOKEN</span>
            <input type="text" placeholder='请填写你的BGM_TOKEN' value={BGM_TOKEN} onChange={e => setBGM_TOKEN(e.target.value)} />
        </div>
    )
}