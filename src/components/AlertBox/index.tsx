import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

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
                <Button onClick={handleClose}>{t('components.AlertBox.cancel')}</Button>
                <Button onClick={handleConfirm} color="error" variant="contained" autoFocus>
                    {t('components.AlertBox.confirmDelete')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export const AlertDeleteBox: React.FC<AlertBoxProps> = ({ open, setOpen, onConfirm }) => {
    const { t } = useTranslation();

    return (
        <AlertBox
            open={open}
            setOpen={setOpen}
            title={t('components.AlertBox.deleteGameTitle')}
            message={t('components.AlertBox.deleteGameMessage')}
            onConfirm={onConfirm}
        />
    );
}
