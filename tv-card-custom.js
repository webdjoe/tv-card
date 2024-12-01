const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;

const sources = {
    "netflix": {"source": "Netflix", "icon": "mdi:netflix"},
    "spotify": {"source": "Spotify", "icon": "mdi:spotify"},
    "youtube": {"source": "YouTube", "icon": "mdi:youtube"},
};

var fireEvent = function(node, type, detail, options) {
    options = options || {};
    detail = detail === null || detail === undefined ? {} : detail;
    var event = new Event(type, {
        bubbles: options.bubbles === undefined ? true : options.bubbles,
        cancelable: Boolean(options.cancelable),
        composed:  options.composed === undefined ? true : options.composed,

    });
    event.detail = detail;
    console.log(event)
    node.dispatchEvent(event);
    return event;
};

const handleAction = async (node, _hass, config, action, ) => {
    fireEvent(node, 'hass-action', { config, action });
  };


class TVCardServices extends LitElement {
    constructor() {
        super();

        this.custom_keys = {};
        this.custom_sources = {};
        this.custom_icons = {};
	this.state_entity = '';
        this.rows = {};

        this.holdtimer = null;
        this.holdaction = null;
        this.holdinterval = null;
        this.timer = null;
    }

    static get properties() {
        return {
            _hass: {},
	    _config: {},
            _apps: {},
            trigger: {},
        };
    }

	static getStubConfig() {
        return {};
    }

	set hass(hass) {
        this._hass = hass;
        if (this.volume_slider) this.volume_slider.hass = hass;
        if (this._hassResolve) this._hassResolve();
    }

    getCardSize() {
        return 7;
    }

