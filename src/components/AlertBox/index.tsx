import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from 'react-i18next';

// 通用提示框属性
interface AlertBoxProps {
    open: boolean;
    setOpen: (value: boolean) => void;
    title?: string;
    message?: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'primary' | 'error' | 'success' | 'info' | 'warning';
    confirmVariant?: 'text' | 'outlined' | 'contained';
    autoCloseOnConfirm?: boolean;  // 确认后是否自动关闭
}

// 删除提示框专用属性
interface AlertDeleteBoxProps {
    open: boolean;
    setOpen: (value: boolean) => void;
    onConfirm: () => void;
    isLoading?: boolean;  // 添加加载状态
    customMessage?: string; // 自定义删除消息
}

// 通用提示框组件
export function AlertBox({
    open,
    setOpen,
    title,
    message,
    onConfirm,
    confirmText,
    cancelText,
    confirmColor = 'primary',
    confirmVariant = 'text',
    autoCloseOnConfirm = true
}: AlertBoxProps) {
    const { t } = useTranslation();

    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirm = () => {
        onConfirm();
        if (autoCloseOnConfirm) {
            setOpen(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            {title && (
                <DialogTitle id="alert-dialog-title">
                    {title}
                </DialogTitle>
            )}
            {message && (
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {message}
                    </DialogContentText>
                </DialogContent>
            )}
            <DialogActions>
                <Button onClick={handleClose}>
                    {cancelText || t('components.AlertBox.cancel')}
                </Button>
                <Button
                    onClick={handleConfirm}
                    color={confirmColor}
                    variant={confirmVariant}
                    autoFocus
                >
                    {confirmText || t('components.AlertBox.confirm')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// 删除提示框组件
export const AlertDeleteBox: React.FC<AlertDeleteBoxProps> = ({
    open,
    setOpen,
    onConfirm,
    isLoading = false,
    customMessage
}) => {
    const { t } = useTranslation();

    // 删除操作不会立即关闭对话框，而是等待操作完成
    const handleDeleteConfirm = () => {
        onConfirm();
        // 不在这里关闭对话框，等待操作完成后由父组件关闭
    };

    return (
        <Dialog
            open={open}
            onClose={() => !isLoading && setOpen(false)}  // 加载时不允许关闭
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {t('components.AlertBox.deleteGameTitle')}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {customMessage || t('components.AlertBox.deleteGameMessage')}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => setOpen(false)}
                    disabled={isLoading}
                >
                    {t('components.AlertBox.cancel')}
                </Button>
                <Button
                    onClick={handleDeleteConfirm}
                    color="error"
                    variant="contained"
                    autoFocus
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                    {isLoading
                        ? t('components.AlertBox.processing')
                        : t('components.AlertBox.confirmDelete')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}