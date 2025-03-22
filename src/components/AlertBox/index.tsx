import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

interface AlertBoxProps {
    open: boolean;
    setOpen: (value: boolean) => void;
    title?: string;
    message?: string;
    onConfirm: () => void;
}

export function AlertBox({
    open,
    setOpen,
    title,
    message,
    onConfirm
}: AlertBoxProps) {
    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirm = () => {
        onConfirm();
        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {title}
            </DialogTitle>
            {message && (
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {message}
                    </DialogContentText>
                </DialogContent>
            )}
            <DialogActions>
                <Button onClick={handleClose}>取消</Button>
                <Button onClick={handleConfirm} color="error" variant="contained" autoFocus>
                    确认删除
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export const AlertDeleteBox: React.FC<AlertBoxProps> = ({ open, setOpen, onConfirm }) => {
    return (
        <AlertBox
            open={open}
            setOpen={setOpen}
            title="是否删除游戏？"
            message="此操作无法撤销，确定要删除该游戏吗？"
            onConfirm={onConfirm}
        />
    );
}
