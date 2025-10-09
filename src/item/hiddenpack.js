"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initItemPack = void 0;
const config_json_1 = __importDefault(require("../../config.json"));
//
const initItemPack = (container) => {
    const vulcanAPI = container.resolve("VulcanCommon");
    const preSptModLoader = container.resolve("PreSptModLoader");
    const databaseServer = container.resolve("DatabaseServer");
    const jsonUtil = container.resolve("JsonUtil");
    const clientDB = databaseServer.getTables();
    const clientItems = clientDB.templates.items;
    const modPath = config_json_1.default.Global.ModPath;
    const modConfig = config_json_1.default.ItemModule.ItemPack.Config;
    const modDBPath = `${modPath}${modConfig.Global.ModPath}`;
    const imageFilePath = `./${modDBPath}res/`;
    const modDB = vulcanAPI.loadRecursive(`${modDBPath}`);
    const imageRouter = container.resolve("ImageRouter");
    const configServer = container.resolve("ConfigServer");
    const resourceLoaded = preSptModLoader.getImportedModsNames().includes("火神重工-资源包");
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
        "5447b5f14bdc2d61278b4567" //AssaultRifle
    ];
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
    clientItems["633ec6ee025b096d320a3b15"]._props.Cartridges[0]._props.filters[0].Filter.push(vulcanAPI.convertHashID("PS19C"));
    //console.log(clientItems["633ec6ee025b096d320a3b15"]._props.Cartridges[0]._props.filters[0].Filter)
    //当前时间23:38 02.01.2024
    //尼玛的物品包怎么是你妈的旧格式啊
    //需要彻底翻新, 你妈的
    //先扔着吧
    //那就只剩箭头了
    //努努力今晚发内测版
    //开写!
    vulcanAPI.access("加载物品模块: 千叶的物品包");
    vulcanAPI.log("这句加载词我没想好所以先这样");
    vulcanAPI.initItemWithResource(modDB.items, resourceLoaded);
    addAssortToTrader(modDB.items, modConfig.Global.TraderID, modConfig.Global.EnableSellOnTrader);
    vulcanAPI.waitForTime(2);
    vulcanAPI.fetchAsync()
        .then(data => {
        //console.log('Fetched data:', data);
    })
        .catch(error => {
    });
};
exports.initItemPack = initItemPack;
//# sourceMappingURL=hiddenpack.js.map