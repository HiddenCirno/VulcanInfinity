import { DependencyContainer, Lifecycle } from "tsyringe";
import crypto from "crypto";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { DialogueHelper } from "@spt/helpers/DialogueHelper";
import { IPostSptLoadMod } from "@spt/models/external/IPostSptLoadMod";
import type { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ImageRouter } from "@spt/routers/ImageRouter";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { ITraderConfig, UpdateTime } from "@spt/models/spt/config/ITraderConfig";
import { IModLoader } from "@spt/models/spt/mod/IModLoader";
import { PreSptModLoader } from "@spt/loaders/PreSptModLoader";
import { JsonUtil } from "@spt/utils/JsonUtil";
import { Traders } from "@spt/models/enums/Traders";
import { QuestStatus } from "@spt/models/enums/QuestStatus";
import { MessageType } from "@spt/models/enums/MessageType";
import { HashUtil } from "@spt/utils/HashUtil";
import { VFS } from "@spt/utils/VFS"
import { NotificationSendHelper } from "@spt/helpers/NotificationSendHelper";
import { NotifierHelper } from "@spt/helpers/NotifierHelper";
import { QuestHelper } from "@spt/helpers/QuestHelper";
import { ImporterUtil } from "@spt/utils/ImporterUtil"
import { BundleLoader } from "@spt/loaders/BundleLoader";
import { VulcanCommon } from "../../[火神之心]VulcanCore/src/vulcan-api/Common";
import { TestLog } from "./test";
import { initRITCCore } from "./ritc";
import Config from "../config.json"
//
class Mod implements IPreSptLoadMod {
    private static container: DependencyContainer;
    public preSptLoad(container: DependencyContainer): void {
        const configServer = container.resolve<ConfigServer>("ConfigServer");
        const traderConfig = configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER);
        const preSptModLoader = container.resolve("PreSptModLoader");
        //container.register<VulcanGlobal>("VulcanGlobal", VulcanGlobal, { lifecycle: Lifecycle.Singleton });
        const staticRouterModService = container.resolve<StaticRouterModService>("StaticRouterModService");
        const imageRouter = container.resolve<ImageRouter>("ImageRouter")
    }
    public postSptLoad(container: DependencyContainer): void {
        const Logger = container.resolve<ILogger>("WinstonLogger");
        const PreSptModLoader = container.resolve("PreSptModLoader");
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const importerUtil = container.resolve<ImporterUtil>("ImporterUtil")
        const vfs = container.resolve<VFS>("VFS");
        const jsonUtil = container.resolve<JsonUtil>("JsonUtil");
        const clientDB = databaseServer.getTables();
    }
    public postDBLoad(container: DependencyContainer): void {
        const Logger = container.resolve<ILogger>("WinstonLogger");
        const PreSptModLoader = container.resolve("PreSptModLoader");
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const importerUtil = container.resolve<ImporterUtil>("ImporterUtil")
        const vfs = container.resolve<VFS>("VFS");
        const jsonUtil = container.resolve<JsonUtil>("JsonUtil");
        const vulcanAPI = container.resolve<VulcanCommon>("VulcanCommon")
        const clientDB = databaseServer.getTables();
        const modPath = Config.Global.ModPath
        //console.log(ModPath)
        const modDB = importerUtil.loadRecursive(`${modPath}db/`)
        var Therapist = "54cb57776803fa99248b456e"
        vulcanAPI.Log("我知晓所有的道路，它们都通往同一个地方。")
        initRITCCore(container)
        TestLog(container)

        //vfs.writeFile(`${ModPath}suit.json`, JSON.stringify(ClientDB.traders["5ac3b934156ae10c4430e83c"].suits, null, 4))
        function GenerateHash(string) {
            const shasum = crypto.createHash("sha1");
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
module.exports = { mod: new Mod() }