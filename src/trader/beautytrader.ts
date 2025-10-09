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

export const initBeautyTrader = (container: DependencyContainer) => {

    const vulcanAPI = container.resolve<VulcanCommon>("VulcanCommon")
    const preSptModLoader = container.resolve("PreSptModLoader");
    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
    const jsonUtil = container.resolve<JsonUtil>("JsonUtil");
    const clientDB = databaseServer.getTables();
    const modPath = Config.Global.ModPath
    const modDBPath = `${modPath}${Config.TraderModule.BeautyTrader.Config.Global.ModPath}`
    const imageFilePath = `./${modDBPath}res/`
    const modDB = vulcanAPI.loadRecursive(`${modDBPath}`)
    const imageRouter = container.resolve<ImageRouter>("ImageRouter");
    const configServer = container.resolve<ConfigServer>("ConfigServer");
    const modConfig = Config.TraderModule.BeautyTrader.Config
    const modData = modConfig.TraderData
    const locale = clientDB.locales.global["ch"]

    function loadTraderEditData() {
        for (let trader in modData) {
            const modTraderData = modData[trader]
            const traderBase = clientDB.traders[modTraderData.TraderID].base
            vulcanAPI.debug(`发现商人: ${vulcanAPI.getTraderName(modTraderData.TraderID)}`)
            if (modTraderData.OverrideTraderImage) {
                vulcanAPI.debug("替换商人头像")
                traderBase.avatar = `/files/trader/avatar/${modTraderData.TraderImageName}`
                imageRouter.addRoute(traderBase.avatar.replace(".png", ""), `${imageFilePath}/${modTraderData.TraderImageName}`)
            }
            if (modTraderData.OverrideTraderData) {
                vulcanAPI.debug("修改商人数据")
                for (let level in modTraderData.Data.Level) {
                    const levelData = modTraderData.Data.Level[level]
                    const traderLevel = parseInt(level) - 1
                    vulcanAPI.debug(level)
                    vulcanAPI.debug(traderLevel)
                    traderBase.loyaltyLevels[traderLevel].buy_price_coef = levelData.SellPriceRate
                    traderBase.loyaltyLevels[traderLevel].insurance_price_coef = levelData.InsurancePriceRate
                    traderBase.loyaltyLevels[traderLevel].minLevel = levelData.Level
                    traderBase.loyaltyLevels[traderLevel].minSalesSum = levelData.SellNum
                    traderBase.loyaltyLevels[traderLevel].minStanding = levelData.Standing
                }
            }
            if (modTraderData.OverrideTraderName) {
                vulcanAPI.debug("替换商人名字")
                for (let k in locale) {
                    locale[k] = locale[k]?.replace(modTraderData.TraderNameReplace[0], modTraderData.TraderNameReplace[1])
                }
            }
        }
    }

    //写不动了, 困了= =
    //明天看看能不能约上lzk吃饭
    //自定义商人数据, 要不要加头像呢....
    //加吧
    //再说吧?
    //要不要和商人美化合并呢?
    //要吧
    //算了, 留给明天的我头疼
    //女人心真是TMD海底针, 前两天还有共同话题今天就把我屏蔽了
    //就因为我多发了一点AI相关的话题?
    //难以评价
    //当前时间00:47 02.01.2.25
    //oh, 二月了....
    //晚安, 世界
    //\n
    //哈哈, 不出所料的鸽了, 笑死
    //摸会儿鱼准备开写
    //开写
    //还是合并了
    //哎= =
    //当前时间15:28 02.01.2025
    //商人模块应该全完工了
    //开搞物品模块
    //妈的黑商怎么自带25%溢价啊
    //白测半天= =


    vulcanAPI.access("加载商人模块: 商人美化")
    vulcanAPI.fetchAsync()
        .then(data => {

        })
        .catch(data => {
            loadTraderEditData()
        })
    vulcanAPI.log("发现新的联络人信息，正在更新……")
    vulcanAPI.waitForTime(2)



};
