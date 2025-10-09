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

export const initGunSmith = (container: DependencyContainer) => {

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

    function addGunSmithAssort(){
        for (let presets in modDB.preset) {
            var price = 0
            const presetMainItem = modDB.preset[presets].Items[0]
            const presetMainItemID = vulcanAPI.convertHashID(presetMainItem._id)
            //ClientDB.globals.ItemPresets[id] = DB.Preset[preset].Preset
            for (var i = 1; i < modDB.preset[presets].Items.length; i++) {
                const presetItems = modDB.preset[presets].Items[i]
                assortData.items.push({
                    "_id": vulcanAPI.convertHashID(presetItems._id),
                    "_tpl": presetItems._tpl,
                    "parentId": vulcanAPI.convertHashID(presetItems.parentId),
                    "slotId": presetItems.slotId,
                })
                price += vulcanAPI.getPrice(vulcanAPI.getItem(presetItems._tpl))
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
            })
            price += vulcanAPI.getPrice(vulcanAPI.getItem(presetMainItem._tpl))
            assortData.barter_scheme[presetMainItemID] = [[{
                count: modConfig.EnableOverridePrice ? modConfig.MoneyCount : price*=modConfig.PriceReduceRate,
                _tpl: modConfig.EnableOverridePrice ? modConfig.MoneySet : "5449016a4bdc2d6f028b456f"
            }]]
            assortData.loyal_level_items[presetMainItemID] = 1
        }
    }


    vulcanAPI.access("加载商人模块: 懒人枪匠")
    addGunSmithAssort()
    vulcanAPI.log("新订单已确认，已加入优先生产序列")
    vulcanAPI.waitForTime(2)
    vulcanAPI.fetchAsync()
        .then(data => {
            //console.log('Fetched data:', data);
        })
        .catch(error => {

        });


};
