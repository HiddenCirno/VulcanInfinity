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

export const initVulcanMod = (container: DependencyContainer) => {
    const vulcanAPI = container.resolve<VulcanCommon>("VulcanCommon")
    const logger = container.resolve<ILogger>("WinstonLogger")
    const preSptModLoader = container.resolve("PreSptModLoader")
    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer")
    const jsonUtil = container.resolve<JsonUtil>("JsonUtil")
    const clientDB = databaseServer.getTables()
    const clientItem = databaseServer.getTables().templates.items
    const clientLocale = clientDB.locales.global.ch
    const clientHideout = clientDB.hideout.areas
    const configServer = container.resolve<ConfigServer>("ConfigServer")
    const imageRouter = container.resolve<ImageRouter>("ImageRouter")
    const modPath = Config.Global.ModPath
    const modDBPath = `${modPath}${Config.CoreModule.VulcanMod.Config.Global.ModPath}`
    const modDB = vulcanAPI.loadRecursive(modDBPath)
    var Therapist = "54cb57776803fa99248b456e"
    const imageFilePath = `./${modDBPath}res/`
    const iconList = vulcanAPI.getFiles(`${imageFilePath}questimage/`)
    const customicon = vulcanAPI.getFiles(`${imageFilePath}icon/`)
    const resourceLoaded = preSptModLoader.getImportedModsNames().includes("火神重工-资源包")
    //vulcanAPI.access(resourceLoaded)

    vulcanAPI.access("启动核心系统: 火神重工")
    vulcanAPI.log("正在与普罗米修斯系统建立通讯……")
    vulcanAPI.waitForTime(2)
    vulcanAPI.log("开始执行加载流程……")
    vulcanAPI.log("初始化商人……")
    vulcanAPI.initTrader(modDB.trader, imageFilePath, 0.05, 100, 3600)
    vulcanAPI.log("初始化任务……")
    vulcanAPI.initQuest(modDB.traderdata.quest.init)
    initQuestImage()
    initCustomIcon()
    vulcanAPI.log("反序列化任务数据……")
    //vulcanAPI.initQuestCond(modDB.traderdata.quest.conditions)
    vulcanAPI.initQuest(modDB.traderdata.quest.init_event)
    vulcanAPI.initQuestCond(modDB.traderdata.quest.conditions_event)
    vulcanAPI.initQuestReward(modDB.traderdata.quest.rewards)
    vulcanAPI.log("反序列化成就数据……")
    vulcanAPI.initAchievement(modDB.traderdata.quest.achievement, 6400)
    initAchievementFix(modDB.traderdata.quest.achievement_fix)
    vulcanAPI.log("反序列化商人数据……")
    vulcanAPI.initAssortData(modDB.traderdata.assort_mod)
    vulcanAPI.initAssortData(modDB.traderdata.assort_vanilla)
    vulcanAPI.initAssortData(modDB.traderdata.assort_ammochest)
    vulcanAPI.initAssortData(modDB.traderdata.assort_skillchest)
    vulcanAPI.indexQuestReward()
    vulcanAPI.log("反序列化服装数据……")
    initSuits()
    vulcanAPI.log("反序列化物品数据……")
    vulcanAPI.initItemWithResource(modDB.items, resourceLoaded)
    vulcanAPI.initItemWithResource(modDB.items_ammochest, resourceLoaded)
    vulcanAPI.initItemWithResource(modDB.items_skillchest, resourceLoaded)
    vulcanAPI.initGiftData(modDB.drawpool)
    showChance()
    vulcanAPI.log("五秒后继续加载流程……")
    vulcanAPI.waitForTime(5)
    if (Config.CoreModule.VulcanMod.Config.BotEdit.BossEdit) {
        vulcanAPI.log("正在生成BOSS……")
        initBotEdit()
    }
    if (Config.CoreModule.VulcanMod.Config.DogTagGenerate.Active) {
        vulcanAPI.log("正在冲压狗牌……")
        applyAIDogTag()
    }
    if (Config.CoreModule.VulcanMod.Config.HideoutEdit.Active) {
        vulcanAPI.log("正在修建地堡……")
        vulcanAPI.initArea(modDB.hideout.area)
        initAreaEdit()
    }
    if (Config.CoreModule.VulcanMod.Config.Prestige.Active) {
        initPrestigeEdit()
    }
    if (Config.CoreModule.VulcanMod.Config.KeyEdit.Active) {
        vulcanAPI.log("正在铸造钥匙……")
        initKeyEdit()
    }
    if (Config.CoreModule.VulcanMod.Config.HideoutEdit.EnableRecipeEdit) {
        initRecipeEdit()
    }
    if (Config.CoreModule.VulcanMod.Config.HideoutEdit.RevertHideout) {
        revertHideout()
    }
    if (Config.CoreModule.VulcanMod.Config.HideoutEdit.EnableModRecipe) {
        vulcanAPI.log("正在打印配方……")
        vulcanAPI.initRecipe(modDB.hideout.recipe)
        vulcanAPI.initScavCase(modDB.hideout.scavcase)
    }
    if (Config.CoreModule.VulcanMod.Config.Global.Container.Active) {
        vulcanAPI.log("正在整理箱子……")
        //THICC武器箱
        var containerconfig = Config.CoreModule.VulcanMod.Config.Global.Container
        //clientItem["5b6d9ce188a4501afc1b2b25"]._props.Grids[0]._props.cellsV = containerconfig.Weapon_THICC[0]
        //clientItem["5b6d9ce188a4501afc1b2b25"]._props.Grids[0]._props.cellsH = containerconfig.Weapon_THICC[1]
        //主播物品箱
        clientItem["66bc98a01a47be227a5e956e"]._props.Grids[0]._props.cellsV = containerconfig.Twitch_Continer[0]
        clientItem["66bc98a01a47be227a5e956e"]._props.Grids[0]._props.cellsH = containerconfig.Twitch_Continer[1]
    }
    if (Config.CoreModule.VulcanMod.Config.BotEdit.EnableExtraLoot) {
        vulcanAPI.log("正在投放物资……")
        initLoot()
    }
    if (Config.CoreModule.VulcanMod.Config.Misc.BTRSettings.Active) {
        btrExtend()
    }
    if (Config.CoreModule.VulcanMod.Config.Misc.TransitSettings.Active) {
        transitExtend()
    }
    if (Config.CoreModule.VulcanMod.Config.Misc.CultistCircleSettings.Active) {
        cultistCircleExtend()
    }
    initQuestLocale()
    initCollectorLocale()
    if (Config.CoreModule.VulcanMod.Config.BotEdit.AddKabanInShoreline) {
        clientDB.locations.shoreline.base.BossLocationSpawn.push({
            "BossChance": 30,
            "BossDifficult": "normal",
            "BossEscortAmount": "2",
            "BossEscortDifficult": "normal",
            "BossEscortType": "followerBoar",
            "BossName": "bossBoar",
            "BossPlayer": false,
            "BossZone": "ZoneSmuglers",
            "Delay": 0,
            "ForceSpawn": false,
            "IgnoreMaxBots": true,
            "RandomTimeSpawn": false,
            "SpawnMode": [
                "regular",
                "pve"
            ],
            "Supports": [
                {
                    "BossEscortAmount": "0",
                    "BossEscortDifficult": [
                        "normal"
                    ],
                    "BossEscortType": "followerBoar"
                },
                {
                    "BossEscortAmount": "1",
                    "BossEscortDifficult": [
                        "normal"
                    ],
                    "BossEscortType": "followerBoarClose1"
                },
                {
                    "BossEscortAmount": "1",
                    "BossEscortDifficult": [
                        "normal"
                    ],
                    "BossEscortType": "followerBoarClose2"
                }
            ],
            "Time": -1,
            "TriggerId": "",
            "TriggerName": ""
        })
    }
    //原版物品调整
    //火神头内衬
    clientItem["657bbe73a1c61ee0c303632b"]._props.armorClass = 6
    clientItem["657bbed0aab96fccee08be96"]._props.armorClass = 6
    clientItem["657bbefeb30eca9763051189"]._props.armorClass = 6
    //市场调整
    //762bp
    clientItem["59e0d99486f7744a32234762"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["59e0d99486f7744a32234762"] = 1751
    //762ap
    clientItem["601aa3d2b2bcb34913271e6d"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["601aa3d2b2bcb34913271e6d"] = 3299
    //856a1
    clientDB.templates.prices["59e6906286f7746c9f75e847"] = 495
    //855a1
    clientItem["54527ac44bdc2d36668b4567"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["54527ac44bdc2d36668b4567"] = 799
    //m995
    clientItem["59e690b686f7746c9f75e848"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["59e690b686f7746c9f75e848"] = 2999
    //hybrid
    clientItem["6529243824cbe3c74a05e5c1"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["6529243824cbe3c74a05e5c1"] = 2199
    //.300M62 
    clientDB.templates.prices["619636be6db0f2477964e710"] = 799
    //CBJ
    clientItem["64b8725c4b75259c590fa899"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["64b8725c4b75259c590fa899"] = 1299
    //AP20
    clientItem["5d6e68a8a4b9360b6c0d54e2"]._props.CanSellOnRagfair = true
    //338FMJ
    clientItem["5fc275cf85fd526b824a571a"]._props.CanSellOnRagfair = true
    //PS12B 
    clientItem["5cadf6eeae921500134b2799"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["5cadf6eeae921500134b2799"] = 1599
    //545bp
    clientItem["56dfef82d2720bbd668b4567"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["56dfef82d2720bbd668b4567"] = 899
    //545bs
    clientItem["56dff026d2720bb8668b4567"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["56dff026d2720bb8668b4567"] = 2399
    //m80
    clientItem["58dd3ad986f77403051cba8f"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["58dd3ad986f77403051cba8f"] = 899
    //pab9 
    clientItem["61962d879bb3d20b0946d385"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["61962d879bb3d20b0946d385"] = 899
    //sp6
    clientItem["57a0e5022459774d1673f889"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["57a0e5022459774d1673f889"] = 1799
    //7n12
    clientItem["5c0d688c86f77413ae3407b2"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["5c0d688c86f77413ae3407b2"] = 3299
    //lps
    clientDB.templates.prices["5887431f2459777e1612938f"] = 799
    //7bt1
    clientItem["5e023d34e8a400319a28ed44"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["5e023d34e8a400319a28ed44"] = 2199
    //m61
    clientItem["5a6086ea4f39f99cd479502f"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["5a6086ea4f39f99cd479502f"] = 2199
    //366ap
    clientItem["5f0596629e22f464da6bbdd9"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["5f0596629e22f464da6bbdd9"] = 1299
    //snb
    clientItem["560d61e84bdc2da74d8b4571"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["560d61e84bdc2da74d8b4571"] = 6999
    //m80a1
    clientItem["6768c25aa7b238f14a08d3f6"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["6768c25aa7b238f14a08d3f6"] = 6999
    //7n39
    clientItem["5c0d5e4486f77478390952fe"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["5c0d5e4486f77478390952fe"] = 4499
    //APSX
    clientItem["5ba26835d4351e0035628ff5"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["5ba26835d4351e0035628ff5"] = 3999
    //武器调整
    //黑dt
    clientItem["5dcbd56fdbd3d91b3e5468d5"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["65290f395ae2ae97b80fdf2d"] = 186666
    //spear
    clientItem["65290f395ae2ae97b80fdf2d"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["65290f395ae2ae97b80fdf2d"] = 319000
    //vss
    clientItem["57838ad32459774a17445cd2"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["57838ad32459774a17445cd2"] = 139999
    //M10
    clientItem["673cab3e03c6a20581028bc1"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["673cab3e03c6a20581028bc1"] = 299999
    //配件
    //宙斯热成像 
    clientItem["63fc44e2429a8a166c7f61e6"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["63fc44e2429a8a166c7f61e6"] = 699999
    //Trijicon 
    clientItem["5a1eaa87fcdbcb001865f75e"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["5a1eaa87fcdbcb001865f75e"] = 799999
    //四眼夜视仪 
    clientItem["5c0558060db834001b735271"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["5c0558060db834001b735271"] = 199999
    //6.8弹鼓 
    clientItem["6761770e48fa5c377e06fc3c"]._props.CanSellOnRagfair = true
    //556弹鼓 
    clientItem["59c1383d86f774290a37e0ca"]._props.CanSellOnRagfair = true
    //55660发弹匣
    clientItem["544a37c44bdc2d25388b4567"]._props.CanSellOnRagfair = true
    //RS32热成像 
    clientItem["5d1b5e94d7ad1a2b865a96b0"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["5d1b5e94d7ad1a2b865a96b0"] = 799999
    //插板
    //原色Killa面
    clientItem["5c0919b50db834001b7ce3b9"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["5c0919b50db834001b7ce3b9"] = 89999
    //火神面
    clientItem["5ca2113f86f7740b2547e1d2"]._props.CanSellOnRagfair = true
    //黑阿尔金面罩 
    clientItem["5f60c85b58eff926626a60f7"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["5f60c85b58eff926626a60f7"] = 129999
    //5级Killa背板
    clientItem["654a4a964b446df1ad03f192"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["654a4a964b446df1ad03f192"] = 119999
    //BR4 55耐5级陶瓷美板
    clientItem["65573fa5655447403702a816"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["65573fa5655447403702a816"] = 99999
    //Cult 5级钛美板
    clientItem["656fa8d700d62bcd2e024084"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["656fa8d700d62bcd2e024084"] = 119999
    //5级复合美板
    clientItem["656fa53d94b480b8a500c0e4"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["656fa53d94b480b8a500c0e4"] = 139999
    //45耐5级PE美板
    clientItem["656fae5f7c2d57afe200c0d7"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["656fae5f7c2d57afe200c0d7"] = 169999
    //5级俄甲背板
    clientItem["657b2797c3dbcb01d60c35ea"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["657b2797c3dbcb01d60c35ea"] = 69999
    //5级俄甲前板
    clientItem["656f664200d62bcd2e024077"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["656f664200d62bcd2e024077"] = 69999
    //5级俄甲菱形板
    clientItem["656f611f94b480b8a500c0db"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["656f611f94b480b8a500c0db"] = 79999
    //5级跳弹板
    clientItem["5c0e66e2d174af02a96252f4"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["5c0e66e2d174af02a96252f4"] = 149999
    //Galvion3级头
    clientItem["5f60b34a41e30a4ab12a6947"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["5f60b34a41e30a4ab12a6947"] = 69999
    //新钻石头 
    clientItem["65709d2d21b9f815e208ff95"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["65709d2d21b9f815e208ff95"] = 99999
    //黄fastmt
    clientItem["5ac8d6885acfc400180ae7b0"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["5ac8d6885acfc400180ae7b0"] = 129999
    //fastmt
    clientItem["5a154d5cfcdbcb001a3b00da"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["5a154d5cfcdbcb001a3b00da"] = 149999
    //面罩温迪
    clientItem["5e01ef6886f77445f643baa4"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["5e01ef6886f77445f643baa4"] = 233333
    //温迪
    clientItem["5e00c1ad86f774747333222c"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["5e00c1ad86f774747333222c"] = 139999
    //黄温迪面
    clientItem["5e01f37686f774773c6f6c15"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["5e01f37686f774773c6f6c15"] = 59999
    //黑温迪面
    clientItem["5e00cdd986f7747473332240"]._props.CanSellOnRagfair = true
    clientDB.templates.prices["5e00cdd986f7747473332240"] = 69999







    //黑阿尔金
    const newRecipes = []
    const recipes = clientDB.hideout.production.recipes[109].requirements
    for (var r = 0; r < recipes.length; r++) {
        if (recipes[r].type != "QuestComplete") {
            newRecipes.push(vulcanAPI.deepCopy(recipes[r]))
        }
    }
    clientDB.hideout.production.recipes[109].requirements = []
    clientDB.hideout.production.recipes[109].requirements = newRecipes
    const altynquest = clientDB.templates.quests["60e71b62a0beca400d69efc4"].rewards.Success
    const newaltynquest = []
    for (var r = 0; r < altynquest.length; r++) {
        if (altynquest[r].type != "ProductionScheme") {
            newaltynquest.push(vulcanAPI.deepCopy(altynquest[r]))
        }
    }
    clientDB.templates.quests["60e71b62a0beca400d69efc4"].rewards.Success = []
    clientDB.templates.quests["60e71b62a0beca400d69efc4"].rewards.Success = newaltynquest

    //Theta安全箱
    const newTheta = []
    const containerTheta = clientItem["664a55d84a90fc2c8a6305c9"]._props.Grids
    newTheta.push(vulcanAPI.deepCopy(containerTheta[0]))
    newTheta.push(vulcanAPI.deepCopy(containerTheta[1]))
    newTheta[0]._props.cellsH = 4
    clientItem["664a55d84a90fc2c8a6305c9"]._props.Grids = newTheta





    //容器调整 
    //clientItem[vulcanAPI.convertHashID("测试盒装子弹")]._props.StackSlots[0]._max_count = 1000
    clientItem[vulcanAPI.convertHashID("盒装闪光子弹")]._props.StackSlots[0]._max_count = 10
    clientItem[vulcanAPI.convertHashID("小腰包")]._props.Grids[0]._props.cellsH = 2
    clientItem[vulcanAPI.convertHashID("小腰包")]._props.Grids[0]._props.cellsV = 2
    clientItem[vulcanAPI.convertHashID("复刻版电台包")]._props.Grids[0]._props.cellsH = 6
    clientItem[vulcanAPI.convertHashID("复刻版电台包")]._props.Grids[0]._props.cellsV = 7
    clientItem[vulcanAPI.convertHashID("迷你垃圾箱")]._props.Grids[0]._props.cellsH = 4
    clientItem[vulcanAPI.convertHashID("迷你垃圾箱")]._props.Grids[0]._props.cellsV = 4
    clientItem[vulcanAPI.convertHashID("Sigma安全箱")]._props.Grids[0]._props.cellsH = 4
    clientItem[vulcanAPI.convertHashID("Sigma安全箱")]._props.Grids[0]._props.cellsV = 4
    clientItem[vulcanAPI.convertHashID("Omega安全箱")]._props.Grids[0]._props.cellsH = 4
    clientItem[vulcanAPI.convertHashID("Omega安全箱")]._props.Grids[0]._props.cellsV = 5
    clientItem[vulcanAPI.convertHashID("金苹果钥匙扣")]._props.Grids[0]._props.cellsH = 3
    clientItem[vulcanAPI.convertHashID("金苹果钥匙扣")]._props.Grids[0]._props.cellsV = 3
    clientItem[vulcanAPI.convertHashID("附魔金苹果钥匙扣")]._props.Grids[0]._props.cellsH = 5
    clientItem[vulcanAPI.convertHashID("附魔金苹果钥匙扣")]._props.Grids[0]._props.cellsV = 5
    clientItem[vulcanAPI.convertHashID("THICC文件箱")]._props.Grids[0]._props.cellsH = 14
    clientItem[vulcanAPI.convertHashID("THICC文件箱")]._props.Grids[0]._props.cellsV = 14
    clientItem[vulcanAPI.convertHashID("THICC医疗箱")]._props.Grids[0]._props.cellsH = 14
    clientItem[vulcanAPI.convertHashID("THICC医疗箱")]._props.Grids[0]._props.cellsV = 14
    clientItem[vulcanAPI.convertHashID("THICC食品箱")]._props.Grids[0]._props.cellsH = 14
    clientItem[vulcanAPI.convertHashID("THICC食品箱")]._props.Grids[0]._props.cellsV = 14
    clientItem[vulcanAPI.convertHashID("THICC军械箱")]._props.Grids[0]._props.cellsH = 14
    clientItem[vulcanAPI.convertHashID("THICC军械箱")]._props.Grids[0]._props.cellsV = 14
    clientItem[vulcanAPI.convertHashID("THICC装备箱")]._props.Grids[0]._props.cellsH = 14
    clientItem[vulcanAPI.convertHashID("THICC装备箱")]._props.Grids[0]._props.cellsV = 14
    /*
    clientItem[vulcanAPI.convertHashID("THICC装备箱")]._props.Grids[0]._props.filters[0].Filter = [
        "543be5f84bdc2dd4348b456a",
        "5645bcb74bdc2ded0b8b4578",
        "5448e53e4bdc2d60728b4567",
        "5448e5284bdc2dcb718b4567",
        "5991b51486f77447b112d44f",
        "5ac78a9b86f7741cca0bbd8d",
        "5b4391a586f7745321235ab2",
        "544fb5454bdc2df8738b456a"
    ]
        */
    //var 尼基塔的马 = vulcanAPI.convertHashID("尼基塔的马")
    configServer.getConfig(ConfigTypes.INVENTORY).randomLootContainers["674098588466ebb03408b210"].rewardTplPool = { "a61ca5b36dd3e79f14996c2b": 1 }
    configServer.getConfig(ConfigTypes.INVENTORY).randomLootContainers["674098588466ebb03408b210"].rewardTypePool = null
    configServer.getConfig(ConfigTypes.INVENTORY).randomLootContainers["674098588466ebb03408b210"].rewardCount = 1

    //导出邮件新格式的代码, 暂时先用旧的吧, 看着顺眼
    /*
    var exportMail = {
        common: {},
        i18n:{}
    }
    for(let message in modDB.locales.mail.ch){
        exportMail.i18n[message] = {
            ch: modDB.locales.mail.ch[message]
        }
    }
    vulcanAPI.writeFile(`${modDBPath}exportmail.json`, JSON.stringify(exportMail, null, 4))
    */
    vulcanAPI.log("正在组装武器……")
    vulcanAPI.initPreset(modDB.preset)
    //vulcanAPI.getTag(vulcanAPI.getItem(id))
    fixContainer()
    forceUnlockEventQuest()
    //vulcanAPI.writeFile(`${modDBPath}exportquestcfg.json`, JSON.stringify(configServer.getConfig(ConfigTypes.QUEST).eventQuests, null, 4))
    /*
    for (let a in modDB.traderdata.quest.achievement_test) {
        const achievement = modDB.traderdata.quest.achievement_test[a]
        clientDB.templates.achievements.push(achievement)
        clientDB.locales.global.ch[`${achievement.id} name`] = achievement.name
        clientDB.locales.global.ch[`${achievement.id} description`] = achievement.description
        vulcanAPI.debug('成就测试')
    }
        */
    //永寂孤芒任务条件数据生成
    const medtag = [
        "5b47574386f77428ca22b337", //药丸
        "5b47574386f77428ca22b338", //急救包
        "5b47574386f77428ca22b339", //创伤治疗
        "5b47574386f77428ca22b33a", //注射器
        "5b47574386f77428ca22b2f3", //医疗物资
    ]
    const food = []
    const med = []
    for (let i in clientItem) {
        const items = clientItem[i]
        if (isFood(items._id)) {
            food.push(items._id)
        }
        if (medtag.includes(vulcanAPI.getTag(vulcanAPI.getItem(items._id)))) {
            med.push(items._id)
        }
    }
    /*
    const newinit = vulcanAPI.deepCopy(modDB.traderdata.quest.init)
    const cond = modDB.traderdata.quest.conditions
    const reward = modDB.traderdata.quest.rewards
    //任务数据转换重组
    /*
    for (let i in newinit) {
        const questid = newinit[i].ID
        const questcond = cond[questid]
        const inits = newinit[i]
        if (inits.PreData == null || inits.PreData == undefined) {
            inits["PreData"] = {
                "finishquest": [],
                "failquest": [],
                "startquest": [],
                "customquest": {
                    "quest": [],
                    "state": []
                },
                "playerlevel": 0,
                "traderstanding": {},
                "traderlevel": {}
            }
        }
        inits["QuestData"] = {}
        //newinit.QuestData.start = questcond[questid].Start.Data
        for (var d = 0; d < questcond.Start.Data.length; d++) {
            const cd = questcond.Start.Data[d]
            if (cd.type == "Quest") {
                inits.PreData.finishquest.push(cd.questid)
            }
            if(cd.type == "Level"){
                inits.PreData.playerlevel = cd.count
            }
        }
        inits.QuestData.finish = questcond.Finish.Data
        inits.QuestData.fail = questcond.Fail.Data
        inits["QuestReward"] = reward.filter(x => x.Quest == questid)
    }
    vulcanAPI.writeFile(`${modDBPath}newinit.json`, JSON.stringify(newinit, null, 4))
    */
    //商人文件导出拆分
    /*
     let exportassort = {
         modtrader: [],
         vanillatrader: []
     }
     for (var a = 0; a < modDB.traderdata.assort.length; a++) {
         if (modDB.traderdata.assort[a].Trader == "Persicaria") {
             exportassort.modtrader.push(modDB.traderdata.assort[a])
         } else {
             exportassort.vanillatrader.push(modDB.traderdata.assort[a])
         }
     }
     vulcanAPI.writeFile(`${modDBPath}exportassort.json`, JSON.stringify(exportassort, null, 4))
     */
    //console.log(food)
    //console.log(med)
    vulcanAPI.fetchAsync()
        .then(data => {
            //console.log('Fetched data:', data);
        })
        .catch(error => {
            //console.error('Error:', error);
            //永寂孤芒任务条件生成
            const nukestarquest = clientDB.templates.quests[vulcanAPI.convertHashID("永寂孤芒")].conditions.AvailableForFinish
            nukestarquest[1].target = food
            nukestarquest[2].target = med

            vulcanAPI.writeFile(`${modDBPath}exportlocale.json`, JSON.stringify(clientDB.locales.global.ch, null, 4))
            vulcanAPI.writeFile(`${modDBPath}exportcustom.json`, JSON.stringify(clientDB.templates.customization, null, 4))
            //console.log(JSON.stringify(nukestarquest[1], null, 4))
            //console.log(JSON.stringify(nukestarquest[2], null, 4))

            vulcanAPI.writeFile(`${modDBPath}exportlooseloot.json`, JSON.stringify(clientDB.locations.bigmap.looseLoot, null, 4))
            vulcanAPI.writeFile(`${modDBPath}exportstaticloot.json`, JSON.stringify(clientDB.locations.bigmap.staticLoot, null, 4))
            vulcanAPI.writeFile(`${modDBPath}exportquest.json`, JSON.stringify(clientDB.templates.quests, null, 4))
            vulcanAPI.writeFile(`${modDBPath}exportitem.json`, JSON.stringify(clientDB.templates.items, null, 4))
            vulcanAPI.writeFile(`${modDBPath}exportrecipe.json`, JSON.stringify(clientDB.hideout.production, null, 4))
            vulcanAPI.writeFile(`${modDBPath}exportachievements.json`, JSON.stringify(clientDB.templates.achievements, null, 4))
            //vulcanAPI.writeFile(`${modDBPath}exportfulldata.json`, JSON.stringify(clientDB, null, 4))
        });
    vulcanAPI.log("已完成全部加载流程，普罗米修斯在线，欢迎访问火神集团")
    //待完成事项
    //AI修改(调整装备, 去除AK12的改动, 加入新的武器 完工
    //藏身处修改(接口完善 完工
    //原版钥匙修改实装 完工
    //战利品及黑名单 完工了一半, 战利品写完了, 邪教圈黑名单还没写, 不是很想写.... //最后还是写了
    //性能模式(使用原物品bundle 完工
    //还有么?
    //哦, Beta臂带 完工
    //这个要不丢仓库吧
    //容器修复 完工
    //貌似没了.
    //Sam头
    //我Sam模型让我塞哪了....明天翻翻
    //竞技场内容清理(笑死, 没活过一个版本)
    //竞技场商人任务扩充? maybe
    //好TMD多啊....
    //= =
    //事已至此, 先睡觉吧
    //当前时间01:36 1.22.2025
    //晚安, 世界
    //今天完成了三个待办事项, 还有一二三四最起码四个....//猛地想起来Bot数据忘了拆了, 明天做//Reshala概率也得拆出来= =//再测最后一次, 我不信这狗东西今天不背包
    //这么一看火神重工内容还挺多嘿
    //不愧是我=w=
    //得嘞得嘞, 该睡了
    //当前时间01:31 1.23.2025
    //晚安, 世界
    //黑SPEAR准备合并入火神重工本体
    //沙鹰印花集和梦想天生以及物品包准备作为物品模块导入
    //Bot拆分完成, 等会回来把刷新率写了干别的
    //捏妈, 想着修下车吃个饭, 修车铺没开烤肉饭也没开, 我服了= =
    //摸了, 研究一下Teacon
    //坏了, 今天略微有点犯困....
    //待办事项就完了一个= =
    //摸了一天....
    //顶着困劲儿写完了两个处理移植= =
    //还差Beta臂章和新物品的处理, 黑SPEAR合并, Sam头
    //事已至此, 该睡觉了
    //当前时间01:21 1.24.2025
    //晚安, 世界
    //写了多语言支持和邪教圈黑名单支持, 准备捋一遍物品文件, 顺便把黑SPEAR融了把竞技场删了
    //OK, 所有的旧内容处理完成
    //还差黑SPEAR和Sam头
    //修瞄具
    //Sam头
    //OK, 没了
    //当前时间18:38 1.24.2025
    //吃饭去咯~
    //OK, 全部完工!
    //当前时间00:03 1.25.2025
    //终于把火神重工彻底移植完了
    //可以打游戏咯
    //剩下的东西交给明天或者后天的我吧)
    //晚安, 世界
    //....
    //当前时间00:06 04.27.2025
    //还差箱装弹药, 就全部完成了
    //写一半实在写烦了, 准备直接代码批量生成
    //开写

    //箱装弹药数据生成
    /*
    const ammoChestPattern = modDB.traderdata.ammoChest.itempattern
    const ammoChestAssortPattern = modDB.traderdata.ammoChest.assortpattern
    const ammoChestInput = modDB.traderdata.ammoChest.input
    var ammoChestOutput = {
        item: {},
        assort: []
    }
    for (var i = 0; i < ammoChestInput.length; i++) {
        const input = ammoChestInput[i]
        const pattern = vulcanAPI.deepCopy(ammoChestPattern)
        const hashkey = `${input.id}_${input.name}_${i}`
        const boxdata = pattern._props.StaticBoxData.giftdata[0].item
        const stack = vulcanAPI.getItem(vulcanAPI.convertHashID(input.itemid))._props.StackMaxSize
        ammoChestOutput.item[input.id] = {}
        pattern._id = input.id
        pattern._name = input.id
        pattern._props.Name = `一箱弹药（${input.name}）`
        pattern._props.Description = `一个沉甸甸的箱子，打开后可以获得一整箱崭新出厂的${input.name}弹药（共计${stack * 49}发），带着难闻油脂味的那种。`
        boxdata[0]._id = vulcanAPI.generateHash(`${boxdata[0]._id}_${hashkey}`)
        for (var j = 1; j < boxdata.length; j++) {
            const data = boxdata[j]
            data._id = vulcanAPI.generateHash(`${data._id}_${hashkey}_${j}`)
            data.parentId = vulcanAPI.generateHash(`${data.parentId}_${hashkey}`)
            data._tpl = input.itemid
            data.upd.StackObjectsCount = stack
        }
        ammoChestOutput.item[input.id] = pattern
        const assortpattern = vulcanAPI.deepCopy(ammoChestAssortPattern)
        assortpattern.ID = `商人4级_${input.id}_兑换`
        assortpattern.Item[0]._id = `商人4级_${input.id}_兑换`
        assortpattern.Item[0]._tpl = input.id
        assortpattern.Barter["英雄之证"] = input.price
        ammoChestOutput.assort.push(assortpattern)
    }
    */
    //箱装弹药数据生成结束
    //vulcanAPI.writeFile(`${modDBPath}exportammochestdata.json`, JSON.stringify(ammoChestOutput, null, 4))
    //vulcanAPI.access("箱装弹药数据生成完毕")
    //技能箱数据生成
    /*
    const data = modDB.skillmap
    const skilldata = data.map
    const skilllevel = data.level
    const pattern = {
        "_id": "测试技能箱",
        "targetid": "63a8970d7108f713591149f5",
        "_name": "测试技能箱",
        "_props": {
            "Name": "测试技能箱",
            "ShortName": "测试技能箱",
            "Description": "测试技能箱",
            "Weight": 0,
            "BackgroundColor": "green",
            "Width": 2,
            "Height": 2,
            "DefaultPrice": 20000,
            "RagfairType": "VulcanSpecialItem",
            "CanFindInRaid": false,
            "CustomLoot": false,
            "CustomLootTarget": "59faff1d86f7746c51718c9c",
            "isMoney": false,
            "StackMaxSize": 10000000,
            "CanSellOnRagfair": false,
            "CanRequireOnRagfair": false,
            "Prefab": {
                "path": "chest_mc_copper.pack",
                "rcid": ""
            },
            "BlackListType": [
                "AirDrop",
                "PMCLoot",
                "ScavCaseLoot",
                "Fence",
                "Circle"
            ],
            "isSpecialBox": true,
            "SpecialBoxData": {
                "giftdata": [
                    {
                        "name": "技能",
                        "skill": "Strength",
                        "count": 100,
                        "type": "SKill",
                        "itemid": "英雄之证碎片",
                        "stackcount": 1,
                        "forcefir": true
                    }
                ]
            }
        }
    }
    const assortpattern = {
        "ID": "商人4级_一箱545BP_兑换",
        "Trader": "Persicaria",
        "Item": [
            {
                "_id": "商人4级_一箱545BP_兑换",
                "_tpl": "一箱545BP",
                "parentId": "hideout",
                "slotId": "hideout",
                "upd": {
                    "StackObjectsCount": 999999,
                    "UnlimitedCount": true
                }
            }
        ],
        "DogTag": {},
        "Barter": {
            "英雄之证": 1
        },
        "TrustLevel": 4,
        "isWeapon": false,
        "Locked": false,
        "Quest": ""
    }
    const skilloutput = {}
    const assortoutput = []
    for (var s = 0; s < skilldata.length; s++) {
        const skill = skilldata[s]
        const skillid = skill["技能ID"]
        const skillname = skill["中文名"]
        for (var l = 0; l < skilllevel.name.length; l++) {
            const level = skilllevel.count[l]
            const levelname = skilllevel.name[l]
            const cachepattern = vulcanAPI.deepCopy(pattern)
            const cacheassort = vulcanAPI.deepCopy(assortpattern)
            const itemname = `${levelname}${skillname}技能经验箱`
            cachepattern._id = itemname
            cachepattern._name = itemname
            cachepattern._props.Name = itemname
            cachepattern._props.ShortName = skillname
            cachepattern._props.Description = `一个精美的箱子，打开后可以将你的${skillname}技能提升${level}级。`
            switch (level) {
                case 1: {
                    cachepattern._props.Prefab.path = "chest_mc_iron.pack"
                    cachepattern._props.BackgroundColor = "blue"
                    const assortname = `BOSS狗牌_${itemname}`
                    cacheassort.ID = assortname
                    cacheassort.Item[0]._id = assortname
                    cacheassort.Item[0]._tpl = itemname
                    cacheassort.Barter = {}
                    cacheassort.DogTag["Boss狗牌"] = {
                        "count": 1,
                        "level": 100,
                        "side": "Bear"
                    }
                    cacheassort.TrustLevel = 2
                    assortoutput.push(cacheassort)
                }
                    break;
                case 5: {
                    cachepattern._props.Prefab.path = "chest_mc_gold.pack"
                    cachepattern._props.BackgroundColor = "violet"
                    const assortname = `英雄之证_${itemname}`
                    cacheassort.ID = assortname
                    cacheassort.Item[0]._id = assortname
                    cacheassort.Item[0]._tpl = itemname
                    cacheassort.Barter["英雄之证"] = 1
                    cacheassort.TrustLevel = 3
                    assortoutput.push(cacheassort)
                }
                    break;
                case 10: {
                    cachepattern._props.Prefab.path = "chest_mc_diamond.pack"
                    cachepattern._props.BackgroundColor = "yellow"
                    const assortname = `THICC_${itemname}`
                    cacheassort.ID = assortname
                    cacheassort.Item[0]._id = assortname
                    cacheassort.Item[0]._tpl = itemname
                    cacheassort.Barter = {}
                    cacheassort.Barter["5c0a840b86f7742ffa4f2482"] = 1
                    cacheassort.TrustLevel = 4
                    assortoutput.push(cacheassort)
                }
                    break;
                case 51: {
                    cachepattern._props.Prefab.path = "chest_mc_crystal.pack"
                    cachepattern._props.BackgroundColor = "red"
                    const assortname = `永恒之证_${itemname}`
                    cacheassort.ID = assortname
                    cacheassort.Item[0]._id = assortname
                    cacheassort.Item[0]._tpl = itemname
                    cacheassort.Barter = {}
                    cacheassort.Barter["永恒之证"] = 1
                    cacheassort.TrustLevel = 4
                    assortoutput.push(cacheassort)
                }
                    break;
            }
            cachepattern._props.SpecialBoxData.giftdata[0].skill = skillid
            cachepattern._props.SpecialBoxData.giftdata[0].count = Math.floor(level * 100)
            skilloutput[itemname] = cachepattern
        }
    }
    vulcanAPI.writeFile(`${modDBPath}exportskillchestdata.json`, JSON.stringify(skilloutput, null, 4))
    vulcanAPI.writeFile(`${modDBPath}exportskillchestassort.json`, JSON.stringify(assortoutput, null, 4))
    //技能箱数据生成结束
    */


    function initQuestImage() {
        for (const icon of iconList) {
            const filename = vulcanAPI.stripExtension(icon);
            imageRouter.addRoute(`/files/quest/icon/${filename}`, `${imageFilePath}questimage/${icon}`);
        }
    }
    function initCustomIcon() {
        for (const icon of customicon) {
            const filename = vulcanAPI.stripExtension(icon);
            imageRouter.addRoute(`/files/icon/${filename}`, `${imageFilePath}icon/${icon}`);
        }
    }
    function initQuestLocale() {
        //邮箱本地化文本处理
        for (let lang in modDB.locales.mail) {
            for (let mails in modDB.locales.mail[lang]) {
                clientDB.locales.global[lang][mails] = modDB.locales.mail[lang][mails]
            }
        }
        //任务本地化文本支持
        //CustomvulcanAPI.log("正在加载任务数据...")
        for (let lang in modDB.locales.quest) {
            vulcanAPI.loadQuestLocale(modDB.locales.quest[lang], lang)
        }
        for (let quest in modDB.locales.quest.ch) {
            vulcanAPI.debug("任务数据加载成功: " + modDB.locales.quest.ch[quest].name)
        }
    }
    function initAchievementFix(achievement) {
        const clientAchievement = clientDB.templates.achievements
        for (var i = 0; i < achievement.length; i++) {
            clientAchievement.find(a => a.id == achievement[i].id).conditions.availableForFinish = achievement[i].conditions
        }
    }
    function floatToPercent(num) {
        // 检查输入是否为有效数字
        if (isNaN(num)) {
            return "NaN";
        }

        // 将浮点数乘以100转换为百分比，然后保留两位小数
        const percent = (num * 100).toFixed(2);

        // 添加百分号返回
        return percent + "%";
    }
    function showChance() {
        for (let item123 in modDB.items) {
            vulcanAPI.fetchAsync().then(data => { }).catch(err => {
                if (modDB.items[item123]._props.isadvGiftBox) {
                    const BoxData = modDB.items[item123]._props.advBoxData
                    const giftdata = vulcanAPI.getGiftData(BoxData.giftdata)
                    const basedata = giftdata.basereward
                    const itempool = giftdata.itempool
                    const sr = basedata.superrare
                    const srpool = itempool.superrare
                    const r = basedata.rare
                    const rpool = itempool.rare
                    const normal = basedata.normal
                    const normalpool = itempool.normal
                    const poolname = giftdata.name
                    const gold = '<color=#FFFF55>★★★★★</color>内容'
                    const epic = '<color=#FF55FF>★★★★</color>内容'
                    const normalstr = '<color=#FFFFFF>★★★</color>内容'
                    const srchance = floatToPercent(sr.chance)
                    const srupchance = floatToPercent(sr.upchance)
                    const srnormalchance = floatToPercent(1 - sr.upchance)
                    const sraddchance = floatToPercent(sr.upaddchance)
                    const srbasecount = (sr.chancegrowcount + 1 + ((1 - sr.chance) / sr.chancegrowpercount))
                    const srrealchance = floatToPercent((1 / srbasecount))
                    const srgrowcount = sr.chancegrowcount
                    const srgrowchance = floatToPercent(sr.chancegrowpercount)
                    const rchance = floatToPercent(r.chance)
                    const rbasecount = (1 / r.chance)
                    const rupchance = floatToPercent(r.upchance)
                    const rnormalchance = floatToPercent(1 - r.upchance)
                    const raddchance = floatToPercent(r.upaddchance)
                    var srupstring = ""
                    var srnormalstring = ""
                    var rupstring = ""
                    var rnormalstring = ""
                    var normalstring = ""
                    for (var i = 0; i < srpool.chanceup.length; i++) {
                        const data = srpool.chanceup[i]
                        if (i > 0) srupstring += "、";  // 只在非第一个元素前添加顿号
                        switch (data.type) {
                            case "Item": {
                                srupstring += `${clientLocale[`${vulcanAPI.convertHashID(srpool.chanceup[i].itemid)} Name`]}x${srpool.chanceup[i].stackcount}`;
                            }
                                break;
                            case "VanillaPreset": {
                                srupstring += `${clientLocale[`${srpool.chanceup[i].item} Name`]}x1`;
                            }
                                break;
                        }
                    }
                    for (var i = 0; i < srpool.normal.length; i++) {
                        const data = srpool.normal[i]
                        if (i > 0) srnormalstring += "、";  // 只在非第一个元素前添加顿号
                        switch (data.type) {
                            case "Item": {
                                srnormalstring += `${clientLocale[`${vulcanAPI.convertHashID(srpool.normal[i].itemid)} Name`]}x${srpool.normal[i].stackcount}`;
                            }
                                break;
                            case "VanillaPreset": {
                                srnormalstring += `${clientLocale[`${srpool.normal[i].item} Name`]}x1`;
                            }
                                break;
                        }
                    }
                    for (var i = 0; i < rpool.chanceup.length; i++) {
                        const data = rpool.chanceup[i]
                        if (i > 0) rupstring += "、";  // 只在非第一个元素前添加顿号
                        switch (data.type) {
                            case "Item": {
                                rupstring += `${clientLocale[`${vulcanAPI.convertHashID(rpool.chanceup[i].itemid)} Name`]}x${rpool.chanceup[i].stackcount}`;
                            }
                                break;
                            case "VanillaPreset": {
                                rupstring += `${clientLocale[`${rpool.chanceup[i].item} Name`]}x1`;
                            }
                                break;
                        }
                    }
                    for (var i = 0; i < rpool.normal.length; i++) {
                        const data = rpool.normal[i]
                        if (i > 0) rnormalstring += "、";  // 只在非第一个元素前添加顿号
                        switch (data.type) {
                            case "Item": {
                                rnormalstring += `${clientLocale[`${vulcanAPI.convertHashID(rpool.normal[i].itemid)} Name`]}x${rpool.normal[i].stackcount}`;
                            }
                                break;
                            case "VanillaPreset": {
                                rnormalstring += `${clientLocale[`${rpool.normal[i].item} Name`]}x1`;
                            }
                                break;
                        }
                    }
                    for (var i = 0; i < normalpool.normal.length; i++) {
                        const data = normalpool.normal[i]
                        if (i > 0) normalstring += "、";  // 只在非第一个元素前添加顿号
                        switch (data.type) {
                            case "Item": {
                                normalstring += `${clientLocale[`${vulcanAPI.convertHashID(normalpool.normal[i].itemid)} Name`]}x${normalpool.normal[i].stackcount}`;
                            }
                                break;
                            case "VanillaPreset": {
                                normalstring += `${clientLocale[`${normalpool.normal[i].item} Name`]}x1`;
                            }
                                break;
                        }
                    }
                    //vulcanAPI.debug(srupstring)
                    //vulcanAPI.debug(srnormalstring)
                    //const rrealchance = floatToPercent(Math.floor((1 / (r.chancegrowcount + 1 + ((1 - r.chance) / r.chancegrowpercount))) * 1000) / 1000)
                    const string = `\n抽奖概率公示: 
                                        \n${gold}: 
                                        \n抽奖概率: 
                                        \n本奖池中，每次抽奖获得${gold}的基础概率为${srchance}, 含保底综合概率为${srrealchance}, 最多${srbasecount}次抽奖必定能通过保底获得${gold}
                                        \n概率提升: 
                                        \n获得${gold}时, 有${srupchance}概率为当前up内容, 另有${srnormalchance}概率为本奖池可获得的全部${gold}, 若本次抽奖获得的${gold}非当前up内容. 则下次抽奖获得当前up内容的概率提升${sraddchance}
                                        \n若连续${srgrowcount}次抽奖仍未获得${gold}, 则从下次开始, 每次抽奖获得${gold}的概率提升${srgrowchance}
                                        \n${epic}: 
                                        \n抽奖概率: 
                                        \n本奖池中，获得${epic}的基础概率为${rchance}, 含保底综合概率为${rchance}, 最多${rbasecount}次抽奖必定能通过保底获得${epic}
                                        \n概率提升: 
                                        \n获得${epic}时, 有${rupchance}概率为当前up内容, 另有${rnormalchance}概率为本奖池可获得的全部${epic}, 若本次抽奖获得的${epic}非当前up内容. 则下次抽奖获得当前up内容的概率提升${raddchance}
                                        \n奖池公示: 
                                        \n${gold}: 
                                        \n当前up内容: ${srupstring}
                                        \n可获得内容: ${srnormalstring}
                                        \n${epic}: 
                                        \n当前up内容: ${rupstring}
                                        \n可获得内容: ${rnormalstring}
                                        \n${normalstr}: 
                                        \n可获得内容: ${normalstring}`





                    clientLocale[`${vulcanAPI.convertHashID(item123)} Description`] += string
                    //this.Log("异步修复加载中")
                }
            })

        }
    }
    function initCollectorLocale() {
        const quest = modDB.traderdata.quest.init
        const questname = [
            "收集者_支持者",
            "收集者_开拓者",
            "收集者_百炼",
            "收集者_星辰之路",
            "收集者_降临"
        ]
        for (var i = 0; i < questname.length; i++) {
            const target = quest[questname[i]]
            if (target) {
                const finish = target.QuestData.finish
                for (var j = 0; j < finish.length; j++) {
                    const condition = finish[j]
                    const itemname = vulcanAPI.getItemName(vulcanAPI.getItem(vulcanAPI.convertHashID(condition.itemid)), "ch")
                    clientLocale[vulcanAPI.convertHashID(condition.id)] = `上交在战局中找到的${itemname}`
                }
            }
        }
    }


    function initSuits() {
        loadCustomizations()
        transferSuitsToRagman()
    }
    function loadCustomizations() {
        const Local = clientDB.locales.global["ch"]
        for (let ct in modDB.custom) {
            const customization = modDB.custom[ct]
            const ID = vulcanAPI.convertHashID(ct)
            // 更新 customization 数据
            clientDB.templates.customization[ID] = {
                ...customization,
                _id: ID,
                _props: {
                    ...customization._props,
                    Body: customization._props.Body ? vulcanAPI.convertHashID(customization._props.Body) : undefined,
                    Hands: customization._props.Hands ? vulcanAPI.convertHashID(customization._props.Hands) : undefined,
                    Feet: customization._props.Feet ? vulcanAPI.convertHashID(customization._props.Feet) : undefined
                }
            }
            // 更新本地化信息
            Local[`${ID} Name`] = customization._props.Name
            Local[`${ID} ShortName`] = customization._props.ShortName
            Local[`${ID} Description`] = customization._props.Description
            //Debug
            vulcanAPI.debug(`服装数据加载成功: ${Local[`${ID} Name`]}`)
        }
    }
    function transferSuitsToRagman() {
        const traderSuits = clientDB.traders[Traders.RAGMAN].suits

        for (const suit of modDB.suits) {
            const newSuit = {
                ...vulcanAPI.deepCopy(suit),
                _id: vulcanAPI.convertHashID(suit._id),
                suiteId: vulcanAPI.convertHashID(suit.suiteId),
                tid: vulcanAPI.convertHashID(suit.tid),
                requirements: {
                    ...suit.requirements,
                    requiredTid: vulcanAPI.convertHashID(suit.requirements.requiredTid),
                    questRequirements: suit.requirements.questRequirements.length > 0
                        ? [vulcanAPI.convertHashID(suit.requirements.questRequirements[0])]
                        : [],
                    achievementRequirements: suit.requirements.achievementRequirements || []
                }
            }
            traderSuits.push(newSuit);
        }
    }
    function applyAIDogTag() {
        const AIList = Config.CoreModule.VulcanMod.Config.DogTagGenerate.Config.AIApplyList
        const botConfig = configServer.getConfig(ConfigTypes.BOT);
        for (var i = 0; i < AIList.length; i++) {
            botConfig.botRolesWithDogTags.push(AIList[i])
        }
    }
    function initKeyEdit() {
        const {
            MachineKeyList: KeyList,
            MachineKeyCount: KeyCount,
            ElectrCardList: CardList,
            ElectrCardCount: CardCount,
            ColorfulCardPrice: CardPrice,
            UseOrangeCardResource,
            ColorfulCardPriceOverride
        } = Config.CoreModule.VulcanMod.Config.KeyEdit
        const FactoryCard = "66acd6702b17692df20144c0"
        const InfinityFactoryCard = vulcanAPI.convertHashID("永恒储藏室卡")
        //更新函数
        const updateUsage = (item, id, lists, counts) => {
            for (const [type, list] of Object.entries(lists)) {
                if (list.includes(id)) {
                    item._props.MaximumNumberOfUsage = counts[type] === 9999 ? 0 : counts[type]
                    return
                }
            }
        }
        for (let it in clientDB.templates.items) {
            const item = clientDB.templates.items[it]
            const id = item._id
            //机械钥匙
            if (item._parent === "5c99f98d86f7745c314214b3" && !KeyList.BlackList.includes(item._id)) {
                item._props.MaximumNumberOfUsage = KeyCount.Normal === 9999 ? 0 : KeyCount.Normal
                updateUsage(item, id, KeyList, KeyCount)
            }
            //电子钥匙
            if (item._parent === "5c164d2286f774194c5e69fa") {
                updateUsage(item, id, CardList, CardCount)
            }
        }
        if (UseOrangeCardResource) {
            clientDB.templates.items[FactoryCard]._props.Prefab.path =
                "assets/content/items/spec/item_keycard_lab/item_keycard_lab_orange.bundle"
            clientDB.templates.items[InfinityFactoryCard]._props.Prefab.path =
                "assets/content/items/spec/item_keycard_lab/item_keycard_lab_orange.bundle"
        }
        if (ColorfulCardPriceOverride) {
            for (const card of Object.values(CardPrice)) {
                const handbookItem = clientDB.templates.handbook.Items.find(x => x.Id === card.ID);
                if (handbookItem) handbookItem.Price = card.Handbook
                clientDB.templates.prices[card.ID] = card.Price
            }
        }
    }
    function initBotEdit() {
        const clientBot = clientDB.bots.types
        const scav = clientBot.cursedassault
        const crazyScav = clientBot.assault
        const tagilla = clientBot.bosstagilla
        const sectantPriest = clientBot.sectantpriest
        const sectant = clientBot.sectantwarrior
        const bear = clientBot.bear
        const usec = clientBot.usec
        const reshalaChance = Config.CoreModule.VulcanMod.Config.BotEdit.BossChance
        //适配380的动态装备调整
        //clientDB.bots.types.bossbully.difficulty = vulcanAPI.deepCopy(clientDB.bots.types.bossknight.difficulty)
        clientDB.bots.types.bossbully.chances.equipment = modDB.bots.Reshala.chances.equipment
        clientDB.bots.types.bossbully.chances.weaponMods = modDB.bots.Reshala.chances.weaponMods
        clientDB.bots.types.bossbully.chances.equipmentMods = modDB.bots.Reshala.chances.equipmentMods
        clientDB.bots.types.bossbully.experience.reward = modDB.bots.Reshala.experience.reward
        clientDB.bots.types.bossbully.health = modDB.bots.Reshala.health
        clientDB.bots.types.bossbully.inventory = modDB.bots.Reshala.inventory
        clientDB.bots.types.bossbully.skills = modDB.bots.Reshala.skills
        clientDB.bots.types.bossbully.generation = modDB.bots.Reshala.generation
        clientDB.bots.types.followerbully.chances.equipment = modDB.bots.ReshalaFollower.chances.equipment
        clientDB.bots.types.followerbully.chances.weaponMods = modDB.bots.ReshalaFollower.chances.weaponMods
        clientDB.bots.types.followerbully.chances.equipmentMods = modDB.bots.ReshalaFollower.chances.equipmentMods
        clientDB.bots.types.followerbully.experience.reward = modDB.bots.ReshalaFollower.experience.reward
        clientDB.bots.types.followerbully.health = modDB.bots.ReshalaFollower.health
        clientDB.bots.types.followerbully.inventory = modDB.bots.ReshalaFollower.inventory
        clientDB.bots.types.followerbully.skills = modDB.bots.ReshalaFollower.skills
        clientDB.bots.types.followerbully.generation = modDB.bots.ReshalaFollower.generation
        clientDB.bots.types.sectantpriest.inventory.equipment.Pockets = {}
        clientDB.bots.types.sectantpriest.inventory.equipment.Pockets = { "60c7272c204bc17802313365": 1 }
        //clientDB.bots.types.sectantpriest.inventory = modDB.bots.Priest.inventory
        //#MC头兼容
        const MCHead = Config.CoreModule.VulcanMod.Config.BotEdit.MCHeadData
        for (var i = 0; i < MCHead.length; i++) {
            const Head = MCHead[i]
            for (var j = 0; j < Head.Bot.length; j++) {
                for (var k = 0; k < Head.Data.length; k++) {
                    clientDB.bots.types[Head.Bot[j]].inventory.equipment.FaceCover[vulcanAPI.convertHashID(Head.Data[k][0])] = Head.Data[k][1]
                }
            }
        }
        //Boss刷率调整
        const BossLocation = clientDB.locations["bigmap"].base.BossLocationSpawn
        if (BossLocation.some(x => x.BossName == "bossBully")) {
            BossLocation.find(x => x.BossName == "bossBully").BossChance = reshalaChance
        }
    }
    function initAreaEdit() {
        //太阳能及发电相关
        clientItem["5733279d245977289b77ec24"]._props.MaxResource = 40
        clientItem["5733279d245977289b77ec24"]._props.Resource = 40
        clientItem["5733279d245977289b77ec24"]._parent = "5d650c3e815116009f6201d2"
        clientItem["5d03794386f77420415576f5"]._props.MaxResource = 150
        clientItem["5d03794386f77420415576f5"]._props.Resource = 150
        clientItem["5d03794386f77420415576f5"]._parent = "5d650c3e815116009f6201d2"
        for (var i = 0; i < clientHideout.length; i++) {
            if (clientHideout[i].type == 18) {
                //太阳能
                clientHideout[i].stages["1"].bonuses[0].value = -60
            }
            if (clientHideout[i].type == 4) {
                clientHideout[i].stages["1"].bonuses[0].filter.push("5733279d245977289b77ec24") //汽车蓄电池
                clientHideout[i].stages["2"].bonuses[0].filter.push("5d03794386f77420415576f5") //坦克电池
                clientHideout[i].stages["2"].bonuses[0].filter.push(vulcanAPI.convertHashID("能量水晶"))
                clientHideout[i].stages["3"].bonuses[0].filter.push(vulcanAPI.convertHashID("兰波顿水晶"))
            }
        }
    }
    function revertHideout() {
        for (var i = 0; i < clientHideout.length; i++) {
            const area = clientHideout[i]
            for (let s in area.stages) {
                const stage = area.stages[s]
                if (stage.requirements.length > 0) {
                    const require = stage.requirements
                    for (var r = 0; r < require.length; r++) {
                        const requirement = require[r]
                        if (requirement.type == "Item") {
                            requirement.isSpawnedInSession = false
                        }
                    }
                }
            }
        }
    }
    function initPrestigeEdit() {
        const prestigeConfig = clientDB.templates.prestige.elements
        for (var i = 0; i < prestigeConfig.length; i++) {
            if (Config.CoreModule.VulcanMod.Config.Prestige.RemoveTransferLimit) {
                prestigeConfig[i].transferConfigs.stashConfig.filters.includedItems = ["54009119af1c881c07000029"]
            }
            prestigeConfig[i].transferConfigs.stashConfig.xCellCount = Config.CoreModule.VulcanMod.Config.Prestige.PrestigeTransferSetting[0]
            prestigeConfig[i].transferConfigs.stashConfig.yCellCount = Config.CoreModule.VulcanMod.Config.Prestige.PrestigeTransferSetting[1]
            //prestigeConfig[i].transferConfigs.skillConfig.transferMultiplier = 1 - Config.CoreModule.VulcanMod.Config.Prestige.PrestigeSkillPersent
            //prestigeConfig[i].transferConfigs.masteringConfig.transferMultiplier = 1 - Config.CoreModule.VulcanMod.Config.Prestige.PrestigeMasteringPersent

        }
    }
    function initRecipeEdit() {
        //配方相关
        //闪光子弹
        clientDB.hideout.production.recipes.find(x => x.endProduct == "5e85a9f4add9fe03027d9bf1").requirements.push({
            "templateId": vulcanAPI.convertHashID("荧石粉"),
            "count": 1,
            "isFunctional": false,
            "isEncoded": false,
            "type": "Item"
        })
        //闪光弹
        clientDB.hideout.production.recipes.find(x => x.endProduct == "5a0c27731526d80618476ac4").requirements.find(x => x.templateId == "590c5a7286f7747884343aea").templateId = vulcanAPI.convertHashID("荧石粉")

    }
    function isFood(itemid) {
        var Tag = vulcanAPI.getTag(vulcanAPI.getItem(itemid))
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
    function initLoot() {
        const LootData = Config.CoreModule.VulcanMod.Config.BotEdit.LootData
        for (var i = 0; i < LootData.length; i++) {
            for (var j = 0; j < LootData[i].Bot.length; j++) {
                for (var k = 0; k < LootData[i].Inventory.length; k++) {
                    for (var m = 0; m < LootData[i].Item.length; m++) {
                        vulcanAPI.addLoot(vulcanAPI.convertHashID(LootData[i].Item[m][0]), clientDB.bots.types[LootData[i].Bot[j]].inventory.items[LootData[i].Inventory[k]], LootData[i].Item[m][1])
                    }
                }
            }
        }
    }
    function fixContainer() {
        const 公文包 = clientDB.templates.items[vulcanAPI.convertHashID("外勤公文包")]._props.Grids[0]._props.filters[0].Filter
        //公文包容纳类型修复
        const BagArray = Config.CoreModule.VulcanMod.Config.Global.BagData
        for (var i = 0; i < BagArray.RagfairTag.length; i++) {
            vulcanAPI.addItemWithRagfairTagBySize(vulcanAPI.convertHashID(BagArray.RagfairTag[i]), 公文包, 1)
        }
        for (var i = 0; i < BagArray.Item.length; i++) {
            公文包.push(vulcanAPI.convertHashID(BagArray.Item[i]))
        }
    }
    function forceUnlockEventQuest() {
        const eventQuestList = [
            "641dbfd7f43eda9d810d7137", //重要伤员
            "64764abcd125ab430a14ccb5", //寻血猎犬
            "647710905320c660d91c15a5", //杀鸡儆猴
            "64916da7ad4e722c106f2345", //东窗事发
            "649af47d717cb30e7e4b5e26", //品酒师
            "655e427b64d09b4122018228", //惩罚者大丰收
            "6672ec2a2b6f3b71be794cc5"  //大妈彩色卡
        ]
        const questcfg = configServer.getConfig(ConfigTypes.QUEST)
        const clientQuest = clientDB.templates.quests
        const newquestcfg = {}
        for (let q in questcfg.eventQuests) {
            if (vulcanAPI.getQuest(q) != null) {
                //const name = vulcanAPI.getQuestName(q, "ch")
                //const trader = vulcanAPI.getTraderName(vulcanAPI.getQuest(q).traderId)
                //console.log(`${name}: ${trader}`)
                if (!eventQuestList.includes(q)) {
                    //console.log(vulcanAPI.getQuestName(q, "ch"))
                    newquestcfg[q] = vulcanAPI.deepCopy(questcfg.eventQuests[q])
                }
            }
        }
        questcfg.eventQuests = newquestcfg
        //重要伤员
        const 重要伤员 = clientQuest["641dbfd7f43eda9d810d7137"]
        重要伤员.conditions.AvailableForFinish[0].onlyFoundInRaid = true
        重要伤员.conditions.AvailableForFinish[1].onlyFoundInRaid = true
        重要伤员.conditions.AvailableForFinish[0].value = 100
        重要伤员.conditions.AvailableForFinish[1].value = 100
        //寻血猎犬 //exUsec //pmcBot
        const 寻血猎犬 = clientQuest["64764abcd125ab430a14ccb5"]
        寻血猎犬.conditions.AvailableForFinish[0].counter.conditions[0].savageRole = ["exUsec", "pmcBot"]
        //东窗事发
        const 东窗事发 = clientQuest["64916da7ad4e722c106f2345"]
        东窗事发.conditions.Fail = []
        const 品酒师 = clientQuest["649af47d717cb30e7e4b5e26"]
        品酒师.conditions.Fail = []
        const 大丰收 = clientQuest["655e427b64d09b4122018228"]
        大丰收.conditions.AvailableForFinish[1].target = [
            "59f32bb586f774757e1e8442",
            "59f32c3b86f77472a31742f0",
            "6662ea05f6259762c56f3189",
            "6662e9cda7e0b43baa3d5f76",
            "6662e9f37fa79a6d83730fa0",
            "6662e9aca7e0b43baa3d5f74",
            "6764207f2fa5e32733055c4a",
            "675dc9d37ae1a8792107ca96",
            "6764202ae307804338014c1a",
            "675dcb0545b1a2d108011b2b"
        ]




    }
    function btrExtend() {
        const btrsettings = clientDB.globals.config.BTRSettings
        const fencesettings = clientDB.globals.config.FenceSettings
        if (Config.CoreModule.VulcanMod.Config.Misc.BTRSettings.FreeDeliver) {
            btrsettings.DeliveryMinPrice = 1
            btrsettings.DeliveryPrice = 1
            btrsettings.ModDeliveryCost = 0.001
        }
        for (let l in fencesettings.Levels) {
            const level = fencesettings.Levels[l]
            level.DeliveryGridSize.x = Config.CoreModule.VulcanMod.Config.Misc.BTRSettings.DeliverSpeace[0]
            level.DeliveryGridSize.y = Config.CoreModule.VulcanMod.Config.Misc.BTRSettings.DeliverSpeace[1]
        }
    }
    function transitExtend() {
        const transitsettings = clientDB.globals.config.TransitSettings
        const fencesettings = clientDB.globals.config.FenceSettings
        if (Config.CoreModule.VulcanMod.Config.Misc.BTRSettings.FreeDeliver) {
            transitsettings.DeliveryMinPrice = 1
            transitsettings.DeliveryPrice = 1
            transitsettings.ModDeliveryCost = 0.001
        }
        for (let l in fencesettings.Levels) {
            const level = fencesettings.Levels[l]
            level.TransitGridSize.x = Config.CoreModule.VulcanMod.Config.Misc.BTRSettings.DeliverSpeace[0]
            level.TransitGridSize.y = Config.CoreModule.VulcanMod.Config.Misc.BTRSettings.DeliverSpeace[1]
        }
    }
    function cultistCircleExtend() {
        const hideoutsettings = configServer.getConfig(ConfigTypes.HIDEOUT)
        const cultistCircle = hideoutsettings.cultistCircle
        const clutistContainer = clientItem["66740c3739b9da6ce402ee65"]._props.Grids[0]
        cultistCircle.maxRewardItemCount = Config.CoreModule.VulcanMod.Config.Misc.CultistCircleSettings.MaxRewardCount
        cultistCircle.rewardPriceMultiplerMinMax.min = Config.CoreModule.VulcanMod.Config.Misc.CultistCircleSettings.RewardPriceMutipler[0]
        cultistCircle.rewardPriceMultiplerMinMax.max = Config.CoreModule.VulcanMod.Config.Misc.CultistCircleSettings.RewardPriceMutipler[1]
        //clutistContainer._props.maxCount = Config.CoreModule.VulcanMod.Config.Misc.CultistCircleSettings.MaxInputCount
        clutistContainer._props.cellsH = Config.CoreModule.VulcanMod.Config.Misc.CultistCircleSettings.CircleSpace[0]
        clutistContainer._props.cellsV = Config.CoreModule.VulcanMod.Config.Misc.CultistCircleSettings.CircleSpace[1]
        //clutistContainer.MaxItemsCount = 10
        if (Config.CoreModule.VulcanMod.Config.Misc.CultistCircleSettings.RemoveInputItemLimit) {
            clutistContainer._props.filters[0].ExcludedFilter = []
            clutistContainer._props.filters[0].Filter = ["54009119af1c881c07000029"]
        }

    }
};
export const initTips = (container: DependencyContainer) => {
    const vulcanAPI = container.resolve<VulcanCommon>("VulcanCommon")
    const logger = container.resolve<ILogger>("WinstonLogger")
    const preSptModLoader = container.resolve("PreSptModLoader")
    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer")
    const jsonUtil = container.resolve<JsonUtil>("JsonUtil")
    const clientDB = databaseServer.getTables()
    const clientItem = databaseServer.getTables().templates.items
    const clientHideout = clientDB.hideout.areas
    const configServer = container.resolve<ConfigServer>("ConfigServer")
    const imageRouter = container.resolve<ImageRouter>("ImageRouter")
    const modPath = Config.Global.ModPath
    const modDBPath = `${modPath}${Config.CoreModule.VulcanMod.Config.Global.ModPath}`
    const menuLocale = clientDB.locales.menu.ch.menu
    const modConfig = vulcanAPI.deserialize(vulcanAPI.readFile(`${modPath}/config.json`))
    const textarr = vulcanAPI.deserialize(vulcanAPI.readFile(`${modDBPath}locales/menu.json`))
    if (modConfig.CoreModule.VulcanMod.Config.LoadText.EnableTextColor) {
        const color = vulcanAPI.deserialize(vulcanAPI.readFile(`${modPath}/config.json`)).CoreModule.VulcanMod.Config.LoadText.TextColor
        //const color = Config
        menuLocale["Profile data loading..."] = `<color=${color}>${vulcanAPI.drawFromArray(textarr)}</color>`
    }
    else {
        menuLocale["Profile data loading..."] = vulcanAPI.drawFromArray(textarr)
    }
    function initTips() {
        //vulcanAPI.writeFile(`${modDBPath}exportmenu.json`, JSON.stringify(menuLocale, null, 4))
    }
}
