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

export const initInfinityStorage = (container: DependencyContainer) => {

    const vulcanAPI = container.resolve<VulcanCommon>("VulcanCommon")
    const preSptModLoader = container.resolve("PreSptModLoader");
    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
    const jsonUtil = container.resolve<JsonUtil>("JsonUtil");
    const clientDB = databaseServer.getTables();
    const modPath = Config.Global.ModPath
    const modDBPath = `${modPath}${Config.TraderModule.InfinityStorage.Config.Global.ModPath}`
    const imageFilePath = `./${modDBPath}res/`
    const modDB = vulcanAPI.loadRecursive(`${modDBPath}`)
    const imageRouter = container.resolve<ImageRouter>("ImageRouter");
    const configServer = container.resolve<ConfigServer>("ConfigServer");
    const modConfig = Config.TraderModule.InfinityStorage.Config

    function loadAllItemTrader(traderID) {
        const Trader = clientDB.traders[traderID]
        Trader.suits = []
        Trader.assort = {}
        Trader.assort.items = []
        Trader.assort.barter_scheme = {}
        Trader.assort.loyal_level_items = {}
        Trader.questassort = {}
        Trader.questassort.started = {}
        Trader.questassort.success = {}
        Trader.questassort.fail = {}
        const Assort = Trader.assort
        const PresetItem = []
        const hashkeys = "11.13.2001-11.23.2019"
        const testid = "587e02ff24597743df3deaeb"
        //console.log(vulcanAPI.generateHash(`${testid}_${hashkeys}`))
        //console.log(vulcanAPI.generateHash(`${testid}_${hashkeys}_1`))
        for (let i in clientDB.templates.items) {
            const ID = clientDB.templates.items[i]._id
            if (havePreset(ID)) {
                const Preset = getPreset(ID)
                if (!!Preset) {
                    var PresetCache = []
                    const Item = Preset._items
                    const PresetID = Preset._id
                    const Name = Preset._name
                    var CacheMainItem = vulcanAPI.deepCopy(Item[0])
                    var CacheMainID = vulcanAPI.generateHash(`${CacheMainItem._id}_${hashkeys}_${Name}_${PresetID}`)
                    CacheMainItem._id = CacheMainID
                    CacheMainItem.parentId = "hideout"
                    CacheMainItem.slotId = "hideout"
                    CacheMainItem.upd = {}
                    CacheMainItem.upd.UnlimitedCount = true
                    CacheMainItem.upd.StackObjectsCount = 99999999
                    PresetCache.push(CacheMainItem)
                    for (var c = 1; c < Item.length; c++) {
                        var CacheItem = {}
                        CacheItem._id = vulcanAPI.generateHash(`${Item[c]._id}_${hashkeys}_${Name}_${PresetID}`)
                        CacheItem.parentId = vulcanAPI.generateHash(`${Item[c].parentId}_${hashkeys}_${Name}_${PresetID}`)
                        CacheItem.slotId = Item[c].slotId
                        CacheItem._tpl = Item[c]._tpl
                        PresetCache.push(CacheItem)
                    }
                    PresetItem.push(PresetCache)
                }
            }

        }
        //length 226
        //预设
        for (var i = 0; i < PresetItem.length; i++) {

            for (var j = 0; j < PresetItem[i].length; j++) {
                Assort.items.push(PresetItem[i][j])
            }
            Assort.barter_scheme[PresetItem[i][0]._id] = [[{
                count: modConfig.EnableOverridePrice == true ? modConfig.MoneyCount : vulcanAPI.getPrice(vulcanAPI.getItem(PresetItem[i][0]._tpl)),
                _tpl: modConfig.EnableOverridePrice == true ? modConfig.MoneySet : "5449016a4bdc2d6f028b456f"
            }]]
            Assort.loyal_level_items[PresetItem[i][0]._id] = 1
        }
        for (let i in clientDB.templates.items) {
            const ID = clientDB.templates.items[i]._id
            var CacheItemID = vulcanAPI.generateHash(`${ID}_${hashkeys}`)
            //真·全物品(仅单物品)
            if (vulcanAPI.getItemRagfairTag(ID) != "5b47574386f77428ca22b33c") {
                Assort.items.push({
                    _id: CacheItemID,
                    _tpl: ID,
                    parentId: "hideout",
                    slotId: "hideout",
                    upd: {
                        UnlimitedCount: true,
                        StackObjectsCount: 99999999
                    }
                })

            }
            else {
                const stackSlot = vulcanAPI.getItem(ID)._props.StackSlots[0];
                const count = stackSlot._max_count
                const ammoTpl = vulcanAPI.convertHashID(stackSlot._props.filters[0].Filter[0]);
                const stacksize = vulcanAPI.getItem(ammoTpl)._props.StackMaxSize
                Assort.items.push({
                    _id: CacheItemID,
                    _tpl: ID,
                    parentId: "hideout",
                    slotId: "hideout",
                    upd: {
                        UnlimitedCount: true,
                        StackObjectsCount: 99999999
                    }
                })
                if (count <= stacksize) {
                    Assort.items.push({
                        //_id: vulcanAPI.generateHash(`ammo_${hashkeys}_${ID}`),
                        _id: vulcanAPI.generateHash(`${ID}_${hashkeys}_ammo`),
                        _tpl: ammoTpl,
                        parentId: CacheItemID,
                        slotId: "cartridges",
                        location: 0,
                        upd: {
                            StackObjectsCount: count
                        }
                    })
                }
                ///*
                else {
                    var location = 0
                    for (var a = 0; a < Math.floor(count / stacksize); a++) {
                        Assort.items.push({
                            //_id: vulcanAPI.generateHash(`ammo_${hashkeys}_${a}_${ID}`),
                            _id: vulcanAPI.generateHash(`${ID}_${hashkeys}_ammo_${a}`),
                            _tpl: ammoTpl,
                            parentId: CacheItemID,
                            slotId: "cartridges",
                            location: a,
                            upd: {
                                StackObjectsCount: stacksize
                            }
                        })
                        location = a
                    }
                    if (count % stacksize !== 0) {
                        Assort.items.push({
                            //_id: vulcanAPI.generateHash(`ammo_${hashkeys}_end_${ID}`),
                            _id: vulcanAPI.generateHash(`${ID}_${hashkeys}_ammo_end`),
                            _tpl: ammoTpl,
                            parentId: CacheItemID,
                            slotId: "cartridges",
                            location: location + 1,
                            upd: {
                                StackObjectsCount: count % stacksize
                            }
                        })
                    }
                }
                //*/
            }
            Assort.barter_scheme[CacheItemID] = [[{
                count: modConfig.EnableOverridePrice == true ? modConfig.MoneyCount : vulcanAPI.getPrice(vulcanAPI.getItem(ID)),
                _tpl: modConfig.EnableOverridePrice == true ? modConfig.MoneySet : "5449016a4bdc2d6f028b456f"
            }]]
            Assort.loyal_level_items[CacheItemID] = 1
        }
        vulcanAPI.writeFile(`${modDBPath}exportassort.json`, JSON.stringify(Assort, null, 4))
    }
    function havePreset(itemid) {
        for (let p in clientDB.globals.ItemPresets) {
            if (clientDB.globals.ItemPresets[p]?._encyclopedia == itemid) {
                return true
            }
        }
        return false
    }
    function getPreset(itemid) {
        for (let p in clientDB.globals.ItemPresets) {
            if (clientDB.globals.ItemPresets[p]?._encyclopedia == itemid) {
                return clientDB.globals.ItemPresets[p]
            }
        }
        return null
    }
    vulcanAPI.access("加载商人模块: 无限秘库")
    vulcanAPI.initTrader(modDB.trader, imageFilePath, 0, 100, 36000000)
    if (!modConfig.EnableAsyncLoad) {
        loadAllItemTrader(vulcanAPI.convertHashID(modDB.trader.base._id))
    }
    vulcanAPI.log("身份验证通过，已取得无限秘库权限认证")
    vulcanAPI.waitForTime(2)
    vulcanAPI.fetchAsync()
        .then(data => {
            //console.log('Fetched data:', data);
        })
        .catch(error => {
            if (modConfig.EnableAsyncLoad) {
                loadAllItemTrader(vulcanAPI.convertHashID(modDB.trader.base._id))
            }

        });


};
