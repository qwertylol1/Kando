//////////////////////////////////////////////////////////////////////////////////////////
//   _  _ ____ _  _ ___  ____                                                           //
//   |_/  |__| |\ | |  \ |  |    This file belongs to Kando, the cross-platform         //
//   | \_ |  | | \| |__/ |__|    pie menu. Read more on github.com/menu/kando           //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////

// SPDX-FileCopyrightText: Simon Schneegans <code@simonschneegans.de>
// SPDX-License-Identifier: MIT

import { EventEmitter } from 'events';
import Handlebars from 'handlebars';

import { IEditorMenuItem } from '../common/editor-menu-item';
import { IMenu, IBackendInfo } from '../../../common';
import { IconPicker } from './icon-picker';
import { IconThemeRegistry } from '../../../common/icon-theme-registry';
import { ShortcutPicker } from './shortcut-picker';

/**
 * This class is responsible for displaying the properties of the currently edited menu
 * item. It emits events when the user changes one of the properties of the currently
 * edited menu item. The new values are stored in the menu item object before the
 * corresponding event is emitted, so you can access the new values by accessing the
 * properties of the menu item object. It is an event emitter which emits the following
 * events:
 *
 * @fires changed-name - When the user changed the name of the current menu item.
 * @fires changed-icon - When the user changed the icon of the current menu item.
 * @fires changed-shortcut - When the user changed the shortcut of the current menu.
 */
export class Properties extends EventEmitter {
  /**
   * The container is the HTML element which contains the currently edited menu's
   * properties. It is created in the constructor and returned by the getContainer()
   * method.
   */
  private container: HTMLElement = null;

  /**
   * The icon picker is a component that allows the user to select an icon from a
   * filterable grid of icons.
   */
  private iconPicker: IconPicker = null;

  /** The base settings div contains the name input and the icon button. */
  private baseSettings: HTMLElement = null;

  /**
   * The name input is an input element that allows the user to change the name of the
   * currently edited menu item.
   */
  private nameInput: HTMLInputElement = null;

  /** The icon button is a button that allows the user to open the icon picker. */
  private iconButton: HTMLButtonElement = null;

  /**
   * The menu settings div contains the elements shown when the user is editing the root
   * item of a menu.
   */
  private menuSettings: HTMLElement = null;

  /**
   * The open at pointer checkbox is a checkbox that allows the user to toggle whether the
   * menu should open at the pointer position.
   */
  private openAtPointerCheckbox: HTMLInputElement = null;

  /**
   * The shortcut picker is a component that allows the user to select a shortcut for the
   * currently edited menu item.
   */
  private menuShortcutPicker: ShortcutPicker = null;

  /**
   * The currently edited menu item. This is the item whose properties are displayed in
   * this view.
   */
  private activeItem: IEditorMenuItem = null;

  /** If the root item of a menu is edited, this is the menu that is edited. */
  private activeMenu: IMenu = null;

  /**
   * This constructor creates the HTML elements for the menu properties view and wires up
   * all the functionality.
   *
   * @param backend The backend info is used to determine whether the menu properties view
   *   should show a 'Shortcut' label or a 'Shortcut Name' label.
   */
  constructor(backend: IBackendInfo) {
    super();

    const template = Handlebars.compile(require('./templates/properties.hbs').default);

    const div = document.createElement('div');
    div.innerHTML = template({
      shortcutLabel: backend.supportsShortcuts ? 'Shortcut' : 'Shortcut Name',
      shortcutHint: backend.supportsShortcuts
        ? 'This will open the menu.'
        : backend.shortcutHint,
    });

    // The first child of the div is the container.
    this.container = div.firstElementChild as HTMLElement;

    // Store a reference to the base settings div. This contains the name input and the
    // icon button.
    this.baseSettings = div.querySelector('#kando-menu-properties-base-settings');

    // Store a reference to the menu settings div. This contains elements that are only
    // shown when the user is editing the root item of a menu.
    this.menuSettings = div.querySelector('#kando-menu-properties-menu-settings');

    // Emit the 'changed-name' event when the name input changes.
    this.nameInput = div.querySelector('#kando-menu-properties-name') as HTMLInputElement;
    this.nameInput.addEventListener('input', () => {
      if (this.activeItem) {
        this.activeItem.name = this.nameInput.value;
        this.emit('changed-name');
      }
    });

    // Show the icon picker when the icon button is clicked.
    this.iconButton = div.querySelector(
      '#kando-menu-properties-icon-button'
    ) as HTMLButtonElement;
    this.iconButton.addEventListener('click', () => {
      this.iconPicker.show(this.activeItem.icon, this.activeItem.iconTheme);
      this.baseSettings.classList.add('hidden');
    });

    // Create the icon picker and wire up its events.
    this.iconPicker = new IconPicker(
      div.querySelector('#kando-menu-properties-icon-picker')
    );
    this.iconPicker.on('select', (icon, theme) => {
      if (this.activeItem) {
        this.activeItem.icon = icon;
        this.activeItem.iconTheme = theme;

        this.iconButton.innerHTML = IconThemeRegistry.getInstance()
          .getTheme(theme)
          .createDiv(icon).outerHTML;

        this.emit('changed-icon');
      }
    });
    this.iconPicker.on('close', () => {
      this.baseSettings.classList.remove('hidden');
    });

    // Update the 'centered' property of the menu when the checkbox changes.
    this.openAtPointerCheckbox = div.querySelector(
      '#kando-menu-properties-open-at-pointer'
    ) as HTMLInputElement;
    this.openAtPointerCheckbox.addEventListener('change', () => {
      if (this.activeItem) {
        this.activeMenu.centered = !this.openAtPointerCheckbox.checked;
      }
    });

    // Create the shortcut picker and wire up its events.
    this.menuShortcutPicker = new ShortcutPicker(
      div.querySelector('#kando-menu-properties-shortcut-picker')
    );
    this.menuShortcutPicker.on('changed', (shortcut) => {
      if (this.activeMenu) {
        this.activeMenu.shortcut = shortcut;
        this.emit('changed-shortcut');
      }
    });
  }

  /** This method returns the container of the menu preview. */
  public getContainer(): HTMLElement {
    return this.container;
  }

  /** This method shows the properties view. It adds the 'visible' class to the container. */
  public show() {
    this.container.classList.add('visible');
  }

  /**
   * This method hides the properties view. It removes the 'visible' class from the
   * container.
   */
  public hide() {
    this.container.classList.remove('visible');
  }

  /**
   * Make this Properties view display the properties of the given menu.
   *
   * @param menu The menu whose properties should be displayed.
   */
  public setMenu(menu: IMenu) {
    // This will update the name input and the icon button.
    this.setItem(menu.nodes);

    this.activeMenu = menu;
    this.openAtPointerCheckbox.checked = !menu.centered;
    this.menuShortcutPicker.setShortcut(menu.shortcut);

    // Show the menu settings.
    this.menuSettings.classList.remove('hidden');
  }

  /**
   * Make this Properties view display the properties of the given menu item.
   *
   * @param item The menu item whose properties should be displayed.
   */
  public setItem(item: IEditorMenuItem) {
    if (this.activeItem !== item) {
      this.activeMenu = null;
      this.activeItem = item;
      this.nameInput.value = item.name;
      this.iconButton.innerHTML = IconThemeRegistry.getInstance()
        .getTheme(item.iconTheme)
        .createDiv(item.icon).outerHTML;

      this.baseSettings.classList.remove('hidden');
      this.iconPicker.hide();
      this.menuSettings.classList.add('hidden');
    }
  }
}
