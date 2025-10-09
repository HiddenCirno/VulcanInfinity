"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initGunSmith = void 0;
const config_json_1 = __importDefault(require("../../config.json"));
//
const initGunSmith = (container) => {
    const vulcanAPI = container.resolve("VulcanCommon");
    const preSptModLoader = container.resolve("PreSptModLoader");
    const databaseServer = container.resolve("DatabaseServer");
    const jsonUtil = container.resolve("JsonUtil");
    const clientDB = databaseServer.getTables();
    const modPath = config_json_1.default.Global.ModPath;
    const modDBPath = `${modPath}${config_json_1.default.TraderModule.GunSmith.Config.Global.ModPath}`;
    const imageFilePath = `./${modDBPath}res/`;
    const modDB = vulcanAPI.loadRecursive(`${modDBPath}`);
    const imageRouter = container.resolve("ImageRouter");
    const configServer = container.resolve("ConfigServer");
    const modConfig = config_json_1.default.TraderModule.GunSmith.Config;
    const assortData = clientDB.traders[modConfig.Trader].assort;
    function addGunSmithAssort() {
        for (let presets in modDB.preset) {
            var price = 0;
            const presetMainItem = modDB.preset[presets].Items[0];
            const presetMainItemID = vulcanAPI.convertHashID(presetMainItem._id);
            //ClientDB.globals.ItemPresets[id] = DB.Preset[preset].Preset
            for (var i = 1; i < modDB.preset[presets].Items.length; i++) {
                const presetItems = modDB.preset[presets].Items[i];
                assortData.items.push({
                    "_id": vulcanAPI.convertHashID(presetItems._id),
                    "_tpl": presetItems._tpl,
                    "parentId": vulcanAPI.convertHashID(presetItems.parentId),
                    "slotId": presetItems.slotId,
                });
                price += vulcanAPI.getPrice(vulcanAPI.getItem(presetItems._tpl));
            }
            assortData.items.push({
                "_id": presetMainItemID,
                "_tpl": presetMainItem._tpl,
                "parentId": "hideout",
                "slotId": "hideout",
                "upd": {
                    "StackObjectsCount": 99999999,
                    "UnlimitedCount": true
                }
            });
            price += vulcanAPI.getPrice(vulcanAPI.getItem(presetMainItem._tpl));
            assortData.barter_scheme[presetMainItemID] = [[{
                        count: modConfig.EnableOverridePrice ? modConfig.MoneyCount : price *= modConfig.PriceReduceRate,
                        _tpl: modConfig.EnableOverridePrice ? modConfig.MoneySet : "5449016a4bdc2d6f028b456f"
                    }]];
            assortData.loyal_level_items[presetMainItemID] = 1;
        }
    }
    vulcanAPI.access("加载商人模块: 懒人枪匠");
    addGunSmithAssort();
    vulcanAPI.log("新订单已确认，已加入优先生产序列");
    vulcanAPI.waitForTime(2);
    vulcanAPI.fetchAsync()
        .then(data => {
        //console.log('Fetched data:', data);
    })
        .catch(error => {
    });
};
exports.initGunSmith = initGunSmith;
//# sourceMappingURL=gunsmith.js.map