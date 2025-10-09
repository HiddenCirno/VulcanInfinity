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

export const initArrowMarker = (container: DependencyContainer) => {

    const vulcanAPI = container.resolve<VulcanCommon>("VulcanCommon")
    const preSptModLoader = container.resolve("PreSptModLoader");
    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
    const jsonUtil = container.resolve<JsonUtil>("JsonUtil");
    const clientDB = databaseServer.getTables();
    const clientItems = clientDB.templates.items;
    const modPath = Config.Global.ModPath
    const modConfig = Config.BattleModule.ArrowMarker.Config
    const modDBPath = `${modPath}${modConfig.Global.ModPath}`
    const imageFilePath = `./${modDBPath}res/`
    const modDB = vulcanAPI.loadRecursive(`${modDBPath}`)
    const imageRouter = container.resolve<ImageRouter>("ImageRouter");
    const configServer = container.resolve<ConfigServer>("ConfigServer");
    const resourceLoaded = preSptModLoader.getImportedModsNames().includes("火神重工-资源包")
    const Marks = modConfig.Global.MarkerData
    const clientBot = clientDB.bots.types

    function insertBeforeDot(input, insert) {
        // 使用正则表达式查找最后一个点
        return input.replace(/(.*)\./, `$1${insert}.`);
    }
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
    function addMarkerToBot() {
        var inventoryStr = "ArmBand"
        if (modConfig.EnableLootableMode) {
            inventoryStr = "Earpiece"
        }
        for (var i = 0; i < Marks.length; i++) {
            for (var j = 0; j < Marks[i].bot.length; j++) {
                clientBot[Marks[i].bot[j]].inventory.equipment[inventoryStr] = {}
                clientBot[Marks[i].bot[j]].chances.equipment[inventoryStr] = 100
                clientBot[Marks[i].bot[j]].inventory.equipment[inventoryStr][vulcanAPI.convertHashID(modConfig.EnableSpecialMarker ? Marks[i].special : Marks[i].mark)] = 100
            }
        }
        if (modConfig.EnableESPMode) {
            for (let i in modDB.items) {
                if (clientItems[vulcanAPI.convertHashID(modDB.items[i]._id)]) {
                    const ItemData = clientItems[vulcanAPI.convertHashID(modDB.items[i]._id)]
                    if (!ItemData._props.Prefab.path.includes("_spec")) {
                        ItemData._props.Prefab.path = insertBeforeDot(ItemData._props.Prefab.path, "_xray")
                    }
                }
            }
        }
    }
    //当前时间23:42 02.01.2025
    //我服了, 你怎么也是旧格式啊= =
    //翻新翻新, 全部翻新
    //那我把检测写了就可以发内测了
    //干
    //当前时间17:42 02.09.2025
    //咕了好久, 笑死
    //这套参数不太行, 留档一下
    /*
    "RolloffMultiplier": 1.5,
            "GunsCompressorSendLevel": -6,
            "ClientPlayerCompressorSendLevel": -5,
            "ObservedPlayerCompressorSendLevel": -4,
            "NpcCompressorSendLevel": -7,
            "EnvTechnicalCompressorSendLevel": -20,
            "EnvNatureCompressorSendLevel": -10,
            "EnvCommonCompressorSendLevel": -12,
            "AmbientCompressorSendLevel": -20,
            "EffectsReturnsCompressorSendLevel": -80,
            "HeadphonesMixerVolume": -5,
            "AmbientVolume": -42,
            "DryVolume": -52,
            "EffectsReturnsGroupVolume": -8,
            "Distortion": 0.05,
            "CompressorThreshold": -30,
            "CompressorAttack": 18,
            "CompressorRelease": 150,
            "CompressorGain": 6,
            "HighpassFreq": 220,
            "HighpassResonance": 1.8,
            "LowpassFreq": 16500,
            "EQBand1Frequency": 180,
            "EQBand1Gain": -1.2,
            "EQBand1Q": 1.3,
            "EQBand2Frequency": 2000,
            "EQBand2Gain": 1.6,
            "EQBand2Q": 0.9,
            "EQBand3Frequency": 6300,
            "EQBand3Gain": 1.8,
            "EQBand3Q": 0.65
            */
    //当前时间15:14 02.10.2025
    //开写开写


    vulcanAPI.access("加载作战模块: 箭头标记")
    vulcanAPI.log("侦测到未知信号源, 已进行自动标记")
    vulcanAPI.initItemWithResource(modDB.items, resourceLoaded)
    addAssortToTrader(modDB.items, modConfig.Global.TraderID, modConfig.Global.EnableSellOnTrader)
    addMarkerToBot()
    vulcanAPI.waitForTime(2)
    vulcanAPI.fetchAsync()
        .then(data => {
            //console.log('Fetched data:', data);
        })
        .catch(error => {

        });


};
