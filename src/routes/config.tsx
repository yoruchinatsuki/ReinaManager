import HomeIcon from '@mui/icons-material/Home';
import GamesIcon from '@mui/icons-material/Games';
import SettingsIcon from '@mui/icons-material/Settings';
import { Home } from '@/pages/Home/';
import { Settings } from '@/pages/Settings';
import { Detail } from '@/pages/Detail';
import Card from '@/components/Cards';
import { Libraries } from '@/pages/Libraries';

export interface RouteConfig {
    title: string;
    path?: string;
    component?: React.ComponentType;
    icon?: React.ReactNode;
    index?: boolean;
    children?: RouteConfig[];
}

export interface RouteGroup {
    groupTitle: string;
    items: RouteConfig[];
}

// 统一的路由配置
export const routes: RouteGroup[] = [
    {
        groupTitle: '菜单',
        items: [
            {
                title: '主页',
                path: '',
                component: Home,
                icon: <HomeIcon />,
            },
            {
                title: '游戏仓库',
                path: 'libraries',
                component: Libraries,
                icon: <GamesIcon />,
                children: [
                    // 默认子路由使用 index
                    { title: '默认', index: true, component: Card },
                    { title: 'demo1', path: 'demo1', component: Detail },
                    { title: 'demo2', path: 'demo2', component: Detail },
                    { title: 'demo3', path: 'demo3', component: Detail },
                ],
            },
            {
                title: '设置',
                path: 'settings',
                component: Settings,
                icon: <SettingsIcon />,
            },
        ],
    },
];
