import type * as React from 'react';
import { useLocation } from 'react-router'
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import { Avatar } from '@mui/material';
import {
    DashboardLayout,
    ThemeSwitcher,
    type SidebarFooterProps,
} from '@toolpad/core/DashboardLayout';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import { NAVIGATION } from '@/routes';
import { Toolbars, Toolbarsswitch } from '@/components/Toolbar';
import { SearchBox } from '@/components/SearchBox';

const demoTheme = createTheme({
    cssVariables: {
        colorSchemeSelector: 'data-toolpad-color-scheme',
    },
    colorSchemes: { light: true, dark: true },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 600,
            lg: 1200,
            xl: 1536,
        },
    },
});

function DemoPageContent({ page }: { page: React.ReactNode }) {
    return (
        <div className="py-4 flex text-center ml-[3%]">
            {page}
        </div>
    );
}

function SidebarFooter({ mini }: SidebarFooterProps) {
    return (
        <Typography variant="caption" className='m-1 whitespace-nowrap overflow-hidden'>
            {mini ? `© ${new Date().getFullYear()}` : `© ${new Date().getFullYear()} Made by huoshen80`}
        </Typography>
    );
}

function CustomAppTitle() {
    const location = useLocation();
    const pagepath = location.pathname;
    return (
        <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt='Reina' src='/images/reina.png' onDragStart={(event) => event.preventDefault()} />
            <Typography variant="h6">ReinaManager</Typography>
            <Chip size="small" label="BETA" color="info" />
            {Toolbarsswitch(pagepath) && <SearchBox />}
        </Stack>
    );
}

interface LayoutProps {
    title: string;
    outpage: React.ReactElement;
    path: string;
}
export const Layout: React.FC<LayoutProps> = ({ title, outpage, path }) => {

    return (
        <ReactRouterAppProvider
            navigation={NAVIGATION}
            theme={demoTheme}
        >
            <DashboardLayout
                slots={{
                    appTitle: CustomAppTitle,
                    toolbarActions: Toolbarsswitch(path) ? Toolbars : ThemeSwitcher,
                    sidebarFooter: SidebarFooter,
                }} sidebarExpandedWidth={180} defaultSidebarCollapsed={true}
            >
                <Typography variant="h5" sx={{
                    marginLeft: '3%',
                    marginTop: '1%',
                }}>{title}</Typography>
                <DemoPageContent page={outpage} />
            </DashboardLayout>
        </ReactRouterAppProvider>
    );
}
export default Layout;