    setConfig(config) {
        if (!config.entity) {
            console.log("Invalid configuration");
            return;
        }
        this._config = { theme: "default", ...config };
        switch(config.platform) {
            case "androidtv": {
                this.keys = {
                    "power": {"key": "POWER", "icon": "mdi:power"},
                    "volume_up": {"key": "VOLUME_UP", "icon": "mdi:volume-plus"},
                    "volume_down": {"key": "VOLUME_DOWN", "icon": "mdi:volume-minus"},
                    "volume_mute": {"key": "MUTE", "icon": "mdi:volume-mute"},
                    "return": {"key": "BACK", "icon": "mdi:arrow-left"},
                    "home": {"key": "HOME", "icon": "mdi:home"},
                    "up": {"key": "UP", "icon": "mdi:chevron-up"},
                    "left": {"key": "LEFT", "icon": "mdi:chevron-left"},
                    "enter": {"key": "CENTER", "icon": "mdi:checkbox-blank-circle"},
                    "enter_hold": {"key": "CENTER", "icon": "mdi:checkbox-blank-circle"},
                    "right": {"key": "RIGHT", "icon": "mdi:chevron-right"},
                    "down": {"key": "DOWN", "icon": "mdi:chevron-down"},
                    "rewind": {"key": "REWIND", "icon": "mdi:rewind"},
                    "play": {"key": "RESUME", "icon": "mdi:play"},
                    "fast_forward": {"key": "FAST_FORWARD", "icon": "mdi:fast-forward"},
                    "menu": {"key": "MENU", "icon": "mdi:menu"},
                    "settings": {"key": "SETTINGS", "icon": "mdi:cog"},
                };
                break;
            }
            case "webostv": {
                this.keys = {
                    "volume_up": {"key": "VOLUMEUP", "icon": "mdi:volume-plus"},
                    "volume_down": {"key": "VOLUMEDOWN", "icon": "mdi:volume-minus"},
                    "volume_mute": {"key": "MUTE", "icon": "mdi:volume-mute"},
                    "return": {"key": "BACK", "icon": "mdi:arrow-left"},
                    "info": {"key": "INFO", "icon": "mdi:information"},
                    "home": {"key": "HOME", "icon": "mdi:home"},
                    "channel_up": {"key": "CHANNELUP", "icon": "mdi:arrow-up"},
                    "channel_down": {"key": "CHANNELDOWN", "icon": "mdi:arrow-down"},
                    "up": {"key": "UP", "icon": "mdi:chevron-up"},
                    "left": {"key": "LEFT", "icon": "mdi:chevron-left"},
                    "enter": {"key": "ENTER", "icon": "mdi:checkbox-blank-circle"},
                    "enter_hold": {"key": "ENTER", "icon": "mdi:checkbox-blank-circle"},
                    "right": {"key": "RIGHT", "icon": "mdi:chevron-right"},
                    "down": {"key": "DOWN", "icon": "mdi:chevron-down"},
                    "play": {"key": "PLAY", "icon": "mdi:play"},
                    "pause": {"key": "PAUSE", "icon": "mdi:pause"},
                    "menu": {"key": "MENU", "icon": "mdi:menu"},
                    "guide": {"key": "GUIDE", "icon": "mdi:television-guide"},
                    "exit": {"key": "EXIT", "icon": "mdi:close"},
                };
                break;
            }
            case "roku": {
                let remote_entity = !config.remote_entity ? "remote." + config.entity.split(".")[1] : config.remote_entity;
                this.keys = {
                    "power": {"icon": "mdi:power", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "power"}},
                    "volume_up": {"icon": "mdi:volume-plus", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "volume_up"}},
                    "volume_down": {"icon": "mdi:volume-minus", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "volume_down"}},
                    "volume_mute": {"icon": "mdi:volume-mute", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "volume_mute"}},
                    "return": {"icon": "mdi:arrow-left", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "back"}},
                    "info": {"icon": "mdi:asterisk", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "info"}},
                    "home": {"icon": "mdi:home", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "home"}},
                    "channel_up": {"icon": "mdi:arrow-up", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "channel_up"}},
                    "channel_down": {"icon": "mdi:arrow-down", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "channel_down"}},
                    "up": {"icon": "mdi:chevron-up", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "up"}},
                    "left": {"icon": "mdi:chevron-left", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "left"}},
                    "enter": {"icon": "mdi:checkbox-blank-circle", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "select"}},
                    "enter_hold": {"icon": "mdi:checkbox-blank-circle", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "select"}},
                    "right": {"icon": "mdi:chevron-right", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "right"}},
                    "down": {"icon": "mdi:chevron-down", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "down"}},
                    "rewind": {"icon": "mdi:rewind", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "reverse"}},
                    "play": {"icon": "mdi:play-pause", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "play"}},
                    "fast_forward": {"icon": "mdi:fast-forward", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "forward"}},
                };
                break;
            }
            case "braviatv": {
                let remote_entity = !config.remote_entity ? "remote." + config.entity.split(".")[1] : config.remote_entity;
                this.keys = {
                    "power": {"icon": "mdi:power", "service": "remote.toggle", "service_data": { "entity_id": remote_entity}},
                    "source": {"icon": "mdi:import", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Input"}},
                    "volume_up": {"icon": "mdi:volume-plus", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "VolumeUp"}},
                    "volume_down": {"icon": "mdi:volume-minus", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "VolumeDown"}},
                    "volume_mute": {"icon": "mdi:volume-mute", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Mute"}},
                    "return": {"icon": "mdi:arrow-u-left-top", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Return"}},
                    "info": {"icon": "mdi:asterisk", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "GGuide"}},
                    "home": {"icon": "mdi:home", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Home"}},
                    "channel_up": {"icon": "mdi:arrow-up", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "ChannelUp"}},
                    "channel_down": {"icon": "mdi:arrow-down", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "ChannelDown"}},
                    "up": {"icon": "mdi:chevron-up", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Up"}},
                    "left": {"icon": "mdi:chevron-left", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Left"}},
                    "enter": {"icon": "mdi:checkbox-blank-circle", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "DpadCenter"}},
                    "right": {"icon": "mdi:chevron-right", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Right"}},
                    "down": {"icon": "mdi:chevron-down", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Down"}},
                    "rewind": {"icon": "mdi:rewind", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Rewind"}},
                    "play": {"icon": "mdi:play-pause", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Play"}},
                    "pause": {"icon": "mdi:pause", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Pause"}},
                    "fast_forward": {"icon": "mdi:fast-forward", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Forward"}},
                    "settings": {"icon": "mdi:cog", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Options"}},
                    "assistant": {"icon": "mdi:google-assistant", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Assistant"}},
                    "netflix": {"icon": "mdi:netflix", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Netflix"}},
                    "num_0": {"icon": "mdi:numeric-0", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Num0"}},
                    "num_1": {"icon": "mdi:numeric-1", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Num1"}},
                    "num_2": {"icon": "mdi:numeric-2", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Num2"}},
                    "num_3": {"icon": "mdi:numeric-3", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Num3"}},
                    "num_4": {"icon": "mdi:numeric-4", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Num4"}},
                    "num_5": {"icon": "mdi:numeric-5", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Num5"}},
                    "num_6": {"icon": "mdi:numeric-6", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Num6"}},
                    "num_7": {"icon": "mdi:numeric-7", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Num7"}},
                    "num_8": {"icon": "mdi:numeric-8", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Num8"}},
                    "num_9": {"icon": "mdi:numeric-9", "service": "remote.send_command", "service_data": { "entity_id": remote_entity, "command": "Num9"}},
                };
                break;
            }
            case "samsungtv":
            default: {
                this.keys = {
                    "power": {"key": "KEY_POWER", "icon": "mdi:power"},
                    "volume_up": {"key": "KEY_VOLUP", "icon": "mdi:volume-plus"},
                    "volume_down": {"key": "KEY_VOLDOWN", "icon": "mdi:volume-minus"},
                    "volume_mute": {"key": "KEY_MUTE", "icon": "mdi:volume-mute"},
                    "return": {"key": "KEY_RETURN", "icon": "mdi:arrow-u-left-top"},
                    "source": {"key": "KEY_SOURCE", "icon": "mdi:video-input-hdmi"},
                    "info": {"key": "KEY_INFO", "icon": "mdi:television-guide"},
                    "home": {"key": "KEY_HOME", "icon": "mdi:home"},
                    "channel_up": {"key": "KEY_CHUP", "icon": "mdi:arrow-up-thin-circle-outline"},
                    "channel_down": {"key": "KEY_CHDOWN", "icon": "mdi:arrow-down-thin-circle-outline"},
                    "up": {"key": "KEY_UP", "icon": "mdi:chevron-up"},
                    "left": {"key": "KEY_LEFT", "icon": "mdi:chevron-left"},
                    "enter": {"key": "KEY_ENTER", "icon": "mdi:checkbox-blank-circle"},
                    "enter_hold": {"key": "KEY_ENTER", "icon": "mdi:checkbox-blank-circle"},
                    "right": {"key": "KEY_RIGHT", "icon": "mdi:chevron-right"},
                    "down": {"key": "KEY_DOWN", "icon": "mdi:chevron-down"},
                    "rewind": {"key": "KEY_REWIND", "icon": "mdi:rewind"},
                    "play": {"key": "KEY_PLAY", "icon": "mdi:play"},
                    "pause": {"key": "KEY_PAUSE", "icon": "mdi:pause"},
                    "fast_forward": {"key": "KEY_FF", "icon": "mdi:fast-forward"},
                    "num_1": {"key": "KEY_1", "icon": "mdi:numeric-1"},
                    "num_2": {"key": "KEY_2", "icon": "mdi:numeric-2"},
                    "num_3": {"key": "KEY_3", "icon": "mdi:numeric-3"},
                    "num_4": {"key": "KEY_4", "icon": "mdi:numeric-4"},
                    "num_5": {"key": "KEY_5", "icon": "mdi:numeric-5"},
                    "num_6": {"key": "KEY_6", "icon": "mdi:numeric-6"},
                    "num_7": {"key": "KEY_7", "icon": "mdi:numeric-7"},
                    "num_8": {"key": "KEY_8", "icon": "mdi:numeric-8"},
                    "num_9": {"key": "KEY_9", "icon": "mdi:numeric-9"},
                    "num_0": {"key": "KEY_0", "icon": "mdi:numeric-0"},
                    "redbutton": {"key": "KEY_RED", "icon": "mdi:alpha-r-box"},
                    "greenbutton": {"key": "KEY_GREEN", "icon": "mdi:alpha-g-box"},
                    "yellowbutton": {"key": "KEY_YELLOW", "icon": "mdi:alpha-y-box"},
                    "bluebutton": {"key": "KEY_BLUE", "icon": "mdi:alpha-b-box"},
               };
            }
        }

        this.custom_keys    = config.custom_keys || {};
        this.custom_sources = config.custom_sources || {};
        this.custom_icons   = config.custom_icons || {};
	    this.state_entity   = config.state_entity || {};
        this.rows           = config.rows || {};

        this.loadCardHelpers();
        this.renderVolumeSlider();
    }
    isButtonEnabled(row, button) {
        if (!(this._config[row] instanceof Array)) return false;

        return this._config[row].includes(button);
    }

    get hass() {
        return this._hass;
    }

    async loadCardHelpers() {
        this._helpers = await (window).loadCardHelpers();
        if (this._helpersResolve) this._helpersResolve();
    }

    async renderVolumeSlider() {
        if (this._helpers === undefined)
            await new Promise((resolve) => (this._helpersResolve = resolve));
        if (this._hass === undefined)
            await new Promise((resolve) => (this._hassResolve = resolve));
        this._helpersResolve = undefined;
        this._hassResolve = undefined;

        let volume_entity = (this._config.volume_entity === undefined) ? this._config.entity : this._config.volume_entity;
        let slider_config = {
            "type": "custom:my-slider",
            "entity": volume_entity,
            "height": "50px",
            "mainSliderColor": "white",
            "secondarySliderColor": "rgb(60, 60, 60)",
            "mainSliderColorOff": "rgb(60, 60, 60)",
            "secondarySliderColorOff": "rgb(60, 60, 60)",
            "thumbWidth": "0px",
            "thumbHorizontalPadding": "0px",
            "radius": "25px",
        };

        if (this._config.slider_config instanceof Object) {
            slider_config = {...slider_config, ...this._config.slider_config };
        }

        this.volume_slider = await this._helpers.createCardElement(slider_config);
        this.volume_slider.style = "flex: 0.9;";
        this.volume_slider.ontouchstart = (e) => {
            e.stopImmediatePropagation();
            if (this._config.enable_button_feedback === undefined || this._config.enable_button_feedback) fireEvent(window, "haptic", "light");
        };
        this.volume_slider.addEventListener("input", (e) => {
            if (this._config.enable_slider_feedback === undefined || this._config.enable_slider_feedback) fireEvent(window, "haptic", "light");
        }, true);

        this.volume_slider.hass = this._hass;
        this.triggerRender();
    }

    sendKey(key) {
        let entity_id = this._config.entity;
		let platform = entity_id.match('input_text.') ? 'command' : this._config.platform;
        switch ( platform ) {
        case("androidtv"):
            this._hass.callService("androidtv", "adb_command", {
                command: key
            }, { entity_id: entity_id });
        break;
        case("webostv"):
            this._hass.callService("webostv", "button", {
                button: key
            }, { entity_id: entity_id });
        break;
	case("command"):  // command via input_text. entity
	    this._hass.callService("input_text", "set_value",  {
		entity_id: entity_id, value: key, });
	break;
        default:  // samsungtv, braviatv, roku via 'media_player'
	    if( platform != '' && entity_id.match('media_player.') ) {
	        this._hass.callService("media_player", "play_media", {
		    media_content_id: key,
		    media_content_type: "send_key",
	        }, { entity_id: entity_id });
	    }else {
	        console.log("Invalid: no platform/(input text.) entity");
	    }
        }  //  switch (
    }  //   sendKey(key) {

    sendAction(action){
        let info = this.custom_keys[action] || this.custom_sources[action] || this.keys[action] || sources[action];
        console.info(info);
        if (info.key) {
            this.sendKey(info.key);
        }
        else if (info.source) {
            this.changeSource(info.source);
        }
        else if (info.service) {
            const [domain, service] = info.service.split(".", 2);
            this._hass.callService(domain, service, info.service_data);
        } else if (info.fire_service) {
            let tap_action = structuredClone(info);
            delete tap_action.fire_service;

            let eventDetails = {}
            eventDetails.entity = this._config.entity;
            tap_action.action = info.fire_service;
            eventDetails.tap_action = tap_action;
            console.info(eventDetails);
            handleAction(this, this._hass, eventDetails, 'tap')

        }
    }

    changeSource(source) {
        let entity_id = this._config.entity;

        // supported by androidtv, samsungtv (i'm not sure about webostv)
        this._hass.callService("media_player", "select_source", {
            source: source,
            entity_id: entity_id,
        });
    }

    onClick(event) {
        event.stopImmediatePropagation();
        let click_action = () => {
            this.sendAction("enter")
            if (this._config.enable_button_feedback === undefined || this._config.enable_button_feedback) fireEvent(window, "haptic", "light");
        };
        if (this._config.enable_double_click) {
            this.timer = setTimeout(click_action, 200);
        } else {
            click_action();
        }
    }

    onDoubleClick(event) {
        if (this._config.enable_double_click !== undefined && !this._config.enable_double_click) return;

        event.stopImmediatePropagation();

        clearTimeout(this.timer);
        this.timer = null;

        this.sendAction(this._config.double_click_action ? this._config.double_click_action : "return")
        if (this._config.enable_button_feedback === undefined || this._config.enable_button_feedback) fireEvent(window, "haptic", "success");
    }

    onTouchStart(event) {
        event.stopImmediatePropagation();

        this.holdaction = "enter_hold";
        this.holdtimer = setTimeout(() => {
            if(this.holdaction == "enter_hold"){
                this.sendAction(this.holdaction)
                if (this._config.enable_button_feedback === undefined || this._config.enable_button_feedback) fireEvent(window, "haptic", "light");
            }
            else {
                //hold
                this.holdinterval = setInterval(() => {
                    this.sendAction(this.holdaction)
                    if (this._config.enable_button_feedback === undefined || this._config.enable_button_feedback) fireEvent(window, "haptic", "light");
                }, 300);
            }
        }, 700);
        window.initialX = event.touches[0].clientX;
        window.initialY = event.touches[0].clientY;
    }

    onTouchEnd(event) {
        clearTimeout(this.timer);
        clearTimeout(this.holdtimer);
        clearInterval(this.holdinterval);

        this.holdtimer = null;
        this.timer = null;
        this.holdinterval = null;
        this.holdaction = null;
    }

    onTouchMove(event) {
        if (!initialX || !initialY) {
            return;
        }

        var currentX = event.touches[0].clientX;
        var currentY = event.touches[0].clientY;

        var diffX = initialX - currentX;
        var diffY = initialY - currentY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            // sliding horizontally

            let action = diffX > 0 ? "left" : "right";
            this.holdaction = action;
            this.sendAction(action);
        } else {
            // sliding vertically
            let action = diffY > 0 ? "up" : "down";
            this.holdaction = action;

            this.sendAction(action);
        }

        if (this._config.enable_button_feedback === undefined || this._config.enable_button_feedback) fireEvent(window, "haptic", "selection");
        initialX = null;
        initialY = null;
    }

    handleActionClick(e) {
        let action = e.currentTarget.action;
        this.sendAction(action);

        if (this._config.enable_button_feedback === undefined || this._config.enable_button_feedback) fireEvent(window, "haptic", "light");
    }

    buildIconButton(action) {
        let button_info = this.custom_keys[action] || this.custom_sources[action] || this.keys[action] || sources[action] || {};

        let icon = button_info.icon;
        let custom_svg_path = this.custom_icons[icon];
        let color = ""; // var(--icon-primary-color);
		color = this._getIconColor(action);

        return html`
            <ha-icon-button
                .action="${action}"
                @click="${this.handleActionClick}"
                title="${action}"
                .path="${custom_svg_path ? custom_svg_path : ""}"
                >
                <ha-icon
                    .icon="${!custom_svg_path? icon : ""}"
					style="color: ${color}"
                    ></ha-icon>
            </ha-icon-button>
        `;
    }

	//	style="color='${color}'"
	//	--card-mod-icon-color:"${color}"
	//	color="${color}"

    _getIconColor(_action) {
		let color = ''; // var(--icon-primary-color);
		switch(_action) {
			case('power'):
				color = 'gold';
				this._state = this._getStateValue(this.state_entity);
				if( this._state == "" ) return color;

				switch(this._state) {
					case('true'):
					case('on'): color = 'tomato'; break;
					case('false'):
					case('off'): color = 'lime'; break
					default: color = this._state.toString();
				}
				break;
			case('redbutton'):    color = 'tomato'; break;
			case('greenbutton'):  color = 'mediumseagreen'; break;
			case('yellowbutton'): color = 'gold'; break;
			case('bluebutton'):   color = 'dodgerblue'; break;
			case('check'):        color = 'gold'; break;
			default: color = '';
		}
		return color;
	}

	_getStateValue(entity) {
		let stateStr = '';

		if (this._hass && this._hass.states[entity]) {
			const state = this._hass.states[entity];
			stateStr = state.state || state.state == "" ? state.state.toString() : "Unavailable";  // .toString() escape 0 as false
			if (stateStr == "Unavailable") {
				throw new Error(`Entity ${entity} State Unavailable`);
			}
			return stateStr;
		}else if( entity != '' ) {  // entity is config string
			return entity;
		}
		return '';
	}

    buildRow(content) {
        return html `
            <div class="row">
                ${content}
            </div>
        `;
    }

    buildButtonsFromActions(actions) {
        return actions.map((action) => this.buildIconButton(action));
    }

    triggerRender() {
        this.trigger = Math.random();
    }

    render() {
        if (!this._config || !this._hass || !this.volume_slider) {
            return html ``;
        }

        const preset_rows = ["navigation_row","numpad_row","volume_row"]

        var content = [];
        Object.keys(this.rows).forEach((row_name) => {
			let row_actions = this.rows[row_name];

			if (preset_rows.includes(row_name)) {
				if (row_name === "volume_row") {
					let volume_row = [];
					if (this.rows.volume_row == "buttons") {
						volume_row = [
							this.buildIconButton("volume_mute"),
							this.buildIconButton("volume_down"),
							this.buildIconButton("volume_up"),
						];
					} else if (this.rows.volume_row == "slider") {
						volume_row = [this.volume_slider];
					}
					content.push(volume_row);
				} else if (row_name === "navigation_row") {
					let navigation_row = [];

					if (this.rows.navigation_row == "buttons") {
						let up_row = [this.buildIconButton("up")];
						let middle_row = [
							this.buildIconButton("left"),
							this.buildIconButton("enter"),
							this.buildIconButton("right"),
						];
						let down_row = [this.buildIconButton("down")];
						navigation_row = [up_row, middle_row, down_row];
					} else if (this.rows.navigation_row == "touchpad") {
						var touchpad = [html `
								<toucharea
									id="toucharea"
									@click="${this.onClick}"
									@dblclick="${this.onDoubleClick}"
									@touchstart="${this.onTouchStart}"
									@touchmove="${this.onTouchMove}"
									@touchend="${this.onTouchEnd}">
 								</toucharea>
                        `];
						navigation_row = [touchpad];
					} else if (this.rows.navigation_row == "touch") {
						var touchpad = [
							html`
								<toucharea
									id="toucharea"
									@click="${this.onClick}"
									@dblclick="${this.onDoubleClick}"
									@touchstart="${this.onTouchStart}"
									@touchmove="${this.onTouchMove}"
									@touchend="${this.onTouchEnd}"
								>
								</toucharea>
							`,
						];
						navigation_row = [touchpad];
					}
					content.push(...navigation_row);

				} else if (row_name === "numpad_row") {
					if (this.rows.numpad_row == true || this.rows.this.rows.numpad_row == "buttons") {
						let numpad_row = [
							[
								this.buildIconButton("num_1"),
								this.buildIconButton("num_2"),
								this.buildIconButton("num_3"),
							],
							[
								this.buildIconButton("num_4"),
								this.buildIconButton("num_5"),
								this.buildIconButton("num_6"),
							],
							[
								this.buildIconButton("num_7"),
								this.buildIconButton("num_8"),
								this.buildIconButton("num_9"),
							],
							[
								this.buildIconButton("channel_down"),
								this.buildIconButton("num_0"),
								this.buildIconButton("channel_up"),
							],
						];
						content.push(...numpad_row);
					}
				}
			} else {
				if (!!row_actions) {
					let row_content = this.buildButtonsFromActions(row_actions);
					content.push(row_content);
				}
			}
		});

        content = content.map(this.buildRow);

        var output = html `
            ${this.renderStyle()}
            <ha-card .header="${this._config.title}">${content}</ha-card>
        `;

        return html `${output}`;
    }

    renderStyle() {
        return html `
            <style>
                .remote {
                    padding: 5px 0px 5px 0px;
                }
                img,
                ha-icon-button {
                    width: 36px;
                    height: 36px;
                    cursor: pointer;
                    --mdc-icon-size: 90%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .row {
                    display: flex;
                    padding: 10px 0px 10px 0px;
                    justify-content: space-evenly;
                }
                .diagonal {
                    background-color: var(--light-primary-color);
                }
                toucharea {
                    border-radius: 30px;
                    flex-grow: 1;
                    height: 160px;
                    background: #6d767e;
                    touch-action: none;
                    text-align: center;
                }
            </style>
        `;
    }

    applyThemesOnElement(element, themes, localTheme) {
        if (!element._themes) {
            element._themes = {};
        }
        let themeName = themes.default_theme;
        if (localTheme === "default" || (localTheme && themes.themes[localTheme])) {
            themeName = localTheme;
        }
        const styles = Object.assign({}, element._themes);
        if (themeName !== "default") {
            var theme = themes.themes[themeName];
            Object.keys(theme).forEach((key) => {
                var prefixedKey = "--" + key;
                element._themes[prefixedKey] = "";
                styles[prefixedKey] = theme[key];
            });
        }
        if (element.updateStyles) {
            element.updateStyles(styles);
        } else if (window.ShadyCSS) {
            // implement updateStyles() method of Polemer elements
            window.ShadyCSS.styleSubtree(
                /** @type {!HTMLElement} */
                (element),
                styles
            );
        }

        const meta = document.querySelector("meta[name=theme-color]");
        if (meta) {
            if (!meta.hasAttribute("default-content")) {
                meta.setAttribute("default-content", meta.getAttribute("content"));
            }
            const themeColor =
                styles["--primary-color"] || meta.getAttribute("default-content");
            meta.setAttribute("content", themeColor);
        }
    }
}

customElements.define("tv-card-custom", TVCardServices);
