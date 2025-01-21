"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
const test_1 = require("./test");
const ritc_1 = require("./ritc");
const config_json_1 = __importDefault(require("../config.json"));
//
class Mod {
    static container;
    preSptLoad(container) {
        const configServer = container.resolve("ConfigServer");
        const traderConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.TRADER);
        const preSptModLoader = container.resolve("PreSptModLoader");
        //container.register<VulcanGlobal>("VulcanGlobal", VulcanGlobal, { lifecycle: Lifecycle.Singleton });
        const staticRouterModService = container.resolve("StaticRouterModService");
        const imageRouter = container.resolve("ImageRouter");
    }
    postSptLoad(container) {
        const Logger = container.resolve("WinstonLogger");
        const PreSptModLoader = container.resolve("PreSptModLoader");
        const databaseServer = container.resolve("DatabaseServer");
        const importerUtil = container.resolve("ImporterUtil");
        const vfs = container.resolve("VFS");
        const jsonUtil = container.resolve("JsonUtil");
        const clientDB = databaseServer.getTables();
    }
    postDBLoad(container) {
        const Logger = container.resolve("WinstonLogger");
        const PreSptModLoader = container.resolve("PreSptModLoader");
        const databaseServer = container.resolve("DatabaseServer");
        const importerUtil = container.resolve("ImporterUtil");
        const vfs = container.resolve("VFS");
        const jsonUtil = container.resolve("JsonUtil");
        const vulcanAPI = container.resolve("VulcanCommon");
        const clientDB = databaseServer.getTables();
        const modPath = config_json_1.default.Global.ModPath;
        //console.log(ModPath)
        const modDB = importerUtil.loadRecursive(`${modPath}db/`);
        var Therapist = "54cb57776803fa99248b456e";
        vulcanAPI.Log("我知晓所有的道路，它们都通往同一个地方。");
        (0, ritc_1.initRITCCore)(container);
        (0, test_1.TestLog)(container);
        //vfs.writeFile(`${ModPath}suit.json`, JSON.stringify(ClientDB.traders["5ac3b934156ae10c4430e83c"].suits, null, 4))
        function GenerateHash(string) {
            const shasum = crypto_1.default.createHash("sha1");
            shasum.update(string);
            return shasum.digest("hex").substring(0, 24);
        }
        function Log(string) {
            Logger.logWithColor("[Console]: " + string, "yellow");
        }
        function Notice(string) {
            Logger.logWithColor("[Console]: " + string, "green");
        }
        function Error(string) {
            Logger.logWithColor("[Console]: " + string, "red");
        }
    }
}
module.exports = { mod: new Mod() };
//# sourceMappingURL=mod.js.map