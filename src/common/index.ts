//////////////////////////////////////////////////////////////////////////////////////////
//   _  _ ____ _  _ ___  ____                                                           //
//   |_/  |__| |\ | |  \ |  |    This file belongs to Kando, the cross-platform         //
//   | \_ |  | | \| |__/ |__|    pie menu. Read more on github.com/kando-menu/kando     //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////

// SPDX-FileCopyrightText: Simon Schneegans <code@simonschneegans.de>
// SPDX-License-Identifier: MIT

/** This interface describes some information about the currently used backend. */
export interface IBackendInfo {
  /**
   * Each backend should return a suitable window type here. The window type determines
   * how Kando's window is drawn. The most suitable type is dependent on the operating
   * system and the window manager. For example, on GNOME, the window type "dock" seems to
   * work best, on KDE "toolbar" provides a better experience. On Windows, "toolbar" is
   * the only type that works.
   * https://www.electronjs.org/docs/latest/api/browser-window#new-browserwindowoptions
   *
   * @returns The window type to use for the pie menu window.
   */
  windowType: string;

  /**
   * There are some backends which do not support custom shortcuts. In this case, the user
   * will not be able to change the shortcuts in the settings. Instead, the user will set
   * a shortcut ID and then assign a shortcut in the operating system.
   */
  supportsShortcuts: boolean;

  /**
   * This hint is shown in the editor next to the shortcut-id input field if
   * supportsShortcuts is false. It should very briefly explain how to change the
   * shortcuts in the operating system. If supportsShortcuts is true, this is not
   * required.
   */
  shortcutHint?: string;
}

/**
 * A simple 2D vector.
 *
 * You can find some vector math in the `src/renderer/math` directory.
 */
export interface IVec2 {
  x: number;
  y: number;
}

/**
 * This interface is used to describe an element of a key sequence. It contains the DOM
 * name of the key, a boolean indicating whether the key is pressed or released and a
 * delay in milliseconds.
 */
export interface IKeyStroke {
  name: string;
  down: boolean;
  delay: number;
}

/**
 * This type is used to describe a sequence of key strokes. It is used to simulate
 * keyboard shortcuts.
 */
export type IKeySequence = Array<IKeyStroke>;

/** The menu consists of a tree of menu items. */
export interface IMenuItem {
  /** The type of the menu item. See `ItemActionRegistry` and `ItemTypeRegistry`. */
  type: string;

  /**
   * The data of the menu item. What this contains depends on the type. Usually, only leaf
   * menu items will have this field.
   */
  data?: unknown;

  /** The name of the menu item. This may be displayed with some kind of label. */
  name: string;

  /** The icon of the menu item. */
  icon: string;

  /** The theme from which the above icon should be used. */
  iconTheme: string;

  /**
   * The children of this menu item. If this property is set, the menu item represents a
   * submenu.
   */
  children?: Array<IMenuItem>;

  /**
   * The direction of the menu item in degrees. If not set, it will be computed when the
   * menu is opened. If set, it is considered to be a "fixed angle" and all siblings will
   * be distributed more or less evenly around.
   */
  angle?: number;
}

/**
 * This interface describes a menu. It contains the root item of the menu, the shortcut to
 * open the menu and a flag indicating whether the menu should be opened in the center of
 * the screen or at the mouse pointer.
 *
 * This interface is used to describe one of the configured menus in the settings file.
 */
export interface IMenu {
  /** The root item of the menu. */
  root: IMenuItem;

  /**
   * The shortcut to open the menu. Something like 'Control+Space'.
   *
   * @todo: Add description of the format of the shortcut string.
   */
  shortcut: string;

  /**
   * Some backends do not support direct binding of shortcuts. In this case, the user will
   * not be able to change the shortcut in the settings. Instead, the user provides an ID
   * for the shortcut and can then assign a key binding in the operating system.
   */
  shortcutID: string;

  /**
   * If true, the menu will open in the screen's center. Else it will open at the mouse
   * pointer.
   */
  centered: boolean;
}

/**
 * This interface describes the content of the menu settings file. It contains the
 * configured menus as well as the currently stashed menus.
 */
export interface IMenuSettings {
  menus: Array<IMenu>;

  /** The currently stashed menu items. */
  stash: Array<IMenuItem>;
}

/**
 * This interface describes the content of the app settings file. It contains the names of
 * the themes to use for the menu and the editor.
 */
export interface IAppSettings {
  /** The name of the theme to use for the menu. */
  menuTheme: string;

  /** The name of the theme to use for the editor. */
  editorTheme: string;

  /** Whether the sidebar should be shown in the editor. */
  sidebarVisible: boolean;
}
