import { Outlet, useLocation } from 'react-router'
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { Avatar } from '@mui/material';
import {
    DashboardLayout,
    type SidebarFooterProps,
} from '@toolpad/core/DashboardLayout';
import { ToLibraries, Toolbars, Toolbarsswitch } from '@/components/Toolbar';
import { SearchBox } from '@/components/SearchBox';
import { PageContainer } from '@toolpad/core';

function SidebarFooter({ mini }: SidebarFooterProps) {
    return (
        <Typography variant="caption" className="m-1 whitespace-nowrap overflow-hidden text-align-center">
            {mini ? `© ${new Date().getFullYear()}` : `© ${new Date().getFullYear()} Made by huoshen80`}
        </Typography>
    );
}

function CustomAppTitle() {
    const showTollbar = Toolbarsswitch(useLocation().pathname);
    return (
        <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt='Reina' src='/images/reina.png' onDragStart={(event) => event.preventDefault()} />
            <Typography variant="h6">ReinaManager</Typography>
            <Chip size="small" label="BETA" color="info" />
            {showTollbar && <SearchBox />}
        </Stack>
    );
}


export const Layout: React.FC = () => {
    const showTollbar = Toolbarsswitch(useLocation().pathname);
    return (
        <DashboardLayout
            slots={{
                appTitle: CustomAppTitle,
                toolbarActions: showTollbar ? Toolbars : ToLibraries,
                sidebarFooter: SidebarFooter,
            }} sidebarExpandedWidth={180} defaultSidebarCollapsed={true}
        >
            {showTollbar ?
                <PageContainer sx={{ maxWidth: '100% !important' }}>
                    <Outlet />
                </PageContainer>
                : <Outlet />}
            {/* <Outlet /> */}
            {/* <Typography variant="h5" sx={{
                marginLeft: '3%',
                marginTop: '1%',
                userSelect: 'none'
            }}>{location.title}</Typography> */}
        </DashboardLayout>
    );
}
export default Layout;
