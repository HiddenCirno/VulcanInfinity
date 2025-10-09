"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMusicMuseum = void 0;
const config_json_1 = __importDefault(require("../../config.json"));
//
const initMusicMuseum = (container) => {
    const vulcanAPI = container.resolve("VulcanCommon");
    const preSptModLoader = container.resolve("PreSptModLoader");
    const databaseServer = container.resolve("DatabaseServer");
    const jsonUtil = container.resolve("JsonUtil");
    const clientDB = databaseServer.getTables();
    const clientItems = clientDB.templates.items;
    const modPath = config_json_1.default.Global.ModPath;
    const modConfig = config_json_1.default.ItemModule.Music.Config;
    const modDBPath = `${modPath}${modConfig.Global.ModPath}`;
    const imageFilePath = `./${modDBPath}res/`;
    const modDB = vulcanAPI.loadRecursive(`${modDBPath}`);
    const imageRouter = container.resolve("ImageRouter");
    const configServer = container.resolve("ConfigServer");
    const resourceLoaded = preSptModLoader.getImportedModsNames().includes("火神重工-资源包");
    function addEquip(data) {
        vulcanAPI.debug("读取生成数据....");
        for (let k in data) {
            const BotData = data[k];
            for (var b = 0; b < BotData.botlist.length; b++) {
                const botname = BotData.botlist[b];
                //console.log(botname)
                clientDB.bots.types[botname].chances.equipment.Earpiece = BotData.chance;
                clientDB.bots.types[botname].inventory.equipment.Earpiece = {};
                for (let i in BotData.equiplist) {
                    clientDB.bots.types[botname].inventory.equipment.Earpiece[vulcanAPI.convertHashID(i)] = BotData.equiplist[i];
                }
            }
        }
    }
    function loadMusic() {
        vulcanAPI.debug("加载物品....");
        //clientDB.bots.types.bosstagilla.inventory.equipment.Earpiece = {
        //    "f0b91a899a5053b4db5bd88d": 1
        //}
        //clientDB.bots.types.bosstagilla.chances.equipment.Earpiece = 100
        vulcanAPI.debug("移除耳机冲突....");
        for (let k in clientItems) {
            if (clientItems[k]._props) {
                clientItems[k]._props.BlocksEarpiece = false;
            }
        }
        vulcanAPI.debug("添加兼容....");
        const earFilter = clientItems["55d7217a4bdc2d86028b456d"]._props.Slots[11]._props.filters[0].Filter;
        const armBandFilter = clientItems["55d7217a4bdc2d86028b456d"]._props.Slots[14]._props.filters[0].Filter;
        for (let k in modDB.items) {
            earFilter.push(vulcanAPI.convertHashID(k));
            armBandFilter.push(vulcanAPI.convertHashID(k));
        }
        vulcanAPI.debug("添加装备生成....");
        addEquip(modDB.equipdata);
    }
    function addAssortToTrader(item, traderid, bools) {
        if (bools) {
            const assort = clientDB.traders[traderid].assort;
            const hashkeys = "11.13.2001-11.23.2019";
            for (let i in item) {
                const itemData = item[i];
                const itemID = vulcanAPI.convertHashID(itemData._id);
                var cacheItemID = vulcanAPI.generateHash(`${itemID}_${hashkeys}_enablesell`);
                assort.items.push({
                    _id: cacheItemID,
                    _tpl: itemID,
                    parentId: "hideout",
                    slotId: "hideout",
                    upd: {
                        UnlimitedCount: true,
                        StackObjectsCount: 999999
                    }
                });
                assort.barter_scheme[cacheItemID] = [[{
                            count: itemData._props.DefaultPrice,
                            _tpl: "5449016a4bdc2d6f028b456f"
                        }]];
                assort.loyal_level_items[cacheItemID] = 1;
            }
        }
    }
    vulcanAPI.access("加载物品模块: 音乐收藏馆");
    vulcanAPI.log("Het universum zingt voor mij！");
    vulcanAPI.initItemWithResource(modDB.items, resourceLoaded);
    addAssortToTrader(modDB.items, modConfig.Global.TraderID, modConfig.Global.EnableSellOnTrader);
    vulcanAPI.waitForTime(2);
    vulcanAPI.fetchAsync()
        .then(data => {
        //console.log('Fetched data:', data);
    })
        .catch(error => {
        loadMusic();
    });
};
exports.initMusicMuseum = initMusicMuseum;
//# sourceMappingURL=music.js.map