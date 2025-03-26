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
import { useTranslation } from 'react-i18next';

const SortModal: React.FC = () => {
    const { t } = useTranslation();
    const { isopen, handleOpen, handleClose } = useModal();
    // 从 store 获取排序状态
    const { sortOption, sortOrder } = useStore();

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

    // 在 SortModal 组件中使用我们优化的排序更新函数
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // 使用新的updateSort方法一次性更新排序并获取数据
        const { updateSort } = useStore.getState();
        await updateSort(localSortOption, localSortOrder);

        // 关闭对话框
        handleClose();
    };

    return (
        <>
            <Button onClick={handleOpen} startIcon={<SwapVertIcon />}>{t('components.SortModal.sort')}</Button>
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
                <DialogTitle>{t('components.SortModal.sort')}</DialogTitle>
                <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div>{t('components.SortModal.sortMethod')}</div>
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
                    <Button onClick={handleClose}>{t('components.SortModal.cancel')}</Button>
                    <Button type="submit">{t('components.SortModal.confirm')}</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
const SortOption = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    const { t } = useTranslation();
    const handleChange = (event: SelectChangeEvent) => {
        onChange(event.target.value);
    };

    return (
        <div>
            <Select value={value} onChange={handleChange}>
                <MenuItem value="addtime">{t('components.SortModal.addTime')}</MenuItem>
                <MenuItem value="datetime">{t('components.SortModal.releaseTime')}</MenuItem>
                <MenuItem value="rank">{t('components.SortModal.Ranking')}</MenuItem>
            </Select>
        </div>
    );
}
const UpDownSwitches = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    const { t } = useTranslation();
    // 使用 asc/desc 而不是布尔值
    const isDesc = value === 'desc';

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.checked ? 'desc' : 'asc');
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <span style={{ marginRight: '8px', opacity: isDesc ? 0.5 : 1 }}>{t('components.SortModal.ascending')}</span>
            <Switch
                checked={isDesc}
                onChange={handleChange}
                inputProps={{ 'aria-label': 'controlled' }}
            />
            <span style={{ marginLeft: '8px', opacity: isDesc ? 1 : 0.5 }}>{t('components.SortModal.descending')}</span>
        </div>
    );
}
export default SortModal;