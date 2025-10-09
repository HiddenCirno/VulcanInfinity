"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initGunFight = void 0;
const config_json_1 = __importDefault(require("../../config.json"));
//
const initGunFight = (container) => {
    const vulcanAPI = container.resolve("VulcanCommon");
    const preSptModLoader = container.resolve("PreSptModLoader");
    const databaseServer = container.resolve("DatabaseServer");
    const jsonUtil = container.resolve("JsonUtil");
    const clientDB = databaseServer.getTables();
    const clientItems = clientDB.templates.items;
    const modPath = config_json_1.default.Global.ModPath;
    const modConfig = config_json_1.default.ItemModule.GunFight.Config;
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
    function addUpgradeSlot() {
        for (let item in clientItems) {
            if (weaponType.includes(clientItems[item]?._parent)) {
                if (clientItems[item]?._props?.Slots?.length > 0) {
                    clientItems[item]?._props?.Slots.push({
                        "_name": "mod_upgrade",
                        "_id": vulcanAPI.generateHash(`${clientItems[item]._id}_upgrade`),
                        "_parent": clientItems[item]._id,
                        "_props": {
                            "filters": [
                                {
                                    "Shift": 0,
                                    "Filter": [
                                        "3d485d095ce7d89220994462",
                                        "e03f1ce8ffe577e7ed1bab1e",
                                        "1cf4dc959658ac938fdae6b6",
                                        "24b56700f4f680f0e051a384",
                                        "2889ec050973cfccde0ede94",
                                        "76e813888f99fc9912055666",
                                        "0d554464e915f1e3998598ce",
                                        "f542ea7ffdcfca5ac88da58d",
                                        "24d0774b01dd873f731f50f3",
                                        "2af20676f0464adf1055f81e"
                                    ]
                                }
                            ]
                        },
                        "_required": false,
                        "_mergeSlotWithChildren": false,
                        "_proto": "55d30c4c4bdc2db4468b457e"
                    });
                }
            }
            /*
            const tag = vulcanAPI.getItemRagfairTag(item)
            if (tag && (
                tag == "5b5f6f6c86f774093f2ecf0b" ||
                tag == "5b5f6f8786f77447ed563642" ||
                tag == "5b5f6fa186f77409407a7eb7"
            )) {
                clientItems[item]?._props?.Slots.push(
                    {
                        "_name": "mod_upgrade",
                        "_id": vulcanAPI.generateHash(`${clientItems[item]._id}_upgrade`),
                        "_parent": clientItems[item]._id,
                        "_props": {
                            "filters": [
                                {
                                    "Shift": 0,
                                    "Filter": [
                                        "8a16e2a6da4cbfe1ff8d8199",
                                        "9930fee8d8116144c383a947"
                                    ]
                                }
                            ]
                        },
                        "_required": false,
                        "_mergeSlotWithChildren": true,
                        "_proto": "55d30c4c4bdc2db4468b457e"
                    }
                )
                if (clientItems[item]._props) {
                    clientItems[item]._props.MergesWithChildren = true
                }
            }
                */
        }
    }
    function addBossLoot() {
        vulcanAPI.addLootToBoss(vulcanAPI.convertHashID("普通升级箱"), 40);
        vulcanAPI.addLootToBoss(vulcanAPI.convertHashID("稀有升级箱"), 30);
        vulcanAPI.addLootToBoss(vulcanAPI.convertHashID("史诗升级箱"), 20);
        vulcanAPI.addLootToBoss(vulcanAPI.convertHashID("传奇升级箱"), 10);
        vulcanAPI.addLootToBoss(vulcanAPI.convertHashID("神话升级箱"), 5);
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
    function completeDeleteHiddenRecoil() {
        const recoil = clientDB.globals.config.Aiming;
        const pose = {
            "x": 0,
            "y": 0,
            "z": 0
        };
        recoil.RecoilBackBonus = 0;
        recoil.RecoilVertBonus = 0;
        recoil.RecoilScaling = 0;
        //recoil.RecoilConvergenceMult = 100
        //recoil.RecoilDamping = 1
        //recoil.RecoilHandDamping = 1
        recoil.RecoilCrank = false;
        recoil.RecoilXIntensityByPose = pose;
        recoil.RecoilYIntensityByPose = pose;
        recoil.RecoilZIntensityByPose = pose;
    }
    function deleteHiddenRecoil() {
        const recoil = clientDB.globals.config.Aiming;
        const pose = {
            "x": 0,
            "y": 0,
            "z": 0
        };
        recoil.RecoilBackBonus = 0;
        recoil.RecoilVertBonus = 0;
        //recoil.RecoilScaling = 0
        //recoil.RecoilConvergenceMult = 100
        //recoil.RecoilDamping = 1
        //recoil.RecoilHandDamping = 1
        //recoil.RecoilCrank = false
        //recoil.RecoilXIntensityByPose = pose
        //recoil.RecoilYIntensityByPose = pose
        //recoil.RecoilZIntensityByPose = pose
    }
    //当前时间18:30 02.01.2025
    //还剩物品包, 然后就只剩战场管理模块了
    //全写完之后清理一下无用代码, 把冲突检查加了
    //出门压马路咯
    //当前时间21:52 02.01.2025
    //妈个姬累死老娘了
    //回到家瘫床上瘫到现在....
    //一万多步
    //别说, 还挺爽的
    //开写
    //....
    //没忍住开了把青天井, 打了一把爽局
    //18个东风6个虚空石, 火烧赤壁!
    //干到无尽36关
    //过瘾
    //开写开写))
    vulcanAPI.access("加载物品模块: 枪械武术");
    vulcanAPI.log("百般武艺，此乃美式居合法");
    vulcanAPI.initItemWithResource(modDB.items, resourceLoaded);
    addAssortToTrader(modDB.items, modConfig.Global.TraderID, modConfig.Global.EnableSellOnTrader);
    addBossLoot();
    vulcanAPI.waitForTime(2);
    vulcanAPI.fetchAsync()
        .then(data => {
        //console.log('Fetched data:', data);
    })
        .catch(error => {
        addUpgradeSlot();
        if (modConfig.DeleteInvisibleReciol) {
            deleteHiddenRecoil();
        }
        if (modConfig.CompletelyDeleteRecoil) {
            completeDeleteHiddenRecoil();
        }
    });
};
exports.initGunFight = initGunFight;
//# sourceMappingURL=gunfight.js.map