import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
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
    const [sort, setSort] = useState("addtime");
    const handleChange = (event: SelectChangeEvent) => {
        setSort(event.target.value);
    };
    return (
        <div>
            <Select defaultValue={sort} onChange={handleChange}>
                <MenuItem value={"addtime"} >添加时间(默认)</MenuItem>
                <MenuItem value={"datetime"}>游戏发布时间</MenuItem>
                <MenuItem value={"rank"}>BGM评分</MenuItem>
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
            <span>升序</span>
            <Switch
                checked={updown}
                onChange={handleChange}
                inputProps={{ 'aria-label': 'controlled' }}
            />
            <span>降序</span>
        </>
    );
}
export default SortModal;