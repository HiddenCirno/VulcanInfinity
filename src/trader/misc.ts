import { DependencyContainer } from "tsyringe";
import crypto from "crypto";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { DialogueHelper } from "@spt/helpers/DialogueHelper";
import { IPostAkiLoadMod } from "@spt/models/external/IPostAkiLoadMod";
import type { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ImageRouter } from "@spt/routers/ImageRouter";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { ITraderConfig, UpdateTime } from "@spt/models/spt/config/ITraderConfig";
import { IInventoryConfig } from "@spt/models/spt/config/IInventoryConfig";
import { IModLoader } from "@spt/models/spt/mod/IModLoader";
import { PreSptModLoader } from "@spt/loaders/PreSptModLoader";
import { JsonUtil } from "@spt/utils/JsonUtil";
import { Traders } from "@spt/models/enums/Traders";
import { QuestStatus } from "@spt/models/enums/QuestStatus";
import { MessageType } from "@spt/models/enums/MessageType";
import { HashUtil } from "@spt/utils/HashUtil";
import { NotificationSendHelper } from "@spt/helpers/NotificationSendHelper";
import { NotifierHelper } from "@spt/helpers/NotifierHelper";
import { QuestHelper } from "@spt/helpers/QuestHelper";
import { ImporterUtil } from "@spt/utils/ImporterUtil"
import { BundleLoader } from "@spt/loaders/BundleLoader";
import { VulcanCommon } from "../../../[火神之心]VulcanCore/src/vulcan-api/Common";
import { IQuestConfig } from "@spt/models/spt/config/IQuestConfig";
import Config from "../../config.json";

//

export const initTraderModuleMisc = (container: DependencyContainer) => {

    const vulcanAPI = container.resolve<VulcanCommon>("VulcanCommon")
    const preSptModLoader = container.resolve("PreSptModLoader");
    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
    const jsonUtil = container.resolve<JsonUtil>("JsonUtil");
    const clientDB = databaseServer.getTables();
    const modPath = Config.Global.ModPath
    const modDBPath = `${modPath}${Config.TraderModule.GunSmith.Config.Global.ModPath}`
    const imageFilePath = `./${modDBPath}res/`
    const modDB = vulcanAPI.loadRecursive(`${modDBPath}`)
    const imageRouter = container.resolve<ImageRouter>("ImageRouter");
    const configServer = container.resolve<ConfigServer>("ConfigServer");
    const modConfig = Config.TraderModule.GunSmith.Config
    const assortData = clientDB.traders[modConfig.Trader].assort

    if(Config.TraderModule.Misc.EnableLightkeeperOnTraderPage){
        vulcanAPI.Access("加载商人模块: 随身老登")

        clientDB.traders[Traders.LIGHTHOUSEKEEPER].assort = {
            items: [],
            barter_scheme: {},
            loyal_level_items: {}
        }
        clientDB.traders[Traders.LIGHTHOUSEKEEPER].base.availableInRaid = false;
        vulcanAPI.Log("收到来自Lightkeeper的通讯，已自动转接至情报中心")
        vulcanAPI.waitForTime(2)
    }


};
