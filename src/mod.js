"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
const GameEditions_1 = require("C:/snapshot/project/obj/models/enums/GameEditions");
const test_1 = require("./test");
const ritc_1 = require("./core/ritc");
const milkcore_1 = require("./core/milkcore");
const vulcanmod_1 = require("./core/vulcanmod");
const trainer_1 = require("./core/trainer");
const systemgift_1 = require("./core/systemgift");
const console_1 = require("./core/console");
const infinitestorage_1 = require("./trader/infinitestorage");
const gunsmith_1 = require("./trader/gunsmith");
const misc_1 = require("./trader/misc");
const beautytrader_1 = require("./trader/beautytrader");
const music_1 = require("./item/music");
const gunfight_1 = require("./item/gunfight");
const hiddenpack_1 = require("./item/hiddenpack");
const ae2_1 = require("./item/ae2");
const arrow_1 = require("./battle/arrow");
const config_json_1 = __importDefault(require("../config.json"));
const bosskillacopy_json_1 = __importDefault(require("../bosskillacopy.json"));
const Knight_json_1 = __importDefault(require("../vulcanmod/bots/Knight.json"));
const BigPipe_json_1 = __importDefault(require("../vulcanmod/bots/BigPipe.json"));
const Birdeye_json_1 = __importDefault(require("../vulcanmod/bots/Birdeye.json"));
const equipdata_json_1 = __importDefault(require("../music/equipdata.json"));
const Sanitar_json_1 = __importDefault(require("../vulcanmod/bots/Sanitar.json"));
const Gluhar_json_1 = __importDefault(require("../vulcanmod/bots/Gluhar.json"));
const Kolontay_json_1 = __importDefault(require("../vulcanmod/bots/Kolontay.json"));
//
class Mod {
    static container;
    preSptLoad(container) {
        Mod.container = container;
        const configServer = container.resolve("ConfigServer");
        const traderConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.TRADER);
        const preSptModLoader = container.resolve("PreSptModLoader");
        //container.register<VulcanGlobal>("VulcanGlobal", VulcanGlobal, { lifecycle: Lifecycle.Singleton });
        const staticRouterModService = container.resolve("StaticRouterModService");
        const imageRouter = container.resolve("ImageRouter");
        if (config_json_1.default.CoreModule.VulcanMod.Active && config_json_1.default.CoreModule.VulcanMod.Config.DogTagGenerate.Active) {
            container.afterResolution("BotGenerator", (_t, result) => {
                // We want to replace the original method logic with something different
                result.addDogtagToBot = (bot) => {
                    return this.DogTagGenerator(bot);
                };
                // The modifier Always makes sure this replacement method is ALWAYS replaced
            }, { frequency: "Always" });
        }
        if (config_json_1.default.CoreModule.SystemGift.Active) {
            staticRouterModService.registerStaticRouter("SystemGiftSendEvent", [
                {
                    url: "/launcher/server/serverModsUsedByProfile",
                    action: (url, info, sessionId, output) => {
                        (0, systemgift_1.sentGit)(container, sessionId);
                        return output;
                    }
                }
            ], "aki");
        }
        if (config_json_1.default.CoreModule.VulcanMod.Config.LoadText.Active) {
            staticRouterModService.registerStaticRouter("RandomTipsLoadEvent", [
                {
                    url: "/launcher/server/version",
                    action: (url, info, sessionId, output) => {
                        (0, vulcanmod_1.initTips)(container);
                        return output;
                    }
                }
            ], "aki");
        }
        //test
        container.afterResolution("BotGenerator", (_t, result) => {
            // We want to replace the original method logic with something different
            result.generateBot = (sessionId, bot, botJsonTemplate, botGenerationDetails) => {
                return this.customBotGenerator(sessionId, bot, botJsonTemplate, botGenerationDetails);
            };
            // The modifier Always makes sure this replacement method is ALWAYS replaced
        }, { frequency: "Always" });
    }
    postSptLoad(container) {
        const Logger = container.resolve("WinstonLogger");
        const PreSptModLoader = container.resolve("PreSptModLoader");
        const databaseServer = container.resolve("DatabaseServer");
        const jsonUtil = container.resolve("JsonUtil");
        const clientDB = databaseServer.getTables();
    }
    postDBLoad(container) {
        const Logger = container.resolve("WinstonLogger");
        const preSptModLoader = container.resolve("PreSptModLoader");
        const databaseServer = container.resolve("DatabaseServer");
        const jsonUtil = container.resolve("JsonUtil");
        const vulcanAPI = container.resolve("VulcanCommon");
        const clientDB = databaseServer.getTables();
        const modPath = config_json_1.default.Global.ModPath;
        const loadedModList = preSptModLoader.getImportedModsNames();
        vulcanAPI.debug(loadedModList);
        //console.log(ModPath)
        var Therapist = "54cb57776803fa99248b456e";
        vulcanAPI.Log("我知晓所有的道路，它们都通往同一个地方。");
        vulcanAPI.waitForTime(2);
        vulcanAPI.Log("所有的过去、现在，以及未来，都将在此合一。");
        vulcanAPI.waitForTime(2);
        if (config_json_1.default.CoreModule.RITC.Active) {
            loadModWithConflictCheck(loadedModList, "罗德岛驻塔科夫贸易中心", ritc_1.initRITCCore, container);
        }
        if (config_json_1.default.CoreModule.MilkCore.Active) {
            loadModWithConflictCheck(loadedModList, "[牛奶盒]MilkCore", milkcore_1.initMilkCore, container);
            //initMilkCore(container)
        }
        if (config_json_1.default.CoreModule.VulcanMod.Active) {
            loadModWithConflictCheck(loadedModList, "火神重工-重启", vulcanmod_1.initVulcanMod, container);
            //initVulcanMod(container)
        }
        if (config_json_1.default.CoreModule.ScriptTrainer.Active) {
            loadModWithConflictCheck(loadedModList, "[简单辅助]ScriptTrainer", trainer_1.initScriptTrainer, container);
            //initScriptTrainer(container)
        }
        if (config_json_1.default.CoreModule.SystemGift.Active) {
            loadModWithConflictCheck(loadedModList, "[每日补给]SystemGift", systemgift_1.initSystemGift, container);
            //initSystemGift(container)
        }
        if (config_json_1.default.CoreModule.Console.Active) {
            loadModWithConflictCheck(loadedModList, "塔科夫控制台", console_1.initConsole, container);
            //initConsole(container)
        }
        if (config_json_1.default.TraderModule.InfinityStorage.Active) {
            (0, infinitestorage_1.initInfinityStorage)(container);
        }
        if (config_json_1.default.TraderModule.GunSmith.Active) {
            loadModWithConflictCheck(loadedModList, "懒人枪匠", gunsmith_1.initGunSmith, container);
            //initGunSmith(container)
        }
        if (config_json_1.default.TraderModule.BeautyTrader.Active) {
            loadModWithConflictCheck(loadedModList, "[慷慨的黑商]LavishFence", beautytrader_1.initBeautyTrader, container);
            //initBeautyTrader(container)
        }
        if (config_json_1.default.ItemModule.Music.Active) {
            loadModWithConflictCheck(loadedModList, "音乐收藏馆", music_1.initMusicMuseum, container);
            //initMusicMuseum(container)
        }
        if (config_json_1.default.ItemModule.GunFight.Active) {
            loadModWithConflictCheck(loadedModList, "枪械武术", gunfight_1.initGunFight, container);
            //initGunFight(container)
        }
        if (config_json_1.default.ItemModule.ItemPack.Active) {
            loadModWithConflictCheck(loadedModList, "千叶的物品包", hiddenpack_1.initItemPack, container);
            //initGunFight(container)
        }
        if (config_json_1.default.ItemModule.MEStorage.Active) {
            (0, ae2_1.initMEStorage)(container);
            //initGunFight(container)
        }
        if (config_json_1.default.BattleModule.ArrowMarker.Active) {
            loadModWithConflictCheck(loadedModList, "箭头标记", arrow_1.initArrowMarker, container);
            //initGunFight(container)
        }
        (0, misc_1.initTraderModuleMisc)(container);
        (0, test_1.TestLog)(container);
        function loadModWithConflictCheck(loadedmodlist, modname, loadfunction, ...loadparams) {
            if (loadedmodlist.includes(modname)) {
                vulcanAPI.error(`检测到您已安装「${modname}」Mod，此Mod已合并入火神重工: 无限，将在未来停止维护，为防止冲突，已终止相关的启动流程`);
                vulcanAPI.waitForTime(5);
            }
            else {
                loadfunction(...loadparams);
            }
        }
        vulcanAPI.fetchAsync()
            .then(data => {
        })
            .catch(err => {
            vulcanAPI.fetchAsync()
                .then(data => {
            })
                .catch(err => {
                vulcanAPI.fetchAsync()
                    .then(data => {
                })
                    .catch(err => {
                    vulcanAPI.warn("您正在使用火神重工: 无限的测试版本, 如有问题欢迎反馈");
                    if (!config_json_1.default.Licence.Agree) {
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        vulcanAPI.error(`这不是一个正常报错，请打开${config_json_1.default.Global.ModPath}config.json并拉到最下方阅读使用说明`);
                        const a = null.length;
                    }
                });
            });
        });
    }
    botInvCache = [];
    DogTagGenerator(bot) {
        const botGenerator = Mod.container.resolve("BotGenerator");
        const vulcanAPI = Mod.container.resolve("VulcanCommon");
        function russianToLatinApproximation(russianString) {
            // 俄文字母到拉丁字母的映射表  
            const russianToLatinMap = {
                'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D',
                'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z', 'И': 'I',
                'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
                'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T',
                'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch',
                'Ш': 'Sh', 'Щ': 'Sch', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
                'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
                'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
                'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
                'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
                'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
                'ш': 'sh', 'щ': 'sch', 'э': 'e', 'ю': 'yu', 'я': 'ya'
            };
            if (!russianString) {
                return "不知道发生了什么, 这个AI没有名字, 也许是尼基塔死了妈妈";
            }
            // 遍历字符串中的每个字符，并进行替换  
            let latinString = '';
            for (let i = 0; i < russianString.length; i++) {
                const char = russianString[i];
                // 检查字符是否在映射表中  
                if (russianToLatinMap.hasOwnProperty(char)) {
                    latinString += russianToLatinMap[char];
                }
                else {
                    // 如果字符不在映射表中，则保留原样（例如空格、标点符号等）  
                    latinString += char;
                }
            }
            return latinString;
        }
        function getLocalDateTimeString() {
            const date = new Date();
            // 获取本地时间的各个组成部分  
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以要+1  
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            // 拼接字符串  
            const dateTimeString = `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
            return dateTimeString;
        }
        function randomInt(min, max) {
            // 确保min不大于max
            if (min > max) {
                [min, max] = [max, min]; // 交换两者的值
            }
            // 计算范围并生成随机整数
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        function findPlacement(mapA, placed, piece) {
            vulcanAPI.debug("开始查找栏位");
            // 1. 先把 placed 数组里的所有成员都“刻画”到 mapA 上（把占用格子值置为 1）
            for (let item of placed) {
                const grid = mapA[item.slot];
                const h = item.r == 0 ? item.h : item.v;
                const w = item.r == 0 ? item.v : item.h;
                for (let dx = item.x; dx < item.x + h; dx++) {
                    for (let dy = item.y; dy < item.y + w; dy++) {
                        grid[dx][dy] = 1;
                    }
                }
            }
            vulcanAPI.debug("开始搜索栏位");
            // 2. 对每个 slot 尝试放入新成员
            for (let slotName in mapA) {
                const grid = mapA[slotName];
                const maxCols = grid[0].length; // 列数（横向）
                const maxRows = grid.length; // 行数（纵向）
                const sGrid = maxCols * maxRows;
                const sItem = piece.h * piece.v;
                // 两种状态：不旋转 (r=0)，旋转 (r=1)
                for (let r of [0, 1]) {
                    // 计算实际占用的行列数
                    const reqCols = r == 0 ? piece.v : piece.h; // 所需列数（横向）
                    const reqRows = r == 0 ? piece.h : piece.v; // 所需行数（纵向）
                    // 边界检查：能否放入该 slot
                    if (reqCols > maxCols || reqRows > maxRows)
                        continue;
                    // 遍历所有可能的起始位置
                    for (let x = 0; x < maxRows; x++) {
                        for (let y = 0; y < maxCols; y++) {
                            let canPlace = true;
                            vulcanAPI.debug("开始尝试放置");
                            // 检查该区域是否全为 0
                            for (let dx = x; dx < reqRows + x; dx++) {
                                for (let dy = y; dy < reqCols + y; dy++) {
                                    if (grid[dx][dy] !== 0) {
                                        canPlace = false;
                                        break;
                                    }
                                }
                                if (!canPlace)
                                    break;
                            }
                            // 如果找到可用位置，直接放置并返回
                            if (canPlace) {
                                // 标记占用
                                for (let dx = x; dx < reqRows + x; dx++) {
                                    for (let dy = y; dy < reqCols + y; dy++) {
                                        grid[dx][dy] = 1;
                                    }
                                }
                                vulcanAPI.debug("放置成功");
                                vulcanAPI.debug(JSON.stringify({
                                    x: x,
                                    y: y,
                                    r: r,
                                    h: piece.h,
                                    v: piece.v,
                                    slot: slotName
                                }, null, 4));
                                return {
                                    x: x,
                                    y: y,
                                    r: r,
                                    h: piece.h,
                                    v: piece.v,
                                    slot: slotName
                                };
                            }
                        }
                    }
                }
            }
            // 所有 slot 和旋转状态都试过了，都放不下
            vulcanAPI.debug("放置失败");
            return null;
        }
        function addLootToContainer(Inv, item, count, bot, randomcount, container) {
            vulcanAPI.debug("开始搜索物品栏");
            //搜索物品栏
            const Container = Inv.find(items => items.slotId == container);
            //常量定义
            const ItemID = vulcanAPI.convertHashID(item);
            const ItemCache = vulcanAPI.getItem(ItemID);
            const ItemName = vulcanAPI.getItemName(ItemCache, "ch");
            const ItemWidth = ItemCache?._props?.Width;
            const ItemHeight = ItemCache?._props?.Height;
            //检查物品栏是否存在, 不存在直接返回
            if (!Container) {
                vulcanAPI.warn(`无法在目标${bot.Info.Settings.Role}身上找到指定容器, 战利品${ItemName}生成失败`);
                return;
            }
            else {
                //定义指定装备栏
                const PocketItem = vulcanAPI.getItem(Container._tpl);
                vulcanAPI.debug("开始搜索容器");
                //提取指定装备栏空间槽位
                var PocketSlots = [];
                var PocketSlotsMap = {};
                //生成索引
                if (PocketItem && PocketItem._props && PocketItem._props.Grids.length > 0) {
                    vulcanAPI.debug("开始生成索引");
                    const PocketGrid = PocketItem._props.Grids;
                    for (var b = 0; b < PocketGrid.length; b++) {
                        const Grids = PocketGrid[b];
                        const Cell = Grids._props;
                        //生成slotId索引
                        //过滤掉大小不够的空间
                        if ((ItemWidth <= Cell.cellsH && ItemHeight <= Cell.cellsV) ||
                            (ItemHeight <= Cell.cellsH && ItemWidth <= Cell.cellsV)) {
                            PocketSlots.push(Grids._name);
                            //生成所有slotId的二维图
                            PocketSlotsMap[Grids._name] = Array.from({ length: Cell.cellsH }, () => new Array(Cell.cellsV).fill(0));
                        }
                    }
                }
                //判断指定装备栏是否存在空间
                if (PocketSlots.length > 0) {
                    vulcanAPI.debug("开始提取物品");
                    //提取所有指定装备栏的物品
                    //使用数组存储布局图
                    const ChildItemMap = [];
                    if (!Inv.some(items => items._tpl == ItemID)) {
                        Inv.filter(items => PocketSlots.includes(items.slotId) && items.parentId == Container._id)
                            .forEach(items => {
                            const tpl = vulcanAPI.getItem(items._tpl);
                            const width = tpl._props.Width;
                            const height = tpl._props.Height;
                            ChildItemMap.push({
                                x: items.location.x,
                                y: items.location.y,
                                r: items.location.r,
                                h: items.location.r == 1 ? height : width,
                                v: items.location.r == 1 ? width : height,
                                slot: items.slotId
                            });
                        });
                        const newItem = {
                            h: ItemCache._props.Width,
                            v: ItemCache._props.Height
                        };
                        const rowData = findPlacement(PocketSlotsMap, ChildItemMap, newItem);
                        if (rowData) {
                            //vulcanAPI.writeFile(`${Config.Global.ModPath}botInvItems1.json`, JSON.stringify({
                            //    map: PocketSlotsMap,
                            //    result: ChildItemMap
                            //}))
                            Inv.push({
                                "_id": vulcanAPI.convertHashID(`item_${bot.Info.Nickname}_${ItemName}_${rowData.slot}_${Date.now()}`),
                                "_tpl": ItemID,
                                "parentId": Container._id,
                                "slotId": rowData.slot,
                                "upd": {
                                    "StackObjectsCount": randomcount != null ? randomInt(randomcount[0], randomcount[1]) : count
                                },
                                "location": {
                                    "x": rowData.x,
                                    "y": rowData.y,
                                    "r": rowData.r
                                }
                            });
                            vulcanAPI.debug(`${ItemName}在${bot.Info.Settings.Role}的${container}上生成成功`);
                        }
                        else {
                            vulcanAPI.warn(`无法在目标${bot.Info.Settings.Role}身上找到可用空位, 战利品${ItemName}生成失败`);
                            return;
                        }
                        return;
                    }
                    else {
                        vulcanAPI.warn(`无法在目标${bot.Info.Settings.Role}身上找到可用空位, 战利品${ItemName}生成失败`);
                        return;
                    }
                    /*
                for (var b = 0; b < PocketSlots.length; b++) {
                    const slotid = PocketSlots[b]
                    if (!Inv.find(items => items.slotId == slotid)) {
                        Inv.push(
                            {
                                "_id": vulcanAPI.convertHashID(`item_${ItemName}_${slotid}_${count}_${Date.now()}`),
                                "_tpl": item,
                                "parentId": Pocket._id,
                                "slotId": slotid,
                                "upd": {
                                    "StackObjectsCount": randomcount != null ? randomInt(randomcount[0], randomcount[1]) : count
                                },
                                "location": {
                                    "x": 0,
                                    "y": 0,
                                    "r": 0
                                }
                            }
                        )
                        return;
                    }
                }
                    */
                }
                vulcanAPI.warn(`无法在目标${bot.Info.Settings.Role}身上找到可用空位, 战利品${ItemName}生成失败`);
                return;
            }
        }
        var DisplayBossList = config_json_1.default.CoreModule.VulcanMod.Config.DogTagGenerate.Config.BossList;
        var DeathStatus = config_json_1.default.CoreModule.VulcanMod.Config.DogTagGenerate.Config.DeathInfo;
        var BossName = "Nikita";
        var BossNickName = bot.Info.Nickname;
        switch (bot.Info.Settings.Role.toLowerCase()) {
            case "bossbully": {
                BossName = "Reshala";
                break;
            }
            case "bossboar": {
                BossName = "Kaban";
                break;
            }
            case "bosskojaniy": {
                BossName = "Shturman";
                break;
            }
            case "bossknight": {
                BossName = bot.Info.Nickname;
                break;
            }
            case "followerbigpipe": {
                BossName = bot.Info.Nickname;
                break;
            }
            case "followerbirdeye": {
                BossName = bot.Info.Nickname;
                break;
            }
            case "bossgluhar": {
                BossName = bot.Info.Nickname == "Ghroth" ? bot.Info.Nickname : bot.Info.Settings.Role.substring(4);
                break;
            }
            case "bosskolontay": {
                BossName = bot.Info.Nickname == "Punisher" ? bot.Info.Nickname : bot.Info.Settings.Role.substring(4);
                break;
            }
            default: {
                BossName = bot.Info.Settings.Role.substring(4);
            }
        }
        const dogtagUpd = {
            SpawnedInSession: true,
            Dogtag: {
                AccountId: bot.sessionId,
                ProfileId: bot._id,
                Nickname: bot.Info.Nickname,
                Side: bot.Info.Side,
                Level: bot.Info.Level,
                Time: (new Date().toISOString()),
                Status: "Killed by ",
                KillerAccountId: "Unknown",
                KillerProfileId: "Unknown",
                KillerName: "Unknown",
                WeaponName: "Unknown",
            },
        };
        const dogtagScavUpd = {
            SpawnedInSession: true,
            Dogtag: {
                AccountId: bot.sessionId,
                ProfileId: bot._id,
                Nickname: russianToLatinApproximation(bot.Info.Nickname),
                Side: bot.Info.Side,
                Level: 80,
                Time: new Date().toISOString(),
                Status: Math.random() <= 0.9 ? "已死亡" : DeathStatus[Math.floor(Math.random() * DeathStatus.length)],
                KillerAccountId: "Unknown",
                KillerProfileId: "Unknown",
                KillerName: "",
                WeaponName: "解析失败",
            },
        };
        const dogtagBossUpd = {
            SpawnedInSession: true,
            Dogtag: {
                AccountId: bot.sessionId,
                ProfileId: bot._id,
                Nickname: BossName,
                Side: "Bear",
                Level: 100,
                Time: getLocalDateTimeString(),
                Status: Math.random() <= 0.9 ? "已死亡" : DeathStatus[Math.floor(Math.random() * DeathStatus.length)],
                KillerAccountId: "Unknown",
                KillerProfileId: "Unknown",
                KillerName: "",
                WeaponName: "解析失败",
            },
        };
        const dogtagSectantUpd = {
            SpawnedInSession: true,
            Dogtag: {
                AccountId: bot.sessionId,
                ProfileId: bot._id,
                Nickname: russianToLatinApproximation(bot.Info.Nickname),
                Side: "Usec",
                Level: 99,
                Time: getLocalDateTimeString(),
                Status: "蒙主召唤",
                KillerAccountId: "Unknown",
                KillerProfileId: "Unknown",
                KillerName: "",
                WeaponName: "解析失败",
            },
        };
        const dogtagAlterUpd = {
            SpawnedInSession: true,
            Dogtag: {
                AccountId: bot.sessionId,
                ProfileId: bot._id,
                Nickname: BossName,
                Side: "Bear",
                Level: 200,
                Time: getLocalDateTimeString(),
                Status: Math.random() <= 0.9 ? "已死亡" : DeathStatus[Math.floor(Math.random() * DeathStatus.length)],
                KillerAccountId: "Unknown",
                KillerProfileId: "Unknown",
                KillerName: "",
                WeaponName: "解析失败",
            },
        };
        const PMCinventoryItem = {
            _id: vulcanAPI.generateHash(`${bot._id}_${bot.Info.Side}_${bot.Info.Nickname}_${Date.now()}`),
            _tpl: botGenerator.getDogtagTplByGameVersionAndSide(bot.Info.Side, bot.Info.GameVersion),
            parentId: bot.Inventory.equipment,
            slotId: "Dogtag",
            location: undefined,
            upd: dogtagUpd,
        };
        const SavageinventoryItem = {
            _id: vulcanAPI.generateHash(`${bot._id}_${bot.Info.Side}_${bot.Info.Nickname}_${Date.now()}`),
            _tpl: "9de06b1142a29d1e6304f410",
            parentId: bot.Inventory.equipment,
            slotId: "Dogtag",
            location: undefined,
            upd: dogtagScavUpd,
        };
        const SectantinventoryItem = {
            _id: vulcanAPI.generateHash(`${bot._id}_${bot.Info.Side}_${bot.Info.Nickname}_${Date.now()}`),
            _tpl: "ba8fc7e6e6bfe9a561372c79",
            parentId: bot.Inventory.equipment,
            slotId: "Dogtag",
            location: undefined,
            upd: dogtagSectantUpd,
        };
        const BossinventoryItem = {
            _id: vulcanAPI.generateHash(`${bot._id}_${bot.Info.Side}_${bot.Info.Nickname}_${Date.now()}`),
            _tpl: vulcanAPI.convertHashID("Boss狗牌"),
            parentId: bot.Inventory.equipment,
            slotId: "Dogtag",
            location: undefined,
            upd: dogtagBossUpd,
        };
        const AlterBossinventoryItem = {
            _id: vulcanAPI.generateHash(`${bot._id}_${bot.Info.Side}_${bot.Info.Nickname}_${Date.now()}`),
            _tpl: vulcanAPI.convertHashID("水晶狗牌_红"),
            parentId: bot.Inventory.equipment,
            slotId: "Dogtag",
            location: undefined,
            upd: dogtagAlterUpd,
        };
        if (DisplayBossList.includes(bot.Info.Settings.Role.toLowerCase())) {
            const AlterList = [
                "Dullahan",
                "Golyat",
                "Argus",
                "Sanitar",
                "Ghroth",
                "Punisher"
            ];
            if (AlterList.includes(BossNickName)) {
                bot.Inventory.items.push(AlterBossinventoryItem);
                if (!bot.Inventory.items.some(items => items._tpl == vulcanAPI.convertHashID("封装英雄之证"))) {
                    addLootToContainer(bot.Inventory.items, "封装英雄之证", 1, bot, null, "Pockets");
                    bot.Inventory.items.forEach(botitems => {
                        if ((botitems?.slotId == "FirstPrimaryWeapon"
                            || botitems?.slotId == "SecondPrimaryWeapon"
                            || botitems?.slotId == "Holster")
                            && botitems?.upd?.Repairable?.Durability
                            && botitems?.upd?.Repairable?.MaxDurability) {
                            botitems.upd.Repairable.Durability = 100;
                            botitems.upd.Repairable.MaxDurability = 100;
                        }
                    });
                }
                //this.botInvCache.push(bot.Inventory.items)
                //vulcanAPI.writeFile(`${Config.Global.ModPath}exportInventory.json`, JSON.stringify(this.botInvCache))
            }
            else if (BossNickName == "Sanitar") {
                //bot.Inventory.items.push(AlterBossinventoryItem);
                //addLootToContainer(bot.Inventory.items, "封装英雄之证", 1, bot, null, "Backpack")
            }
            else {
                bot.Inventory.items.push(BossinventoryItem);
            }
            if (bot.Info.Settings.Role.toLowerCase() == "bossbully") {
                if (!bot.Inventory.items.some(items => items._tpl == vulcanAPI.convertHashID("宿舍管理员钥匙"))) {
                    addLootToContainer(bot.Inventory.items, "宿舍管理员钥匙", 1, bot, null, "Pockets");
                }
            }
            if (bot.Info.Settings.Role.toLowerCase() == "bosssanitar") {
                if (!bot.Inventory.items.some(items => items._tpl == vulcanAPI.convertHashID("疗养院管理员钥匙"))) {
                    addLootToContainer(bot.Inventory.items, "疗养院管理员钥匙", 1, bot, null, "Backpack");
                }
            }
            if (bot.Info.Settings.Role.toLowerCase() == "bossgluhar") {
                if (!bot.Inventory.items.some(items => items._tpl == vulcanAPI.convertHashID("储备站管理员钥匙"))) {
                    addLootToContainer(bot.Inventory.items, "储备站管理员钥匙", 1, bot, null, "Pockets");
                }
            }
            if (bot.Info.Settings.Role.toLowerCase() == "bosstagilla") {
                if (!bot.Inventory.items.some(items => items._tpl == vulcanAPI.convertHashID("仿制工厂钥匙"))) {
                    addLootToContainer(bot.Inventory.items, "仿制工厂钥匙", 1, bot, null, "Pockets");
                }
            }
        }
        else if (bot.Info.Settings.Role.toLowerCase().includes("sectant")) {
            //console.log(bot.Info.Settings.Role.toLowerCase())
            bot.Inventory.items.push(SectantinventoryItem);
        }
        else {
            switch (bot.Info.Side) {
                case "Usec": {
                    bot.Inventory.items.push(PMCinventoryItem);
                    break;
                }
                case "Bear": {
                    bot.Inventory.items.push(PMCinventoryItem);
                    break;
                }
                case "Savage": {
                    bot.Inventory.items.push(SavageinventoryItem);
                    break;
                }
                default: {
                    bot.Inventory.items.push(SavageinventoryItem);
                    break;
                }
            }
        }
        if (bot.Info.Settings.Role.toLowerCase() == "sectantpriest") {
            //console.log("priest")
            if (!bot.Inventory.items.some(items => items._tpl == vulcanAPI.convertHashID("通用符号钥匙"))) {
                //console.log("start")
                addLootToContainer(bot.Inventory.items, "通用符号钥匙", 1, bot, null, "Pockets");
            }
        }
    }
    cultistCounter = {
        chance: 0,
        count: 0,
        pipecount: 0,
        eyescount: 0,
        access: false,
        knight: false,
        pipe: false,
        eyes: false
    };
    sanitarCounter = {
        chance: 0,
        count: 0,
        access: false
    };
    gluharCounter = {
        chance: 0,
        count: 0,
        access: false
    };
    kolontayCounter = {
        chance: 0,
        count: 0,
        access: false
    };
    customBotGenerator(sessionId, bot, botJsonTemplate, botGenerationDetails) {
        const botGenerator = Mod.container.resolve("BotGenerator");
        const vulcanAPI = Mod.container.resolve("VulcanCommon");
        //
        const requestbody = {
            "sessionId": sessionId,
            "bot": bot,
            "botJsonTemplate": botJsonTemplate,
            "botGenerationDetails": botGenerationDetails
        };
        // 将角色名称统一转换为小写格式
        var botRoleLowercase = botGenerationDetails.role.toLowerCase();
        //自定义数据
        const customBotData = bosskillacopy_json_1.default;
        const alterSanitar = Sanitar_json_1.default;
        const alterGluhar = Gluhar_json_1.default;
        const alterKolontay = Kolontay_json_1.default;
        const dullahan = Knight_json_1.default;
        const golyat = BigPipe_json_1.default;
        const argus = Birdeye_json_1.default;
        const arrowCfg = config_json_1.default.BattleModule.ArrowMarker;
        const musicCfg = config_json_1.default.ItemModule.Music;
        const invStr = arrowCfg.Config.EnableLootableMode ? "Earpiece" : "ArmBand";
        const music = equipdata_json_1.default;
        const vulcanCfg = config_json_1.default.CoreModule.VulcanMod;
        //测一下邪教徒
        const generateData = this.cultistCounter;
        const sanitarData = this.sanitarCounter;
        const gluharData = this.gluharCounter;
        const kolontayData = this.kolontayCounter;
        if (vulcanCfg.Config.BotEdit.AlterBoss.Active) {
            if (botRoleLowercase == "bossknight") {
                vulcanAPI.debug("Knight");
                vulcanAPI.debug(`ChanceStart: ${generateData.chance}`);
                if (generateData.chance == 0) {
                    generateData.chance = Math.floor(Math.random() * 100);
                    vulcanAPI.debug(`ChanceNow: ${generateData.chance}`);
                }
                if (generateData.chance <= vulcanCfg.Config.BotEdit.AlterBoss.Chance.Goons) {
                    generateData.access = true;
                }
                else {
                    vulcanAPI.debug("未能转化黑暗Boss");
                }
                if (generateData.access) {
                    vulcanAPI.debug("开始尝试生成自定义Boss");
                    //botGenerationDetails.role = "sectantOni"
                    botGenerationDetails.robotCountToGeneratele = 1;
                    botRoleLowercase = botGenerationDetails.role.toLowerCase();
                    //bot.Info.Settings.Role = "sectantOni"
                    botJsonTemplate.appearance = dullahan.appearance;
                    botJsonTemplate.experience = dullahan.experience;
                    botJsonTemplate.health = dullahan.health;
                    botJsonTemplate.skills = dullahan.skills;
                    botJsonTemplate.inventory = dullahan.inventory;
                    botJsonTemplate.firstName = dullahan.firstName;
                    botJsonTemplate.chances = dullahan.chances;
                    botJsonTemplate.generation = dullahan.generation;
                    const bot = botJsonTemplate;
                    const marker = arrowCfg.Config.Global.MarkerData.find(data => data.bot.includes(botRoleLowercase));
                    if (marker) {
                        bot.inventory.equipment[invStr] = {};
                        bot.chances.equipment[invStr] = 100;
                        bot.inventory.equipment[invStr][vulcanAPI.convertHashID(arrowCfg.Config.EnableSpecialMarker ? marker.special : marker.mark)] = 100;
                    }
                    if (musicCfg.Active) {
                        bot.chances.equipment.Earpiece = 100;
                        bot.inventory.equipment.Earpiece = {
                            a1b856345e7bc8bce357eea0: 1
                        };
                    }
                    generateData.knight = true;
                    vulcanAPI.debug("黑暗骑士转化成功");
                    vulcanAPI.debug("数据处理完毕");
                }
                generateData.count++;
                vulcanAPI.debug(`TyiedCount: ${generateData.count}`);
                if (generateData.count >= 5 && generateData.knight != true) {
                    generateData.count = 0;
                    generateData.chance = 0;
                    generateData.access = false;
                    generateData.knight = false;
                    generateData.pipe = false;
                    generateData.eyes = false;
                    vulcanAPI.debug("未能转化为黑暗Boss");
                    vulcanAPI.debug("配置文件已复位(未生成)");
                    vulcanAPI.debug(JSON.stringify(generateData, null, 4));
                }
                if (generateData.count >= 5 && generateData.knight) {
                    vulcanAPI.debug("黑暗Boss转化成功");
                    vulcanAPI.debug(JSON.stringify(generateData, null, 4));
                }
            }
            if (botRoleLowercase == "followerbigpipe") {
                vulcanAPI.debug("Big Pipe");
                if (generateData.access) {
                    botGenerationDetails.robotCountToGeneratele = 1;
                    botRoleLowercase = botGenerationDetails.role.toLowerCase();
                    //bot.Info.Settings.Role = "sectantOni"
                    botJsonTemplate.appearance = golyat.appearance;
                    botJsonTemplate.experience = golyat.experience;
                    botJsonTemplate.health = golyat.health;
                    botJsonTemplate.skills = golyat.skills;
                    botJsonTemplate.inventory = golyat.inventory;
                    botJsonTemplate.chances = golyat.chances;
                    botJsonTemplate.firstName = golyat.firstName;
                    botJsonTemplate.lastName = golyat.lastName;
                    botJsonTemplate.generation = golyat.generation;
                    generateData.pipecount++;
                    const marker = arrowCfg.Config.Global.MarkerData.find(data => data.bot.includes(botRoleLowercase));
                    if (marker) {
                        const bot = botJsonTemplate;
                        bot.inventory.equipment[invStr] = {};
                        bot.chances.equipment[invStr] = 100;
                        bot.inventory.equipment[invStr][vulcanAPI.convertHashID(arrowCfg.Config.EnableSpecialMarker ? marker.special : marker.mark)] = 100;
                    }
                    generateData.pipe = true;
                    vulcanAPI.debug("开始尝试生成黑暗BigPipe");
                }
            }
            if (botRoleLowercase == "followerbirdeye") {
                vulcanAPI.debug("Birdeye");
                if (generateData.access) {
                    botGenerationDetails.robotCountToGeneratele = 1;
                    botRoleLowercase = botGenerationDetails.role.toLowerCase();
                    //bot.Info.Settings.Role = "sectantOni"
                    botJsonTemplate.appearance = argus.appearance;
                    botJsonTemplate.experience = argus.experience;
                    botJsonTemplate.health = argus.health;
                    botJsonTemplate.skills = argus.skills;
                    botJsonTemplate.inventory = argus.inventory;
                    botJsonTemplate.chances = argus.chances;
                    botJsonTemplate.firstName = argus.firstName;
                    botJsonTemplate.generation = argus.generation;
                    generateData.eyescount++;
                    const marker = arrowCfg.Config.Global.MarkerData.find(data => data.bot.includes(botRoleLowercase));
                    if (marker) {
                        const bot = botJsonTemplate;
                        bot.inventory.equipment[invStr] = {};
                        bot.chances.equipment[invStr] = 100;
                        bot.inventory.equipment[invStr][vulcanAPI.convertHashID(arrowCfg.Config.EnableSpecialMarker ? marker.special : marker.mark)] = 100;
                    }
                    generateData.eyes = true;
                    vulcanAPI.debug("开始尝试生成黑暗Birdeye");
                }
                if (generateData.eyescount >= 5 && generateData.eyes) {
                    generateData.count = 0;
                    generateData.pipecount = 0;
                    generateData.eyescount = 0;
                    generateData.chance = 0;
                    generateData.access = false;
                    generateData.knight = false;
                    generateData.pipe = false;
                    generateData.eyes = false;
                    vulcanAPI.debug("配置文件已复位(生成成功)");
                    //vulcanAPI.error("警告，侦测到异格Boss Dullahan")
                    vulcanAPI.debug(JSON.stringify(generateData, null, 4));
                }
            }
            if (botRoleLowercase == "bosssanitar") {
                vulcanAPI.debug("Sanitar");
                if (sanitarData.chance == 0) {
                    sanitarData.chance = Math.floor(Math.random() * 100);
                    vulcanAPI.debug(`ChanceNow: ${sanitarData.chance}`);
                }
                if (sanitarData.chance <= vulcanCfg.Config.BotEdit.AlterBoss.Chance.Sanitar) {
                    sanitarData.access = true;
                }
                else {
                    vulcanAPI.debug("未能转化异格Sanitar");
                }
                if (sanitarData.access) {
                    botGenerationDetails.robotCountToGeneratele = 1;
                    botRoleLowercase = botGenerationDetails.role.toLowerCase();
                    //bot.Info.Settings.Role = "sectantOni"
                    botJsonTemplate.appearance = alterSanitar.appearance;
                    botJsonTemplate.experience = alterSanitar.experience;
                    botJsonTemplate.health = alterSanitar.health;
                    botJsonTemplate.skills = alterSanitar.skills;
                    botJsonTemplate.inventory = alterSanitar.inventory;
                    botJsonTemplate.chances = alterSanitar.chances;
                    botJsonTemplate.firstName = alterSanitar.firstName;
                    botJsonTemplate.generation = alterSanitar.generation;
                    sanitarData.count++;
                    const bot = botJsonTemplate;
                    const musictpl = Object.values(music).find(musics => musics.botlist.includes(botRoleLowercase)).equiplist;
                    const marker = arrowCfg.Config.Global.MarkerData.find(data => data.bot.includes(botRoleLowercase));
                    if (marker) {
                        bot.inventory.equipment[invStr] = {};
                        bot.chances.equipment[invStr] = 100;
                        bot.inventory.equipment[invStr][vulcanAPI.convertHashID(arrowCfg.Config.EnableSpecialMarker ? marker.special : marker.mark)] = 100;
                    }
                    if (musicCfg.Active) {
                        if (musictpl) {
                            for (let e in musictpl) {
                                const tpl = vulcanAPI.convertHashID(e);
                                bot.inventory.equipment.Earpiece[tpl] = musictpl[e];
                            }
                        }
                    }
                    vulcanAPI.debug("开始尝试生成异格Sanitar");
                }
                if (sanitarData.count >= 5) {
                    sanitarData.chance = 0;
                    sanitarData.count = 0;
                    sanitarData.access = false;
                    vulcanAPI.debug("配置文件已复位(生成成功)");
                    //vulcanAPI.error("警告，侦测到异格Boss Dullahan")
                    vulcanAPI.debug(JSON.stringify(generateData, null, 4));
                }
            }
            if (botRoleLowercase == "bossgluhar") {
                vulcanAPI.debug("Gluhar");
                if (gluharData.chance == 0) {
                    gluharData.chance = Math.floor(Math.random() * 100);
                    vulcanAPI.debug(`ChanceNow: ${gluharData.chance}`);
                }
                if (gluharData.chance <= vulcanCfg.Config.BotEdit.AlterBoss.Chance.Gluhar) {
                    gluharData.access = true;
                }
                else {
                    vulcanAPI.debug("未能转化异格Gluhar");
                }
                if (gluharData.access) {
                    botGenerationDetails.robotCountToGeneratele = 1;
                    botRoleLowercase = botGenerationDetails.role.toLowerCase();
                    //bot.Info.Settings.Role = "sectantOni"
                    botJsonTemplate.appearance = alterGluhar.appearance;
                    botJsonTemplate.experience = alterGluhar.experience;
                    botJsonTemplate.health = alterGluhar.health;
                    botJsonTemplate.skills = alterGluhar.skills;
                    botJsonTemplate.inventory = alterGluhar.inventory;
                    botJsonTemplate.chances = alterGluhar.chances;
                    botJsonTemplate.firstName = alterGluhar.firstName;
                    botJsonTemplate.generation = alterGluhar.generation;
                    gluharData.count++;
                    const bot = botJsonTemplate;
                    const musictpl = Object.values(music).find(musics => musics.botlist.includes(botRoleLowercase)).equiplist;
                    const marker = arrowCfg.Config.Global.MarkerData.find(data => data.bot.includes(botRoleLowercase));
                    if (marker) {
                        bot.inventory.equipment[invStr] = {};
                        bot.chances.equipment[invStr] = 100;
                        bot.inventory.equipment[invStr][vulcanAPI.convertHashID(arrowCfg.Config.EnableSpecialMarker ? marker.special : marker.mark)] = 100;
                    }
                    if (musicCfg.Active) {
                        if (musictpl) {
                            for (let e in musictpl) {
                                const tpl = vulcanAPI.convertHashID(e);
                                bot.inventory.equipment.Earpiece[tpl] = musictpl[e];
                            }
                        }
                    }
                    vulcanAPI.debug("开始尝试生成异格Gluhar");
                }
                if (gluharData.count >= 5) {
                    gluharData.chance = 0;
                    gluharData.count = 0;
                    gluharData.access = false;
                    vulcanAPI.debug("配置文件已复位(生成成功)");
                    //vulcanAPI.error("警告，侦测到异格Boss Dullahan")
                    vulcanAPI.debug(JSON.stringify(generateData, null, 4));
                }
            }
            if (botRoleLowercase == "bosskolontay") {
                vulcanAPI.debug("Kolontay");
                if (kolontayData.chance == 0) {
                    kolontayData.chance = Math.floor(Math.random() * 100);
                    vulcanAPI.debug(`ChanceNow: ${kolontayData.chance}`);
                }
                if (kolontayData.chance <= vulcanCfg.Config.BotEdit.AlterBoss.Chance.Kolontay) {
                    kolontayData.access = true;
                }
                else {
                    vulcanAPI.debug("未能转化异格Kolontay");
                }
                if (kolontayData.access) {
                    botGenerationDetails.robotCountToGeneratele = 1;
                    botRoleLowercase = botGenerationDetails.role.toLowerCase();
                    //bot.Info.Settings.Role = "sectantOni"
                    botJsonTemplate.appearance = alterKolontay.appearance;
                    botJsonTemplate.experience = alterKolontay.experience;
                    botJsonTemplate.health = alterKolontay.health;
                    botJsonTemplate.skills = alterKolontay.skills;
                    botJsonTemplate.inventory = alterKolontay.inventory;
                    botJsonTemplate.chances = alterKolontay.chances;
                    botJsonTemplate.firstName = alterKolontay.firstName;
                    botJsonTemplate.generation = alterKolontay.generation;
                    kolontayData.count++;
                    const bot = botJsonTemplate;
                    //const musictpl = Object.values(music).find(musics => musics.botlist.includes(botRoleLowercase)).equiplist
                    const marker = arrowCfg.Config.Global.MarkerData.find(data => data.bot.includes(botRoleLowercase));
                    if (marker) {
                        bot.inventory.equipment[invStr] = {};
                        bot.chances.equipment[invStr] = 100;
                        bot.inventory.equipment[invStr][vulcanAPI.convertHashID(arrowCfg.Config.EnableSpecialMarker ? marker.special : marker.mark)] = 100;
                    }
                    if (musicCfg.Active) {
                        bot.chances.equipment.Earpiece = 100;
                        bot.inventory.equipment.Earpiece = {
                            a1b856345e7bc8bce357eea0: 1
                        };
                    }
                    vulcanAPI.debug("开始尝试生成异格Kolontay");
                }
                if (kolontayData.count >= 5) {
                    kolontayData.chance = 0;
                    kolontayData.count = 0;
                    kolontayData.access = false;
                    vulcanAPI.debug("配置文件已复位(生成成功)");
                    //vulcanAPI.error("警告，侦测到异格Boss Dullahan")
                    vulcanAPI.debug(JSON.stringify(generateData, null, 4));
                }
            }
        }
        // 生成Bot等级数据（经验值/等级）
        const botLevel = botGenerator.botLevelGenerator.generateBotLevel(botJsonTemplate.experience.level, botGenerationDetails, bot);
        // 仅处理NPC装备过滤（玩家Scav不处理）
        if (!botGenerationDetails.isPlayerScav) {
            botGenerator.botEquipmentFilterService.filterBotEquipment(sessionId, botJsonTemplate, botLevel.level, botGenerationDetails);
        }
        // 生成唯一Bot昵称（特定角色需要唯一名称）
        bot.Info.Nickname = botGenerator.botNameService.generateUniqueBotNickname(botJsonTemplate, botGenerationDetails, botRoleLowercase, botGenerator.botConfig.botRolesThatMustHaveUniqueName);
        // 处理玩家Scav的模拟逻辑（非真实玩家Scav）
        if (!botGenerationDetails.isPlayerScav && botGenerator.shouldSimulatePlayerScav(botRoleLowercase)) {
            // 添加随机PMC名称到主配置
            botGenerator.botNameService.addRandomPmcNameToBotMainProfileNicknameProperty(bot);
            // 设置随机游戏版本和分类
            botGenerator.setRandomisedGameVersionAndCategory(bot.Info);
        }
        // 圣诞节活动相关处理
        if (!botGenerator.seasonalEventService.christmasEventEnabled()) {
            // 除gifter外移除圣诞物品
            if (botGenerationDetails.role !== "gifter") {
                botGenerator.seasonalEventService.removeChristmasItemsFromBotInventory(botJsonTemplate.inventory, botGenerationDetails.role);
            }
        }
        // 移除黑名单中的战利品
        botGenerator.removeBlacklistedLootFromBotTemplate(botJsonTemplate.inventory);
        // 非PMC/玩家Scav清除藏身处数据
        if (!(botGenerationDetails.isPmc || botGenerationDetails.isPlayerScav)) {
            bot.Hideout = undefined;
        }
        // 设置经验相关属性
        bot.Info.Experience = botLevel.exp;
        bot.Info.Level = botLevel.level;
        bot.Info.Settings.Experience = botGenerator.getExperienceRewardForKillByDifficulty(botJsonTemplate.experience.reward, botGenerationDetails.botDifficulty, botGenerationDetails.role);
        bot.Info.Settings.StandingForKill = botGenerator.getStandingChangeForKillByDifficulty(botJsonTemplate.experience.standingForKill, botGenerationDetails.botDifficulty, botGenerationDetails.role);
        bot.Info.Settings.AggressorBonus = botGenerator.getAgressorBonusByDifficulty(botJsonTemplate.experience.standingForKill, botGenerationDetails.botDifficulty, botGenerationDetails.role);
        bot.Info.Settings.UseSimpleAnimator = botJsonTemplate.experience.useSimpleAnimator ?? false;
        // 随机选择语音类型
        bot.Info.Voice = botGenerator.weightedRandomHelper.getWeightedValue(botJsonTemplate.appearance.voice);
        // 生成生命值配置
        bot.Health = botGenerator.generateHealth(botJsonTemplate.health, botGenerationDetails.isPlayerScav);
        // 生成技能配置（类型转换需后续优化）
        bot.Skills = botGenerator.generateSkills(botJsonTemplate.skills);
        // PMC特殊处理
        if (botGenerationDetails.isPmc) {
            // 启用streamer模式标记
            bot.Info.IsStreamerModeAvailable = true;
            // 设置随机游戏版本
            botGenerator.setRandomisedGameVersionAndCategory(bot.Info);
            // UNHEARD版本特殊处理
            if (bot.Info.GameVersion === GameEditions_1.GameEditions.UNHEARD) {
                botGenerator.addAdditionalPocketLootWeightsForUnheardBot(botJsonTemplate);
            }
        }
        // 设置外观配置
        botGenerator.setBotAppearance(bot, botJsonTemplate.appearance, botGenerationDetails);
        // 过滤黑名单装备
        botGenerator.filterBlacklistedGear(botJsonTemplate, botGenerationDetails);
        // 生成完整库存（装备/物品）
        bot.Inventory = botGenerator.botInventoryGenerator.generateInventory(sessionId, botJsonTemplate, botRoleLowercase, botGenerationDetails.isPmc, botLevel.level, bot.Info.GameVersion);
        // 添加狗牌（特定角色需要）
        if (botGenerator.botConfig.botRolesWithDogTags.includes(botRoleLowercase)) {
            botGenerator.addDogtagToBot(bot);
        }
        // 生成唯一标识符
        botGenerator.addIdsToBot(bot); // 生成新Bot ID
        botGenerator.generateInventoryId(bot); // 生成新库存ID
        // 还原事件角色设置
        if (botGenerationDetails.eventRole) {
            bot.Info.Settings.Role = botGenerationDetails.eventRole;
        }
        //vulcanAPI.debug("generate complete")
        //vulcanAPI.writeFile(`${Config.Global.ModPath}requestdata.json`, JSON.stringify(requestbody))
        return bot;
    }
}
module.exports = { mod: new Mod() };
//# sourceMappingURL=mod.js.map