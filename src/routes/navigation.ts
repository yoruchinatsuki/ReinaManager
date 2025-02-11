import React from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router';
import type { Navigation } from '@toolpad/core';
import App from '@/App';
import Layout from '@/components/Layout';
import { routes, type RouteGroup } from './config';

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

// 根据路由配置生成导航结构时过滤掉默认（index）子路由
const generateNavigation = (routes: RouteGroup[]): Navigation => {
  return routes.flatMap(group => [
    {
      kind: 'header' as const,
      title: group.groupTitle,
    },
    ...group.items.map(route => ({
      kind: 'page' as const,
      title: route.title,
      segment: route.path,
      icon: route.icon,
      children: route.children
        ? route.children
            .filter(child => !child.index) // 过滤掉 index 路由
            .map(child => ({
              kind: 'page' as const,
              segment: child.path,
              title: child.title,
            }))
        : undefined,
    })),
  ]);
};

export const routers = createBrowserRouter([
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

export const NAVIGATION = generateNavigation(routes);