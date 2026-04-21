declare module '@react-navigation/drawer' {
  import type { ComponentType } from 'react';

  export interface DrawerContentComponentProps {
    navigation: any;
    [key: string]: any;
  }

  export function createDrawerNavigator<
    ParamList extends Record<string, object | undefined> = Record<string, object | undefined>,
  >(): any;

  export type DrawerNavigationProp<
    ParamList extends Record<string, object | undefined> = Record<string, object | undefined>,
    RouteName extends keyof ParamList = keyof ParamList,
  > = any;

  export const DrawerContentScrollView: ComponentType<any>;
}
