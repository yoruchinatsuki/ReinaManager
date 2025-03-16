import { useEffect, useState } from 'react';
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
import { useStore } from '@/store';

const SortModal: React.FC = () => {
    const { isopen, handleOpen, handleClose } = useModal();
    // 从 store 获取排序状态
    const { sortOption, sortOrder, setSortOption, setSortOrder } = useStore();

    // 本地状态，用于在对话框内部跟踪更改
    const [localSortOption, setLocalSortOption] = useState(sortOption);
    const [localSortOrder, setLocalSortOrder] = useState(sortOrder);

    // 每次打开对话框时，重置本地状态
    useEffect(() => {
        if (isopen) {
            setLocalSortOption(sortOption);
            setLocalSortOrder(sortOrder);
        }
    }, [isopen, sortOption, sortOrder]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // 更新全局状态
        setSortOption(localSortOption);
        setSortOrder(localSortOrder);
        // 重新获取排序后的数据
        handleClose();
    };

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
                    onSubmit: handleSubmit,
                }}
            >
                <DialogTitle>排序</DialogTitle>
                <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div>排序方法：</div>
                    <SortOption
                        value={localSortOption}
                        onChange={setLocalSortOption}
                    />
                    <UpDownSwitches
                        value={localSortOrder}
                        onChange={(value: string) => setLocalSortOrder(value as "asc" | "desc")}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>取消</Button>
                    <Button type="submit">确认</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
const SortOption = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    const handleChange = (event: SelectChangeEvent) => {
        onChange(event.target.value);
    };

    return (
        <div>
            <Select value={value} onChange={handleChange}>
                <MenuItem value="addtime">添加时间(默认)</MenuItem>
                <MenuItem value="datetime">游戏发布时间</MenuItem>
                <MenuItem value="rank">BGM评分排名</MenuItem>
            </Select>
        </div>
    );
}
const UpDownSwitches = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    // 使用 asc/desc 而不是布尔值
    const isDesc = value === 'desc';

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.checked ? 'desc' : 'asc');
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <span style={{ marginRight: '8px', opacity: isDesc ? 0.5 : 1 }}>升序</span>
            <Switch
                checked={isDesc}
                onChange={handleChange}
                inputProps={{ 'aria-label': 'controlled' }}
            />
            <span style={{ marginLeft: '8px', opacity: isDesc ? 1 : 0.5 }}>降序</span>
        </div>
    );
}
export default SortModal;