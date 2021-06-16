/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const GETTEXT_DOMAIN = 'my-indicator-extension';

const { GObject, St } = imports.gi;

const Gettext = imports.gettext.domain(GETTEXT_DOMAIN);
const _ = Gettext.gettext;

const Lang = imports.lang
const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Me = ExtensionUtils.getCurrentExtension();

const CPUSysfs = Me.imports.cpusysfs;
const { CPUFreqIndicator } = Me.imports.indicator;

const UPDATE_INTERVAL = 5;


const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init(path) {
        super._init(0.0, _('CPU Frequency'));

        let cpus = CPUSysfs.get_cpus();

        this.indicators = [];
		for (let cpu of cpus) {
			this.indicators.push(new CPUFreqIndicator(path, cpu));
		}

        let box = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
		for (let indicator of this.indicators) {
			box.add_actor(indicator.actor);
			this.menu.addMenuItem(indicator.menuitem);
        }
        this.add_child(box);

        this.running = true;
    }
});


class Extension {
    constructor(meta) {
        this._uuid = meta.uuid;
        this._path = meta.path;

        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }
    

    enable() {
        this._indicator = new Indicator(this._path);
        Main.panel.addToStatusArea(this._uuid, this._indicator);

		this._update_handler = Mainloop.timeout_add_seconds(
            UPDATE_INTERVAL, 
            Lang.bind(this, this.refresh)
        );
    }

    refresh() {
        for (let ind of this._indicator.indicators) {
           ind.update();
        }
        return this._indicator.running
    }

    disable() {
        this._indicator.running = false;
		Mainloop.source_remove(this._update_handler);
        this._indicator.destroy();
        this._indicator = null;
    }
}


function init(meta) {
    return new Extension(meta);
}
