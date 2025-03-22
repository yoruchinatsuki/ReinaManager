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
import Alert from '@mui/material/Alert';
import { useStore } from '@/store/';
import { open } from '@tauri-apps/plugin-dialog';
import CircularProgress from '@mui/material/CircularProgress';
import { isTauri } from '@tauri-apps/api/core';
import Switch from '@mui/material/Switch';
import { time_now } from '@/utils';

const AddModal: React.FC = () => {
    const { bgmToken, addGame, games } = useStore();
    const { isopen, handleOpen, handleClose } = useModal();
    const [formText, setFormText] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [path, setPath] = useState('');
    const [customMode, setCustomMode] = useState(false);

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
            setError('未选择可执行程序');
            setTimeout(() => {
                setError('');
            }, 5000);
            return;
        }
        if (customMode) {
            await addGame({ game_id: String(time_now().getTime()), localpath: path, name: formText, name_cn: '', image: "/images/default.png", time: time_now() });
            setFormText('');
            setPath('');
            handleClose();
            return;
        }
        try {
            setLoading(true); // 开始加载
            const res = await fetchFromBgm(formText, bgmToken);
            if (typeof res === 'string') {
                setError(res);
                setTimeout(() => {
                    setError('');
                }, 5000);
                return null;
            }
            if (games.find((game) => game.game_id === res.game_id)) {
                setError('游戏已存在');
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
                name: "可执行文件",
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
            <Button onClick={handleOpen} startIcon={<AddIcon />}>添加游戏</Button>
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
                <DialogTitle>添加游戏</DialogTitle>
                <DialogContent>
                    <Button className='w-md' variant='contained' onClick={async () => {
                        const result = await handleDirectory();
                        if (result)
                            setPath(
                                result
                            );
                    }} startIcon={<FileOpenIcon />} disabled={!isTauri()} >选择启动程序</Button>
                    <p>
                        <input className='w-md' type="text" value={path}
                            placeholder="请选择一个可执行程序" readOnly />
                    </p>
                    <div>
                        <Switch checked={customMode} onChange={() => {
                            setCustomMode(!customMode)
                        }} />
                        <span>启用自定义模式</span>
                    </div>


                    <TextField
                        required
                        margin="dense"
                        id="name"
                        name="game-name"
                        label="游戏名称"
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

                    } disabled={loading} >取消</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={formText === '' || loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        {loading ? '处理中...' : '确认'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}


export default AddModal;
