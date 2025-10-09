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

export const initMEStorage = (container: DependencyContainer) => {

    const vulcanAPI = container.resolve<VulcanCommon>("VulcanCommon")
    const preSptModLoader = container.resolve("PreSptModLoader");
    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
    const jsonUtil = container.resolve<JsonUtil>("JsonUtil");
    const clientDB = databaseServer.getTables();
    const clientItems = clientDB.templates.items;
    const modPath = Config.Global.ModPath
    const modConfig = Config.ItemModule.MEStorage.Config
    const modDBPath = `${modPath}${modConfig.Global.ModPath}`
    const imageFilePath = `./${modDBPath}res/`
    const modDB = vulcanAPI.loadRecursive(`${modDBPath}`)
    const imageRouter = container.resolve<ImageRouter>("ImageRouter");
    const configServer = container.resolve<ConfigServer>("ConfigServer");
    const resourceLoaded = preSptModLoader.getImportedModsNames().includes("火神重工-资源包")

    function initBlackList() {
        const idlist = [
            "ME驱动器",
            "1k存储元件",
            "4k存储元件",
            "16k存储元件",
            "64k存储元件",
            "1k交换品存储元件",
            "4k交换品存储元件",
            "16k交换品存储元件",
            "64k交换品存储元件",
            "1k医疗存储元件",
            "4k医疗存储元件",
            "16k医疗存储元件",
            "64k医疗存储元件",
            "1k装备存储元件",
            "4k装备存储元件",
            "16k装备存储元件",
            "64k装备存储元件",
            "1k武器存储元件",
            "4k武器存储元件",
            "16k武器存储元件",
            "64k武器存储元件",
            "1k食品存储元件",
            "4k食品存储元件",
            "16k食品存储元件",
            "64k食品存储元件",
            "1k档案存储元件",
            "4k档案存储元件",
            "16k档案存储元件",
            "64k档案存储元件"
        ]
        const blacklist = []
        for (var i = 0; i < idlist.length; i++) {
            blacklist.push(vulcanAPI.convertHashID(idlist[i]))
        }
        for (let i in clientItems) {
            const item = clientItems[i]
            if (item._props.Grids) {
                if (item._props.Grids.length > 0) {
                    for (var g = 0; g < item._props.Grids.length; g++) {
                        const grid = item._props.Grids[g]
                        if (grid._props.filters.length > 0) {
                            const filters = grid._props.filters[0].Filter
                            const excluded = grid._props.filters[0].ExcludedFilter
                            for (var id = 0; id < blacklist.length; id++) {
                                const list = blacklist[id]
                                if (!filters.includes(list)) {
                                    try {
                                        excluded.push(list)
                                    }
                                    catch (err) {
                                        continue
                                    }
                                }
                            }
                        }

                    }
                }
            }
        }
    }

    function initMEItem() {
        const equip = [
            "543be5f84bdc2dd4348b456a",
            "5645bcb74bdc2ded0b8b4578",
            "5448e53e4bdc2d60728b4567",
            "5448e5284bdc2dcb718b4567",
            "5991b51486f77447b112d44f",
            "5ac78a9b86f7741cca0bbd8d",
            "5b4391a586f7745321235ab2",
            "544fb5454bdc2df8738b456a"
        ]
        const folder = vulcanAPI.getItem("590c60fc86f77412b13fddcf")._props.Grids[0]._props.filters[0].Filter
        const mefolder = vulcanAPI.deepCopy(folder)
        const sicc = vulcanAPI.getItem("5d235bb686f77443f4331278")._props.Grids[0]._props.filters[0].Filter
        for (var i = 0; i < sicc.length; i++) {
            if (!mefolder.includes(sicc[i])) {
                mefolder.push(sicc[i])
            }
        }
        for (let i in modDB.items) {
            const item = modDB.items[i]
            const itemid = item._id
            const hashid = vulcanAPI.convertHashID(itemid)
            if (itemid.includes("档案")) {
                vulcanAPI.getItem(hashid)._props.Grids[0]._props.filters[0].Filter = mefolder
            }
            if (itemid.includes("装备")) {
                vulcanAPI.getItem(hashid)._props.Grids[0]._props.filters[0].Filter = equip
            }

        }

        vulcanAPI.getItem(vulcanAPI.convertHashID("1k交换品存储元件"))._props.Grids[0]._props.cellsH = 4
        vulcanAPI.getItem(vulcanAPI.convertHashID("1k交换品存储元件"))._props.Grids[0]._props.cellsV = 4
        vulcanAPI.getItem(vulcanAPI.convertHashID("4k交换品存储元件"))._props.Grids[0]._props.cellsH = 8
        vulcanAPI.getItem(vulcanAPI.convertHashID("4k交换品存储元件"))._props.Grids[0]._props.cellsV = 8
        vulcanAPI.getItem(vulcanAPI.convertHashID("16k交换品存储元件"))._props.Grids[0]._props.cellsH = 12
        vulcanAPI.getItem(vulcanAPI.convertHashID("16k交换品存储元件"))._props.Grids[0]._props.cellsV = 12
        vulcanAPI.getItem(vulcanAPI.convertHashID("64k交换品存储元件"))._props.Grids[0]._props.cellsH = 16
        vulcanAPI.getItem(vulcanAPI.convertHashID("64k交换品存储元件"))._props.Grids[0]._props.cellsV = 16
        vulcanAPI.getItem(vulcanAPI.convertHashID("1k医疗存储元件"))._props.Grids[0]._props.cellsH = 4
        vulcanAPI.getItem(vulcanAPI.convertHashID("1k医疗存储元件"))._props.Grids[0]._props.cellsV = 4
        vulcanAPI.getItem(vulcanAPI.convertHashID("4k医疗存储元件"))._props.Grids[0]._props.cellsH = 8
        vulcanAPI.getItem(vulcanAPI.convertHashID("4k医疗存储元件"))._props.Grids[0]._props.cellsV = 8
        vulcanAPI.getItem(vulcanAPI.convertHashID("16k医疗存储元件"))._props.Grids[0]._props.cellsH = 12
        vulcanAPI.getItem(vulcanAPI.convertHashID("16k医疗存储元件"))._props.Grids[0]._props.cellsV = 12
        vulcanAPI.getItem(vulcanAPI.convertHashID("64k医疗存储元件"))._props.Grids[0]._props.cellsH = 16
        vulcanAPI.getItem(vulcanAPI.convertHashID("64k医疗存储元件"))._props.Grids[0]._props.cellsV = 16
        vulcanAPI.getItem(vulcanAPI.convertHashID("1k装备存储元件"))._props.Grids[0]._props.cellsH = 4
        vulcanAPI.getItem(vulcanAPI.convertHashID("1k装备存储元件"))._props.Grids[0]._props.cellsV = 4
        vulcanAPI.getItem(vulcanAPI.convertHashID("4k装备存储元件"))._props.Grids[0]._props.cellsH = 8
        vulcanAPI.getItem(vulcanAPI.convertHashID("4k装备存储元件"))._props.Grids[0]._props.cellsV = 8
        vulcanAPI.getItem(vulcanAPI.convertHashID("16k装备存储元件"))._props.Grids[0]._props.cellsH = 12
        vulcanAPI.getItem(vulcanAPI.convertHashID("16k装备存储元件"))._props.Grids[0]._props.cellsV = 12
        vulcanAPI.getItem(vulcanAPI.convertHashID("64k装备存储元件"))._props.Grids[0]._props.cellsH = 16
        vulcanAPI.getItem(vulcanAPI.convertHashID("64k装备存储元件"))._props.Grids[0]._props.cellsV = 16
        vulcanAPI.getItem(vulcanAPI.convertHashID("1k武器存储元件"))._props.Grids[0]._props.cellsH = 4
        vulcanAPI.getItem(vulcanAPI.convertHashID("1k武器存储元件"))._props.Grids[0]._props.cellsV = 4
        vulcanAPI.getItem(vulcanAPI.convertHashID("4k武器存储元件"))._props.Grids[0]._props.cellsH = 8
        vulcanAPI.getItem(vulcanAPI.convertHashID("4k武器存储元件"))._props.Grids[0]._props.cellsV = 8
        vulcanAPI.getItem(vulcanAPI.convertHashID("16k武器存储元件"))._props.Grids[0]._props.cellsH = 12
        vulcanAPI.getItem(vulcanAPI.convertHashID("16k武器存储元件"))._props.Grids[0]._props.cellsV = 12
        vulcanAPI.getItem(vulcanAPI.convertHashID("64k武器存储元件"))._props.Grids[0]._props.cellsH = 16
        vulcanAPI.getItem(vulcanAPI.convertHashID("64k武器存储元件"))._props.Grids[0]._props.cellsV = 16
        vulcanAPI.getItem(vulcanAPI.convertHashID("1k食品存储元件"))._props.Grids[0]._props.cellsH = 4
        vulcanAPI.getItem(vulcanAPI.convertHashID("1k食品存储元件"))._props.Grids[0]._props.cellsV = 4
        vulcanAPI.getItem(vulcanAPI.convertHashID("4k食品存储元件"))._props.Grids[0]._props.cellsH = 8
        vulcanAPI.getItem(vulcanAPI.convertHashID("4k食品存储元件"))._props.Grids[0]._props.cellsV = 8
        vulcanAPI.getItem(vulcanAPI.convertHashID("16k食品存储元件"))._props.Grids[0]._props.cellsH = 12
        vulcanAPI.getItem(vulcanAPI.convertHashID("16k食品存储元件"))._props.Grids[0]._props.cellsV = 12
        vulcanAPI.getItem(vulcanAPI.convertHashID("64k食品存储元件"))._props.Grids[0]._props.cellsH = 16
        vulcanAPI.getItem(vulcanAPI.convertHashID("64k食品存储元件"))._props.Grids[0]._props.cellsV = 16
        vulcanAPI.getItem(vulcanAPI.convertHashID("1k档案存储元件"))._props.Grids[0]._props.cellsH = 4
        vulcanAPI.getItem(vulcanAPI.convertHashID("1k档案存储元件"))._props.Grids[0]._props.cellsV = 4
        vulcanAPI.getItem(vulcanAPI.convertHashID("4k档案存储元件"))._props.Grids[0]._props.cellsH = 8
        vulcanAPI.getItem(vulcanAPI.convertHashID("4k档案存储元件"))._props.Grids[0]._props.cellsV = 8
        vulcanAPI.getItem(vulcanAPI.convertHashID("16k档案存储元件"))._props.Grids[0]._props.cellsH = 12
        vulcanAPI.getItem(vulcanAPI.convertHashID("16k档案存储元件"))._props.Grids[0]._props.cellsV = 12
        vulcanAPI.getItem(vulcanAPI.convertHashID("64k档案存储元件"))._props.Grids[0]._props.cellsH = 16
        vulcanAPI.getItem(vulcanAPI.convertHashID("64k档案存储元件"))._props.Grids[0]._props.cellsV = 16

        addAssortToTrader("ME驱动器", Traders.MECHANIC, 4)
        addAssortToTrader("1k存储元件", Traders.MECHANIC, 1)
        addAssortToTrader("4k存储元件", Traders.MECHANIC, 2)
        addAssortToTrader("16k存储元件", Traders.MECHANIC, 3)
        addAssortToTrader("64k存储元件", Traders.MECHANIC, 4)
        addAssortToTrader("1k交换品存储元件", Traders.MECHANIC, 1)
        addAssortToTrader("4k交换品存储元件", Traders.MECHANIC, 2)
        addAssortToTrader("16k交换品存储元件", Traders.MECHANIC, 3)
        addAssortToTrader("64k交换品存储元件", Traders.MECHANIC, 4)
        addAssortToTrader("1k医疗存储元件", Traders.MECHANIC, 1)
        addAssortToTrader("4k医疗存储元件", Traders.MECHANIC, 2)
        addAssortToTrader("16k医疗存储元件", Traders.MECHANIC, 3)
        addAssortToTrader("64k医疗存储元件", Traders.MECHANIC, 4)
        addAssortToTrader("1k装备存储元件", Traders.MECHANIC, 1)
        addAssortToTrader("4k装备存储元件", Traders.MECHANIC, 2)
        addAssortToTrader("16k装备存储元件", Traders.MECHANIC, 3)
        addAssortToTrader("64k装备存储元件", Traders.MECHANIC, 4)
        addAssortToTrader("1k武器存储元件", Traders.MECHANIC, 1)
        addAssortToTrader("4k武器存储元件", Traders.MECHANIC, 2)
        addAssortToTrader("16k武器存储元件", Traders.MECHANIC, 3)
        addAssortToTrader("64k武器存储元件", Traders.MECHANIC, 4)
        addAssortToTrader("1k食品存储元件", Traders.MECHANIC, 1)
        addAssortToTrader("4k食品存储元件", Traders.MECHANIC, 2)
        addAssortToTrader("16k食品存储元件", Traders.MECHANIC, 3)
        addAssortToTrader("64k食品存储元件", Traders.MECHANIC, 4)
        addAssortToTrader("1k档案存储元件", Traders.MECHANIC, 1)
        addAssortToTrader("4k档案存储元件", Traders.MECHANIC, 2)
        addAssortToTrader("16k档案存储元件", Traders.MECHANIC, 3)
        addAssortToTrader("64k档案存储元件", Traders.MECHANIC, 4)
    }


    function addAssortToTrader(itemid, traderid, level) {
        const assort = clientDB.traders[traderid].assort
        const hashkeys = "11.13.2001-11.23.2019"
        const itemData = vulcanAPI.getItem(vulcanAPI.convertHashID(itemid))
        const itemID = itemData._id
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
        assort.loyal_level_items[cacheItemID] = level



    }

    vulcanAPI.access("加载物品模块: ME存储")
    vulcanAPI.log("AE？.jpg")
    vulcanAPI.initItemWithResource(modDB.items, resourceLoaded)
    initMEItem()
    initBlackList()
    vulcanAPI.waitForTime(2)


};
