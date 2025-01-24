import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useModal } from '@/components/Toolbar';

const FilterModal: React.FC = () => {
    const { isopen, handleOpen, handleClose } = useModal();
    return (
        <React.Fragment>
            <Button onClick={handleOpen} startIcon={<FilterAltIcon />}>筛选</Button>
            <Dialog
                open={isopen}
                onClose={handleClose}
                disableRestoreFocus // Prevents automatic focus restoration
                // Ensure the modal is properly labeled for accessibility
                aria-labelledby="filter-dialog-title"
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
                <DialogTitle>筛选</DialogTitle>
                <DialogContent>
                    <FilterOption />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>取消</Button>
                    <Button type="submit">确认</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
const FilterOption = () => {
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
export default FilterModal;