import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import { useModal } from '@/components/Toolbar';
import { useState } from 'react';
import { fetchFromBgm } from '@/api/bgm';
import Alert from '@mui/material/Alert';
import { useGameStore, useBGM_TOKEN } from '@/store/';
import { open } from '@tauri-apps/plugin-dialog';

const AddModal: React.FC = () => {
    const { BGM_TOKEN } = useBGM_TOKEN();
    const { isopen, handleOpen, handleClose } = useModal();
    const [formText, setFormText] = useState('');
    const [error, setError] = useState('');
    const addGame = useGameStore(state => state.addGame);
    const handleSubmit = async () => {
        try {
            const res = await fetchFromBgm(formText, BGM_TOKEN);
            if (typeof res === 'string') {
                setError(res);
                setTimeout(() => {
                    setError('');
                }, 5000);
                return null;
            }
            await addGame(res);
            handleClose();
            setFormText('');
        } catch (error) {
            console.error(error);
        }
    }
    const handleDirectory = async () => {
        const directory = await open({
            multiple: false,
            directory: false,
            filters: [{
                name: "",
                extensions: ["exe"]
            }]
        });
        return directory
    }

    return (
        <>
            <Button onClick={handleOpen} startIcon={<AddIcon />}>添加游戏</Button>
            <Dialog
                open={isopen}
                onClose={(_, reason) => {
                    if (reason !== 'backdropClick') {
                        handleClose();
                    }
                }}
                closeAfterTransition={false}
                aria-labelledby="addgame-dialog-title"
            >
                {error && <Alert severity="error">{error}</Alert>}
                <DialogTitle>添加游戏</DialogTitle>
                <DialogContent>
                    <Button variant='contained' onClick={async () => {
                        console.log(await handleDirectory());
                    }} startIcon={<FileOpenIcon />} >选择启动程序</Button>
                    <SelectGameProgram />
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
                        onChange={(event) => setFormText(event.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={handleClose}>取消</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={formText === ''}>确认</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}


const SelectGameProgram = () => {
    return (
        <div>
            <Select defaultValue={10}>
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>aaaa</MenuItem>
            </Select>
        </div>
    );
}

export default AddModal;
