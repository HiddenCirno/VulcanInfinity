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
import { VFS } from "@spt/utils/VFS"
import { NotificationSendHelper } from "@spt/helpers/NotificationSendHelper";
import { NotifierHelper } from "@spt/helpers/NotifierHelper";
import { QuestHelper } from "@spt/helpers/QuestHelper";
import { ImporterUtil } from "@spt/utils/ImporterUtil"
import { BundleLoader } from "@spt/loaders/BundleLoader";
import { VulcanCommon } from "../../[火神之心]VulcanCore/src/vulcan-api/Common";
import { IQuestConfig } from "@spt/models/spt/config/IQuestConfig";
import Config from "../config.json"

//

export const initRITCCore = (container: DependencyContainer) => {

    const preSptModLoader = container.resolve("PreSptModLoader");
    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
    const importerUtil = container.resolve<ImporterUtil>("ImporterUtil")
    const vfs = container.resolve<VFS>("VFS");
    const jsonUtil = container.resolve<JsonUtil>("JsonUtil");
    const vulcanAPI = container.resolve<VulcanCommon>("VulcanCommon")
    const clientDB = databaseServer.getTables();
    const modPath = Config.Global.ModPath
    const modDB = importerUtil.loadRecursive(`${modPath}db/`)
    const packageFolderPath = `${modPath}package/`
    const packageFolder = importerUtil.loadRecursive(packageFolderPath)
    const imageRouter = container.resolve<ImageRouter>("ImageRouter");
    const configServer = container.resolve<ConfigServer>("ConfigServer");
    const inventoryConfig = configServer.getConfig<IInventoryConfig>(ConfigTypes.INVENTORY);
    const questConfig = configServer.getConfig<IQuestConfig>(ConfigTypes.QUEST);
    vulcanAPI.Access("启用核心组件: 罗德岛驻塔科夫贸易中心")
    vulcanAPI.Log("正在尝试与Rhodes Island™取得神经连接……")
    vulcanAPI.waitForTime(2)
    vulcanAPI.Log("开始读取扩展包……")
    var PackInfo = {}
    var PackActiveCount = 0
    var PackInactiveCount = 0
    for (let pack in packageFolder) {
        const info = packageFolder[pack].package
        const active = packageFolder[pack].package.Active
        PackInfo[pack] = {}
        PackInfo[pack].Name = info.Name
        PackInfo[pack].Desc = info.Desc
        PackInfo[pack].Version = info.Version
        PackInfo[pack].Active = info.Active
        if (active || active == null) {
            PackActiveCount++
            const packagePath = `${packageFolderPath}${info.pathname}/`
            const packageItem = importerUtil.loadRecursive(`${packagePath}items/`)
            const packageTrader = importerUtil.loadRecursive(`${packagePath}traders/`)
            const packageLocale = importerUtil.loadRecursive(`${packagePath}res/locale/`)
            const packageQuest = packageTrader.questdata
            vulcanAPI.Log(`发现启用的扩展包：${info.Name}`)
            vulcanAPI.Log("开始解析扩展包……")
            vulcanAPI.Log("加载自定义资源文件……")
            vulcanAPI.addCustomBundles(`${packagePath}`)
            const iconList = vfs.getFiles(`${packagePath}res/image/`);
            for (const icon of iconList) {
                const filename = vfs.stripExtension(icon);
                imageRouter.addRoute(`/files/quest/icon/${filename}`, `${packagePath}res/image/${icon}`);
            }
            vulcanAPI.Log("反序列化物品数据……")
            vulcanAPI.initItemRITC(packageItem.ritcitem, 1)
            vulcanAPI.initItemRITC(packageItem.mgitem, 2)
            vulcanAPI.initItemRITC(packageItem.superitem, 3)
            vulcanAPI.initGiftData(packageTrader.GiftData)
            vulcanAPI.initPreset(packageTrader.PresetData)
            for (var i = 0; i < info.Config.CustomMoney.length; i++) {
                inventoryConfig.customMoneyTpls.push(vulcanAPI.convertHashID(info.Config.CustomMoney[i]))
            }
            for (var i = 0; i < info.Config.LootBlackList.length; i++) {
                vulcanAPI.excludeItem(vulcanAPI.convertHashID(info.Config.LootBlackList[i]))
            }
            for (let i in info.Config.GenerateList) {
                vulcanAPI.addWorldGenerate(vulcanAPI.convertHashID(i), info.Config.GenerateList[i])
            }
            for (var i = 0; i < info.Config.CustomRagfairBlackList.length; i++) {
                clientDB.templates.items[vulcanAPI.convertHashID(info.Config.CustomRagfairBlackList[i])]._props.CanSellOnRagfair = false
            }
            for (var i = 0; i < info.Config.CustomRagfairWhiteList.length; i++) {
                clientDB.templates.items[vulcanAPI.convertHashID(info.Config.CustomRagfairBlackList[i])]._props.CanSellOnRagfair = true
            }
            vulcanAPI.Log("反序列化商人数据……")
            vulcanAPI.initTradersRITC(info, packageTrader, packagePath)
            vulcanAPI.Log("反序列化任务数据……")
            vulcanAPI.initQuest(packageQuest.initQuest)
            vulcanAPI.initQuestCond(packageQuest.QuestConditions)
            vulcanAPI.initQuestReward(packageQuest.QuestRewards)
            vulcanAPI.loadQuestLocaleRITC(info, packageLocale.quest)
            //vulcanAPI.initLocaleRITC(info, packageLocale.text)
            vulcanAPI.initLocale(packageLocale.text)
            //vulcanAPI.initDailyQuest(packageQuest.RepeatableQuests)
            vulcanAPI.Log("反序列化交易数据……")
            vulcanAPI.initAssortData(packageTrader.AssortData)
            vulcanAPI.Log("反序列化配方数据……")
            vulcanAPI.initRecipe(packageTrader.RecipeData)
            vulcanAPI.initScavCase(packageTrader.ScavCaseData)
            vulcanAPI.Log("扩展包解析完成。")
        }
        else {
            PackInactiveCount++
        }

        //VFS.writeFile(`${modPath}QtExport.json`, JSON.stringify(clientDB.templates.quests, null, 4))
        //VFS.writeFile(`${modPath}RcExport.json`, JSON.stringify(clientDB.hideout, null, 4))
        //VFS.writeFile(`${modPath}AsExport.json`, JSON.stringify(clientDB.traders, null, 4))

    }
    vulcanAPI.fetchAsync()
        .then(data => {
            //console.log('Fetched data:', data);
        })
        .catch(error => {
            //console.error('Error:', error);
            var packstr = ""
            for (let i in PackInfo) {
                //vulcanAPI.Log(`${PackInfo[i].Name}: ${PackInfo[i].Desc}`)
                packstr += `${PackInfo[i].Name}\n版本: ${PackInfo[i].Version}\n状态: ${(PackInfo[i].Active || PackInfo[i].Active == null) ? "已启用" : "未启用"}\n说明: ${PackInfo[i].Desc}\n`
            }
            vulcanAPI.Log(`\nRITC: 加载并启用了${PackActiveCount}个扩展包，有${PackInactiveCount}个扩展包未启用。\n扩展包列表: \n${packstr}`)
        });
    //VFS.writeFile(`${modPath}export.json`, JSON.stringify(questConfig.repeatableQuests, null, 4))
    /*
    var ItemMap = {}
    var QuestMap = {}
    for(let i in package.RITCExample.SearchMap.items){
        if(package.RITCExample.SearchMap.items[i]._props?.Prefab?.path.length>0){
            ItemMap[package.RITCExample.SearchMap.items[i]._id] = {}
            ItemMap[package.RITCExample.SearchMap.items[i]._id].ID = package.RITCExample.SearchMap.items[i]._id
            ItemMap[package.RITCExample.SearchMap.items[i]._id].Name = Locale[`${package.RITCExample.SearchMap.items[i]._id} Name`]
            ItemMap[package.RITCExample.SearchMap.items[i]._id].ShortName = Locale[`${package.RITCExample.SearchMap.items[i]._id} ShortName`]
            ItemMap[package.RITCExample.SearchMap.items[i]._id].Description = Locale[`${package.RITCExample.SearchMap.items[i]._id} Description`]
        }
    }
    for(let q in package.RITCExample.SearchMap.quests){
        QuestMap[q] = {}
        QuestMap[q].ID = package.RITCExample.SearchMap.quests[q]._id
        QuestMap[q].Name = Locale[`${package.RITCExample.SearchMap.quests[q]._id} name`]
        QuestMap[q].Description = Locale[`${package.RITCExample.SearchMap.quests[q]._id} description`]
        QuestMap[q].Trader = Locale[`${package.RITCExample.SearchMap.quests[q].traderId} Nickname`]
        QuestMap[q].Conditions = {}
        for(var c = 0; c < package.RITCExample.SearchMap.quests[q].conditions.AvailableForFinish.length; c++){
            QuestMap[q].Conditions[package.RITCExample.SearchMap.quests[q].conditions.AvailableForFinish[c].id] = Locale[`${package.RITCExample.SearchMap.quests[q].conditions.AvailableForFinish[c].id}`]
        }

    }
    */
    //VFS.writeFile(`${modPath}ItemMap.json`, JSON.stringify(ItemMap, null, 4))
    //VFS.writeFile(`${modPath}QuestMap.json`, JSON.stringify(QuestMap, null, 4))
    //vulcanAPI.initItem(DB.templates.items, 1)
    //vulcanAPI.initItem(DB.templates.mgitem, 2)
    //vulcanAPI.initItem(DB.templates.superitem, 3)
    //vulcanAPI.addCustomBundles(`${modPath}db/templates/test/`)

};
