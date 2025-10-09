"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMilkCore = void 0;
const config_json_1 = __importDefault(require("../../config.json"));
//
const initMilkCore = (container) => {
    const vulcanAPI = container.resolve("VulcanCommon");
    const logger = container.resolve("WinstonLogger");
    const preSptModLoader = container.resolve("PreSptModLoader");
    const databaseServer = container.resolve("DatabaseServer");
    const importerUtil = container.resolve("ImporterUtil");
    const jsonUtil = container.resolve("JsonUtil");
    const clientDB = databaseServer.getTables();
    const modPath = config_json_1.default.Global.ModPath;
    const modDB = vulcanAPI.loadRecursive(`${modPath}db/`);
    var Therapist = "54cb57776803fa99248b456e";
    vulcanAPI.Access("启动核心系统: 牛奶盒");
    vulcanAPI.Log("私人健康助理已上线，火神集团提醒您，合理饮食有助于身心健康");
    vulcanAPI.waitForTime(2);
    ModStart();
    vulcanAPI.fetchAsync()
        .then(data => {
        //console.log('Fetched data:', data);
    })
        .catch(error => {
        ModStart();
        vulcanAPI.Log("饮食规划完成，牛奶盒正在运行");
    });
    function ModStart() {
        const ITEM = databaseServer.getTables().templates.items;
        for (let it in ITEM) {
            const Item = ITEM[it];
            const id = ITEM[it]._id;
            if (isFood(id)) {
                const dur = caculate(getFoodData(id).energy, getFoodData(id).hydration);
                if (dur > 0) {
                    Item._props.MaxResource = dur;
                }
            }
        }
    }
    function caculate(a, b) {
        if (a == 0) {
            return Math.abs(b);
        }
        if (b == 0) {
            return Math.abs(a);
        }
        var max = Math.max(Math.abs(a), Math.abs(b));
        //var min = Math.abs(Math.min(a, b));
        return max;
    }
    function getFoodData(itemid) {
        const item = vulcanAPI.getItem(itemid);
        if (item == null)
            return { energy: 0, hydration: 0 };
        const effects = item?._props?.effects_health;
        if (item != null) {
            return {
                energy: effects?.Energy?.value ?? 0,
                hydration: effects?.Hydration?.value ?? 0
            };
        }
    }
    function isFood(itemid) {
        const Tag = vulcanAPI.getTag(vulcanAPI.getItem(itemid));
        if (Tag != null) {
            if (Tag == "5b47574386f77428ca22b336" || Tag == "5b47574386f77428ca22b335") {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
};
exports.initMilkCore = initMilkCore;
//# sourceMappingURL=milkcore.js.map