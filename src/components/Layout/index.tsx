import { Outlet, useLocation } from 'react-router'
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { Avatar } from '@mui/material';
import {
    DashboardLayout,
    type SidebarFooterProps,
} from '@toolpad/core/DashboardLayout';
import { Toolbars } from '@/components/Toolbar';
import { SearchBox } from '@/components/SearchBox';
import { PageContainer } from '@toolpad/core';
import { useMemo } from 'react';

interface CustomAppTitleProps {
    isLibraries: boolean;
}

function SidebarFooter({ mini }: SidebarFooterProps) {
    return (
        <Typography variant="caption"
            className="sticky bottom-0 w-full py-2 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-20 text-center block">
            {mini ? `© ${new Date().getFullYear()}` : `© ${new Date().getFullYear()} Made by huoshen80`}
        </Typography>
    );
}

const CustomAppTitle = ({ isLibraries }: CustomAppTitleProps) => {
    return (
        <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt='Reina' src='/images/reina.png' onDragStart={(event) => event.preventDefault()} />
            <Typography variant="h6">ReinaManager</Typography>
            <Chip size="small" label="BETA" color="info" />
            {isLibraries && <SearchBox />}
        </Stack>
    );
}


export const Layout: React.FC = () => {
    const path = useLocation().pathname;
    const isLibraries = path === "/libraries";
    const AppTitle = useMemo(() => {
        return () => <CustomAppTitle isLibraries={isLibraries} />;
    }, [isLibraries]);

    return (
        <DashboardLayout
            slots={{
                appTitle: AppTitle,
                toolbarActions: Toolbars,
                sidebarFooter: SidebarFooter,
            }} sidebarExpandedWidth={190} defaultSidebarCollapsed={true}
        >
            {isLibraries ?
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
