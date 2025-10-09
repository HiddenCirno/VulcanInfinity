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

export const initItemPack = (container: DependencyContainer) => {

    const vulcanAPI = container.resolve<VulcanCommon>("VulcanCommon")
    const preSptModLoader = container.resolve("PreSptModLoader");
    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
    const jsonUtil = container.resolve<JsonUtil>("JsonUtil");
    const clientDB = databaseServer.getTables();
    const clientItems = clientDB.templates.items;
    const modPath = Config.Global.ModPath
    const modConfig = Config.ItemModule.ItemPack.Config
    const modDBPath = `${modPath}${modConfig.Global.ModPath}`
    const imageFilePath = `./${modDBPath}res/`
    const modDB = vulcanAPI.loadRecursive(`${modDBPath}`)
    const imageRouter = container.resolve<ImageRouter>("ImageRouter");
    const configServer = container.resolve<ConfigServer>("ConfigServer");
    const resourceLoaded = preSptModLoader.getImportedModsNames().includes("火神重工-资源包")
    const weaponType = [
        "5447b6254bdc2dc3278b4568", //Sniper
        "617f1ef5e8b54b0998387733", //Revolver??
        "5447b6094bdc2dc3278b4567", //Shotgun
        "5447b5fc4bdc2d87278b4567", //AssaultCarbine
        "5447bedf4bdc2d87278b4568", //Launcher
        "5447b5e04bdc2d62278b4567", //SMG
        "5447b6194bdc2d67278b4567", //DMR
        "5447bee84bdc2dc3278b4569", //Special
        "5447bed64bdc2d97278b4568", //MachineGun
        "5447b5cf4bdc2d65278b4567", //Pistol
        "5447b5f14bdc2d61278b4567"  //AssaultRifle
    ]
    function addAssortToTrader(item, traderid, bools) {
        if (bools) {
            const assort = clientDB.traders[traderid].assort
            const hashkeys = "11.13.2001-11.23.2019"
            for (let i in item) {
                const itemData = item[i]
                const itemID = vulcanAPI.convertHashID(itemData._id)
                var cacheItemID = vulcanAPI.generateHash(`${itemID}_${hashkeys}_enablesell`)
                assort.items.push({
                    _id: cacheItemID,
                    _tpl: itemID,
                    parentId: "hideout",
                    slotId: "hideout",
                    upd: {
                        UnlimitedCount: true,
                        StackObjectsCount: 999999
                    }
                })
                assort.barter_scheme[cacheItemID] = [[{
                    count: itemData._props.DefaultPrice,
                    _tpl: "5449016a4bdc2d6f028b456f"
                }]]
                assort.loyal_level_items[cacheItemID] = 1
            }

        }
    }
    clientItems["633ec6ee025b096d320a3b15"]._props.Cartridges[0]._props.filters[0].Filter.push(vulcanAPI.convertHashID("PS19C"))
    //console.log(clientItems["633ec6ee025b096d320a3b15"]._props.Cartridges[0]._props.filters[0].Filter)
    //当前时间23:38 02.01.2024
    //尼玛的物品包怎么是你妈的旧格式啊
    //需要彻底翻新, 你妈的
    //先扔着吧
    //那就只剩箭头了
    //努努力今晚发内测版
    //开写!
    vulcanAPI.access("加载物品模块: 千叶的物品包")
    vulcanAPI.log("这句加载词我没想好所以先这样")
    vulcanAPI.initItemWithResource(modDB.items, resourceLoaded)
    addAssortToTrader(modDB.items, modConfig.Global.TraderID, modConfig.Global.EnableSellOnTrader)
    vulcanAPI.waitForTime(2)
    vulcanAPI.fetchAsync()
        .then(data => {
            //console.log('Fetched data:', data);
        })
        .catch(error => {
        });


};
