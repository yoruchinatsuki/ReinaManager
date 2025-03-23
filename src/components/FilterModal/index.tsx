import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useStore } from '@/store';
import { useTranslation } from 'react-i18next';

export type GameFilterType = 'all' | 'local' | 'online';

export const FilterModal: React.FC = () => {
    const { t } = useTranslation();
    const { gameFilterType, setGameFilterType } = useStore();

    const [open, setOpen] = useState(false);
    const [filterValue, setFilterValue] = useState<GameFilterType>(gameFilterType || 'all');

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterValue(event.target.value as GameFilterType);
    };

    const handleApply = () => {
        setGameFilterType(filterValue);
        handleClose();
    };

    return (
        <>
            <Button
                startIcon={<FilterListIcon />}
                onClick={handleOpen}
            >
                {t('components.FilterModal.filter')}
            </Button>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{t('components.FilterModal.filterTitle')}</DialogTitle>
                <DialogContent>
                    <FormControl component="fieldset">
                        <RadioGroup value={filterValue} onChange={handleChange}>
                            <FormControlLabel
                                value="all"
                                control={<Radio />}
                                label={t('components.FilterModal.allGames')}
                            />
                            <FormControlLabel
                                value="local"
                                control={<Radio />}
                                label={t('components.FilterModal.localGames')}
                            />
                            <FormControlLabel
                                value="online"
                                control={<Radio />}
                                label={t('components.FilterModal.onlineGames')}
                            />
                        </RadioGroup>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>
                        {t('components.FilterModal.cancel')}
                    </Button>
                    <Button onClick={handleApply} color="primary">
                        {t('components.FilterModal.apply')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}