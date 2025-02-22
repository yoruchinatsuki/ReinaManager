import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { useModal } from '@/components/Toolbar';
import Switch from '@mui/material/Switch';


const SortModal: React.FC = () => {
    const { isopen, handleOpen, handleClose } = useModal();
    return (
        <>
            <Button onClick={handleOpen} startIcon={<SwapVertIcon />}>排序</Button>
            <Dialog
                open={isopen}
                onClose={handleClose}
                closeAfterTransition={false}
                TransitionProps={{
                    timeout: 0, // 禁用过渡动画
                }}
                aria-labelledby="sort-dialog-title"
                PaperProps={{
                    component: 'form',
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries((formData).entries());
                        const email = formJson.email;
                        console.log(email);
                        handleClose();
                    },
                }}
            >
                <DialogTitle>排序</DialogTitle>
                <DialogContent>
                    排序方法：
                    <SortOption />
                    <UpDownSwitches />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>取消</Button>
                    <Button type="submit">确认</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
const SortOption = () => {
    return (
        <div>
            <Select defaultValue={"添加时间(默认)"}>
                <MenuItem value={"添加时间(默认)"} >添加时间(默认)</MenuItem>
                <MenuItem value={20}>游戏发布时间</MenuItem>
                <MenuItem value={30}>BGM评分</MenuItem>
            </Select>
        </div>
    );
}
const UpDownSwitches = () => {
    const [updown, setupdown] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setupdown(event.target.checked);
    };

    return (
        <>
            <Switch
                checked={updown}
                onChange={handleChange}
                inputProps={{ 'aria-label': 'controlled' }}
            />
            {updown ? "升序" : "降序"}
        </>
    );
}
export default SortModal;