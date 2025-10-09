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

export const initMilkCore = (container: DependencyContainer) => {
    const vulcanAPI = container.resolve<VulcanCommon>("VulcanCommon")
    const logger = container.resolve<ILogger>("WinstonLogger");
    const preSptModLoader = container.resolve("PreSptModLoader");
    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
    const importerUtil = container.resolve<ImporterUtil>("ImporterUtil")
    const jsonUtil = container.resolve<JsonUtil>("JsonUtil");
    const clientDB = databaseServer.getTables();
    const modPath = Config.Global.ModPath
    const modDB = vulcanAPI.loadRecursive(`${modPath}db/`)
    var Therapist = "54cb57776803fa99248b456e"

    vulcanAPI.Access("启动核心系统: 牛奶盒")
    vulcanAPI.Log("私人健康助理已上线，火神集团提醒您，合理饮食有助于身心健康")
    vulcanAPI.waitForTime(2)
    ModStart()
    vulcanAPI.fetchAsync()
        .then(data => {
            //console.log('Fetched data:', data);
        })
        .catch(error => {
            ModStart()
            vulcanAPI.Log("饮食规划完成，牛奶盒正在运行")
        });
    function ModStart() {
        const ITEM = databaseServer.getTables().templates.items
        for (let it in ITEM) {
            const Item = ITEM[it]
            const id = ITEM[it]._id
            if (isFood(id)) {
                const dur = caculate(getFoodData(id).energy, getFoodData(id).hydration)
                if (dur > 0) {
                    Item._props.MaxResource = dur
                }
            }
        }
    }
    function caculate(a, b) {
        if (a == 0) {
            return Math.abs(b)
        }
        if (b == 0) {
            return Math.abs(a)
        }
        var max = Math.max(Math.abs(a), Math.abs(b));
        //var min = Math.abs(Math.min(a, b));
        return max
    }
    function getFoodData(itemid) {
        const item = vulcanAPI.getItem(itemid);
        if (item == null) return { energy: 0, hydration: 0 };
        const effects = item?._props?.effects_health;
        if (item != null) {
            return {
                energy: effects?.Energy?.value ?? 0,
                hydration: effects?.Hydration?.value ?? 0
            }
        }
    }
    function isFood(itemid) {
        const Tag = vulcanAPI.getTag(vulcanAPI.getItem(itemid))
        if (Tag != null) {
            if (Tag == "5b47574386f77428ca22b336" || Tag == "5b47574386f77428ca22b335") {
                return true
            }
            else {
                return false
            }
        }
        else {
            return false
        }
    }


};
