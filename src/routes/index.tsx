import type { Navigation } from '@toolpad/core';
import HomeIcon from '@mui/icons-material/Home';
import GamesIcon from '@mui/icons-material/Games';
import SettingsIcon from '@mui/icons-material/Settings';
import { Home } from '@/pages/Home/';
import { Libraries } from '@/pages/Libraries';
import { Settings } from '@/pages/Settings';
import { Detail } from '@/pages/Detail';

export interface RouteConfig {
    path: string;
    page: JSX.Element;
    title: string;
}
export const routes: RouteConfig[] = [
    {
        path: '/',
        title: '首页',
        page: <Home />
    },
    {
        path: '/libraries',
        title: '游戏仓库',
        page: <Libraries />
    },
    {
        path: '/details/:id',
        title: '游戏详情',
        page: <Detail />
    },
    {
        path: '/settings',
        title: '设置',
        page: <Settings />
    }
]

//menu菜单列表及其路由
export const NAVIGATION: Navigation = [
    {
        kind: 'header',
        title: '菜单',
    },
    {
        title: '主页',
        icon: <HomeIcon />,
    },
    {
        segment: 'libraries',
        title: '游戏仓库',
        icon: <GamesIcon />,
    },
    {
        segment: 'settings',
        title: '设置',
        icon: <SettingsIcon />,
    }
];

export default routes