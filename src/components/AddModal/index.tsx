import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import AddIcon from '@mui/icons-material/Add';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import { useModal } from '@/components/Toolbar';
import { useEffect, useState } from 'react';
import { fetchFromBgm } from '@/api/bgm';
import { fetchFromVNDB } from '@/api/vndb';
import Alert from '@mui/material/Alert';
import { useStore } from '@/store/';
import { open } from '@tauri-apps/plugin-dialog';
import CircularProgress from '@mui/material/CircularProgress';
import { isTauri } from '@tauri-apps/api/core';
import Switch from '@mui/material/Switch';
import { time_now } from '@/utils';
import { useTranslation } from 'react-i18next';
import { getGamePlatformId } from '@/utils';

const AddModal: React.FC = () => {
    const { t } = useTranslation();
    const { bgmToken, addGame, games } = useStore();
    const { isopen, handleOpen, handleClose } = useModal();
    const [formText, setFormText] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [path, setPath] = useState('');
    const [customMode, setCustomMode] = useState(false);
    const [isVNDB, setIsVNDB] = useState(false);

    // 当路径变化时，更新文本字段
    useEffect(() => {
        if (path) {
            const folderName = extractFolderName(path);
            setFormText(folderName);
        }
    }, [path]); // 仅在path变化时执行

    const handleSubmit = async () => {
        if (loading) return; // 防止重复提交
        if (customMode && !path) {
            setError(t('components.AddModal.noExecutableSelected'));
            setTimeout(() => {
                setError('');
            }, 5000);
            return;
        }
        if (customMode) {
            await addGame({ bgm_id: String(time_now().getTime()), localpath: path, name: formText, name_cn: '', image: "/images/default.png", time: time_now() });
            setFormText('');
            setPath('');
            handleClose();
            return;
        }
        try {
            setLoading(true); // 开始加载

            const res = isVNDB ? (await fetchFromVNDB(formText)) : (await fetchFromBgm(formText, bgmToken));

            if (typeof res === 'string') {
                setError(res);
                setTimeout(() => {
                    setError('');
                }, 5000);
                return null;
            }
            if (games.find((game) => getGamePlatformId(game) === getGamePlatformId(res) || game.name === res.name || game.name_cn === res.name_cn)) {
                setError(t('components.AddModal.gameExists'));
                setTimeout(() => {
                    setError('');
                }, 5000);
                return null;
            }
            const gameWithPath = { ...res, localpath: path }; // 创建包含原对象所有属性和新 path 属性的新对象
            // console.log(gameWithPath);
            await addGame(gameWithPath);
            setFormText('');
            setPath('');
            handleClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false); // 结束加载状态
        }
    }
    const handleDirectory = async () => {
        const path = await open({
            multiple: false,
            directory: false,
            filters: [{
                name: t('components.AddModal.executable'),
                extensions: ["exe"]
            }]
        });
        if (path === null) return null;
        return path
    }

    // 从文件路径中提取文件夹名称
    const extractFolderName = (path: string): string => {
        // 返回倒数第二个元素（文件所在的文件夹）
        const parts = path.split('\\');
        return parts.length > 1 ? parts[parts.length - 2] : '';
    };

    return (
        <>
            <Button onClick={handleOpen} startIcon={<AddIcon />}>{t('components.AddModal.addGame')}</Button>
            <Dialog
                open={isopen}
                onClose={(_, reason) => {
                    if (reason !== 'backdropClick' && !loading) { // 加载时防止关闭
                        handleClose();
                    }
                }}
                closeAfterTransition={false}
                aria-labelledby="addgame-dialog-title"
            >
                {error && <Alert severity="error">{error}</Alert>}
                <DialogTitle>{t('components.AddModal.addGame')}</DialogTitle>
                <DialogContent>
                    <Button className='w-md' variant='contained' onClick={async () => {
                        const result = await handleDirectory();
                        if (result)
                            setPath(
                                result
                            );
                    }} startIcon={<FileOpenIcon />} disabled={!isTauri()} >{t('components.AddModal.selectLauncher')}</Button>
                    <p>
                        <input className='w-md' type="text" value={path}
                            placeholder={t('components.AddModal.selectExecutable')} readOnly />
                    </p>
                    <div>
                        <Switch checked={customMode} onChange={() => {
                            setCustomMode(!customMode)
                        }} />
                        <span>{t('components.AddModal.enableCustomMode')}</span>
                        <div>
                            <Switch checked={isVNDB} onChange={() => {
                                setIsVNDB(!isVNDB)
                            }} />
                            <span>{t('components.AddModal.enableVNDB')}</span>
                        </div>


                    </div>


                    <TextField
                        required
                        margin="dense"
                        id="name"
                        name="game-name"
                        label={t('components.AddModal.gameName')}
                        type="text"
                        fullWidth
                        variant="standard"
                        autoComplete="off"
                        value={formText}
                        onChange={(event) => setFormText(event.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={() => {
                        setFormText('');
                        setPath('');
                        handleClose();
                    }

                    } disabled={loading} >{t('components.AddModal.cancel')}</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={formText === '' || loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        {loading ? t('components.AddModal.processing') : t('components.AddModal.confirm')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}


export default AddModal;
