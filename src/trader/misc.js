"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initTraderModuleMisc = void 0;
const Traders_1 = require("C:/snapshot/project/obj/models/enums/Traders");
const config_json_1 = __importDefault(require("../../config.json"));
//
const initTraderModuleMisc = (container) => {
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
    if (config_json_1.default.TraderModule.Misc.EnableLightkeeperOnTraderPage) {
        vulcanAPI.Access("加载商人模块: 随身老登");
        clientDB.traders[Traders_1.Traders.LIGHTHOUSEKEEPER].assort = {
            items: [],
            barter_scheme: {},
            loyal_level_items: {}
        };
        clientDB.traders[Traders_1.Traders.LIGHTHOUSEKEEPER].base.availableInRaid = false;
        vulcanAPI.Log("收到来自Lightkeeper的通讯，已自动转接至情报中心");
        vulcanAPI.waitForTime(2);
    }
};
exports.initTraderModuleMisc = initTraderModuleMisc;
//# sourceMappingURL=misc.js.map