import HomeIcon from '@mui/icons-material/Home';
import GamesIcon from '@mui/icons-material/Games';
import SettingsIcon from '@mui/icons-material/Settings';
import { Home } from '@/pages/Home/';
import { Settings } from '@/pages/Settings';
import Card from '@/components/Cards';
import { Libraries } from '@/pages/Libraries';
import { Detail } from '@/pages/Detail';
import { createHashRouter, type RouteObject } from 'react-router';
import React from 'react';
import Layout from '@/components/Layout';
import App from '@/App';

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
                    { title: 'demo1', path: ':id', component: Detail },
                ]
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

// 根据路由配置生成 react-router 路由定义，支持 index 路由
const generateRoutes = (routes: RouteGroup[]): RouteObject[] => {
    return routes.flatMap(group =>
        group.items.map(route => ({
            path: route.path,
            element: route.component ? React.createElement(route.component) : undefined,
            children: route.children
                ? route.children.map(child => ({
                    // 如果为 index 路由，不传 path
                    index: child.index || false,
                    path: child.index ? undefined : child.path,
                    element: child.component ? React.createElement(child.component) : undefined,
                }))
                : undefined,
        }))
    );
};

export const routers = createHashRouter([
    {
        Component: App,
        children: [
            {
                path: '/',
                Component: Layout,
                children: generateRoutes(routes),
            },
        ],
    },
]);
