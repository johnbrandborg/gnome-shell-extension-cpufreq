const St = imports.gi.St;
const Panel = imports.ui.panel;
const PopupMenu = imports.ui.popupMenu;
const Gio = imports.gi.Gio;

class CPUFreqIndicator {
    constructor(path, cpu) {
        this.cpu = cpu;

        let paths = {
            na:  path + "/icons/cpufreq-na.png",
            25:  path + "/icons/cpufreq-25.png",
            50:  path + "/icons/cpufreq-50.png",
            75:  path + "/icons/cpufreq-75.png",
            100: path + "/icons/cpufreq-100.png"
        }
       
        this.icons = {};
        for (let p in paths) {
            let icon = Gio.icon_new_for_string(paths[p]);
            this.icons[p] = icon;
        }
        
        this.actor = new St.BoxLayout();
        this.icon = new St.Icon({
			gicon: this.icons.na,
            icon_size: Panel.PANEL_ICON_SIZE
		});
        
        this.actor.add_actor(this.icon);
        this.menuitem = new PopupMenu.PopupMenuItem("cpu" + this.cpu.id, { reactive: false, style_class: "cpu" });
        this.update();
    }
    
    update() {
        this.icon.gicon = this.icons[this.cpu.get_current_frequency_range()];
        this.menuitem.label.set_text("cpu" + this.cpu.id + ": " + this.cpu.get_current_frequency_formated() +  " (" + this.cpu.get_current_goveror() + ")");
    }
}
