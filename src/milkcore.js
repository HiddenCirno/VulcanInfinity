"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMilkCore = void 0;
const config_json_1 = __importDefault(require("../config.json"));
//
const initMilkCore = (container) => {
    const logger = container.resolve("WinstonLogger");
    const preSptModLoader = container.resolve("PreSptModLoader");
    const databaseServer = container.resolve("DatabaseServer");
    const importerUtil = container.resolve("ImporterUtil");
    const vfs = container.resolve("VFS");
    const jsonUtil = container.resolve("JsonUtil");
    const clientDB = databaseServer.getTables();
    const modPath = config_json_1.default.Global.ModPath;
    const modDB = importerUtil.loadRecursive(`${modPath}db/`);
    var Therapist = "54cb57776803fa99248b456e";
    const vulcanAPI = container.resolve("VulcanCommon");
    vulcanAPI.Access("启用核心组件: 牛奶盒");
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
                Item._props.MaxResource = caculate(getFoodData(id).energy, getFoodData(id).hydration);
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
        if (vulcanAPI.getItem(itemid) != null) {
            return {
                energy: vulcanAPI.getItem(itemid)._props.effects_health.Energy != null ? vulcanAPI.getItem(itemid)._props.effects_health.Energy.value : 0,
                hydration: vulcanAPI.getItem(itemid)._props.effects_health.Hydration != null ? vulcanAPI.getItem(itemid)._props.effects_health.Hydration.value : 0
            };
        }
    }
    function isFood(itemid) {
        var Tag = vulcanAPI.getTag(vulcanAPI.getItem(itemid));
        if (Tag != null) {
            if (Tag == "5b47574386f77428ca22b336" || Tag == "5b47574386f77428ca22b335") {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return 0;
        }
    }
};
exports.initMilkCore = initMilkCore;
//# sourceMappingURL=milkcore.js.map