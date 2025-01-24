import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import { useModal } from '@/components/Toolbar';

const AddModal: React.FC = () => {
    const { isopen, handleOpen, handleClose } = useModal();
    return (
        <React.Fragment>
            <Button onClick={handleOpen} startIcon={<AddIcon />}>添加游戏</Button>
            <Dialog
                open={isopen}
                onClose={handleClose}
                disableRestoreFocus // Prevents automatic focus restoration
                // Ensure the modal is properly labeled for accessibility
                aria-labelledby="addgame-dialog-title"
                PaperProps={{
                    component: 'form',
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries((formData).entries());
                        const text = formJson.text;
                        console.log(text);
                        handleClose();
                    },
                }}
            >
                <DialogTitle>添加游戏</DialogTitle>
                <DialogContent>
                    <InputFileUpload />
                    <SelectGameProgram />
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        name="game-name"
                        label="游戏名称"
                        type="text"
                        fullWidth
                        variant="standard"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>取消</Button>
                    <Button type="submit">确认</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const InputFileUpload = () => {
    return (
        <Button
            component="label"
            variant="contained"
            // tabIndex={-1}
            startIcon={<DriveFolderUploadIcon />}
        >
            选择文件夹
            <VisuallyHiddenInput
                type="file"
                onChange={(event) => console.log(event.target.files)}
                multiple
            />
        </Button>
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