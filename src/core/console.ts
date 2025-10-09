import { DependencyContainer } from "tsyringe";
import crypto from "crypto";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { ErrorHandler } from "@spt/ErrorHandler";
//import { CustomErrorHandler } from "../core/test"
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { DialogueHelper } from "@spt/helpers/DialogueHelper";
import { IPostSptLoadMod } from "@spt/models/external/IPostSptLoadMod";
import type { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ImageRouter } from "@spt/routers/ImageRouter";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { PlayerService } from "@spt/services/PlayerService";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { ITraderConfig, UpdateTime } from "@spt/models/spt/config/ITraderConfig";
import { MatchController } from "@spt/controllers/MatchController";
import { HealthController } from "@spt/controllers/HealthController";
import { InraidController } from "@spt/controllers/InraidController";
import { IModLoader } from "@spt/models/spt/mod/IModLoader";
import { PreSptModLoader } from "@spt/loaders/PreSptModLoader";
import { JsonUtil } from "@spt/utils/JsonUtil";
import { Traders } from "@spt/models/enums/Traders";
import { QuestStatus } from "@spt/models/enums/QuestStatus";
import { MessageType } from "@spt/models/enums/MessageType";
import { HashUtil } from "@spt/utils/HashUtil";
import { SaveServer } from "@spt/servers/SaveServer"
import { ProfileHelper } from "@spt/helpers/ProfileHelper";
import { QuestHelper } from "@spt/helpers/QuestHelper";
import { MailSendService } from "@spt/services/MailSendService"
import { NotificationSendHelper } from "@spt/helpers/NotificationSendHelper";
import { NotifierHelper } from "@spt/helpers/NotifierHelper";
import { ImporterUtil } from "@spt/utils/ImporterUtil"
import { BundleLoader } from "@spt/loaders/BundleLoader";
import { HealthHelper } from "@spt/helpers/HealthHelper";
import { VulcanCommon } from "../../../[火神之心]VulcanCore/src/vulcan-api/Common";
import { IQuestConfig } from "@spt/models/spt/config/IQuestConfig";
import Config from "../../config.json";

//

export const initConsole = (container: DependencyContainer) => {
    const vulcanAPI = container.resolve<VulcanCommon>("VulcanCommon")
    const logger = container.resolve<ILogger>("WinstonLogger");
    const preSptModLoader = container.resolve("PreSptModLoader");
    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
    const jsonUtil = container.resolve<JsonUtil>("JsonUtil");
    const clientDB = databaseServer.getTables();
    const AllItems = clientDB.templates.items;
    const Locale = clientDB.locales.global["ch"]
    const ELocale = clientDB.locales.global["en"]
    const modPath = Config.Global.ModPath
    const modDBPath = `${modPath}${Config.CoreModule.Console.Global.ModPath}`
    const modDB = vulcanAPI.loadRecursive(`${modDBPath}`)

    const profileHelper = container.resolve<ProfileHelper>("ProfileHelper");
    //const errorHandler = container.resolve<ErrorHandler>("ErrorHandler");
    //const customErrorHandler = new CustomErrorHandler();
    const questHelper = container.resolve<QuestHelper>("QuestHelper");
    const diaoluehelper = container.resolve<DialogueHelper>("DialogueHelper")
    const healthController = container.resolve<HealthController>("HealthController")
    const saveServer = container.resolve<SaveServer>("SaveServer");
    const mailSendService = container.resolve<MailSendService>("MailSendService");
    const matchController = container.resolve<MatchController>("MatchController");
    const inRaidController = container.resolve<InraidController>("InraidController");
    const playerService = container.resolve<PlayerService>("PlayerService");
    const readline = require('readline');
    //const playerlist = vulcanAPI.deserialize(vulcanAPI.readFile(`${modDBPath}玩家索引表.json`));
    //const itemlist = vulcanAPI.deserialize(vulcanAPI.readFile(`${modDBPath}物品索引表.json`));
    //const skilllist = vulcanAPI.deserialize(vulcanAPI.readFile(`${modDBPath}技能索引表.json`));
    //const questlist = vulcanAPI.deserialize(vulcanAPI.readFile(`${modDBPath}任务索引表.json`));
    Locale["4f99e88e87b6f0b04f5ac689"] = "由控制台发送的物品"
    const ClientItems = clientDB.templates.items
    const levelMap = clientDB.globals.config.exp.level.exp_table
    process.stdin.setEncoding('utf-8');
    process.stdout.setEncoding('utf-8');
    vulcanAPI.access("启动核心系统: 塔科夫控制台")
    vulcanAPI.log("控制中心上线，正在加载指令集……")
    vulcanAPI.waitForTime(2)


    const https = require('https');

    function fetchData() {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.example.com',
                path: '/data',
                method: 'GET'
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    resolve(JSON.parse(data));
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.end();
        });
    }

    fetchData()
        .then(data => {
        })
        .catch(error => {
            vulcanAPI.log("在服务端输入help查询帮助")

        });


    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false // 禁用终端模式
    });
    //process.stdin.setRawMode(true)
    //process.stdout.write('\x1b[8m');



    rl.on('line', (input) => {
        // 修正后的正则表达式，过滤ANSI控制序列及特殊字符
        const filteredInput = input.replace(/\u001b\[[ABCD]|\u001b\[[0-9;]*[A-Za-z]|[\u007f\t\r\n]/g, '');
        let processed = input.replace(/.\x08/g, '');
        let processed2 = '';
        for (let i = 0; i < input.length; i++) {
            if (input[i] === '\b') {
                // 遇到退格键，删除 processed 的最后一个字符（如果有）
                processed2 = processed2.slice(0, -1);
            } else {
                processed2 += input[i];
            }
        }
        const [command, ...params] = processed2.split(' ');
        //console.log(`接收到1：${input}`);
        //console.log(`接收到2：${processed}`);
        //console.log(`接收到3：${processed2}`);
        //console.log('Listeners on stdin:', process.stdin.listenerCount('data'));

        switch (command) {
            case 'give':
                addItem(params);
                break;
            case 'additemgroup':
                //handleAddItemGroupCommand(params);
                break;
            case 'playerlist':
                Playerlist();
                break;
            case 'questlist':
                writeQuestlist();
                break;
            case 'itemlist':
                writeItemList();
                break;
            case 'start':
                startQuest(params);
                break;
            case 'finish':
                completeQuest(params);
                break;
            case 'quest':
                quest(params);
                break;
            case 'help':
                help();
                break;
            case 'endraid':
                //callEndRaid(params);
                break;
            case 'skill':
                setSkill(params);
                break;
            case 'level':
                //setLevel(params);
                break;
            case 'exp':
                editExp(params);
                break;
            case 'cwp':
                convertWeaponPreset(params);
                break;
            case 'qexport':
                quickExport(params);
                break;
            case 'exit':
                vulcanAPI.log('程序即将退出');
                rl.close();
                break;
            default:
                vulcanAPI.log('未知命令');
                break;
        }

        rl.prompt(); // 清空输入缓冲区并重新显示提示符
    });

    //vulcanAPI.log(JSON.stringify(saveServer.getProfiles(), null, 4))
    //vulcanAPI.log(getPlayer("test2"))
    //vulcanAPI.log(getItem(103))
    function callEndRaid(params) {
        if (params.length !== 1) {
            vulcanAPI.log('endraid命令需要1个参数!');
            return;
        }
        const [player] = params;
        vulcanAPI.log(getPlayer(player))
        inRaidController.savePostRaidProgress(
            {
                "exit": "survived",
                "profile": saveServer.getProfile(getPlayer(player)).characters.pmc,
                "isPlayerScav": false,
                "health": getHealth(getPlayer(player)),
                "insurance": []
            },
            getPlayer(player));
        vulcanAPI.log(getPlayer(player))
        vulcanAPI.log("callRaidEndSuccessful.")
    }
    function getHealth(player) {
        const Profile = saveServer.getProfile(getPlayer(player)).characters.pmc
        var Health = {
            "Health": {
                "Head": {
                    "Maximum": Profile.Health.BodyParts.Head.Maximum,
                    "Current": Profile.Health.BodyParts.Head.Current,
                    "Effects": {}
                },
                "LeftArm": {
                    "Maximum": Profile.Health.BodyParts.LeftArm.Maximum,
                    "Current": Profile.Health.BodyParts.LeftArm.Current,
                    "Effects": {}
                },
                "LeftLeg": {
                    "Maximum": Profile.Health.BodyParts.LeftLeg.Maximum,
                    "Current": Profile.Health.BodyParts.LeftLeg.Current,
                    "Effects": {}
                },
                "RightArm": {
                    "Maximum": Profile.Health.BodyParts.RightArm.Maximum,
                    "Current": Profile.Health.BodyParts.RightArm.Current,
                    "Effects": {}
                },
                "RightLeg": {
                    "Maximum": Profile.Health.BodyParts.RightLeg.Maximum,
                    "Current": Profile.Health.BodyParts.RightLeg.Current,
                    "Effects": {}
                },
                "Stomach": {
                    "Maximum": Profile.Health.BodyParts.Stomach.Maximum,
                    "Current": Profile.Health.BodyParts.Stomach.Current,
                    "Effects": {}
                }
            },
            "IsAlive": true,
            "Hydration": Profile.Health.Hydration.Current,
            "Energy": Profile.Health.Energy.Current,
            "Temperature": Profile.Health.Temperature.Current
        }
        return Health
    }
    // 处理additem命令
    function addItem(params) {
        if (params.length !== 3) {
            vulcanAPI.log('give命令需要3个参数!');
            return;
        }
        const [player, itemId, quantity] = params;
        if (player == "@a") {
            for (let pl in vulcanAPI.deserialize(vulcanAPI.readFile(`${modDBPath}玩家索引表.json`))) {
                handleAddItemCommand([pl, itemId, quantity])
            }
        }
        else {
            handleAddItemCommand(params)
        }
    }
    function handleAddItemCommand(params) {
        if (params.length !== 3) {
            vulcanAPI.log('give命令需要3个参数!');
            return;
        }
        const [player, itemId, quantity] = params;
        var CacheItemID = getItem(itemId)
        var CachePlayerID = getPlayer(player)
        if (getItemName(CacheItemID) != null) {
            if (CachePlayerID != undefined && saveServer.getProfile(CachePlayerID).characters.pmc.Info.Nickname != undefined) {
                if (createItemArr(CacheItemID, quantity).length > 0) {
                    mailSendService.sendLocalisedSystemMessageToPlayer(
                        CachePlayerID,
                        "4f99e88e87b6f0b04f5ac689",
                        createItemArr(CacheItemID, quantity),
                        [],
                        2592000
                    )

                    //vulcanAPI.writeFile(`${modDBPath}giveexport.json`, JSON.stringify(createItemArr(CacheItemID, quantity), null, 4))
                    vulcanAPI.log('执行give命令');
                    vulcanAPI.log('玩家ID:' + CachePlayerID);
                    vulcanAPI.log('玩家名:' + saveServer.getProfile(CachePlayerID).characters.pmc.Info.Nickname);
                    vulcanAPI.log('物品ID:' + CacheItemID);
                    vulcanAPI.log('物品名:' + getItemShortName(CacheItemID) + " / " + getItemEShortName(CacheItemID))
                    vulcanAPI.log('物品全名:' + getItemName(CacheItemID) + " / " + getItemEName(CacheItemID))
                    vulcanAPI.log('物品数量:' + quantity);
                    vulcanAPI.log("物品发送成功")
                    //vulcanAPI.log(createItemArr(CacheItemID, quantity))
                }
            }
            else {
                vulcanAPI.log("玩家不存在,请检查索引表!")
            }
        }
        else {
            vulcanAPI.log("物品不存在或ID错误,请检查索引表!")
        }
        // 在这里执行additem命令的逻辑

    }
    function convertArrayToObject(array) {
        const mod = {};

        // 遍历数组中的每个成员
        array.forEach(member => {
            const { _id, _tpl, parentId, slotId } = member;

            // 如果成员是武器本体，则跳过
            if (parentId === undefined) {
                return;
            }

            // 获取父成员的 _tpl 属性值
            const parentTpl = array.find(item => item._id === parentId)._tpl;

            // 创建 mod 对象的键名
            const stringId = parentTpl || _tpl;

            // 如果 mod 对象中不存在该键，则初始化为空对象
            if (!mod[stringId]) {
                mod[stringId] = {};
            }

            // 获取 mod 对象的子对象
            const modObject = mod[stringId];

            // 如果 mod 对象的子对象中不存在该键名，则初始化为空数组
            if (!modObject[slotId]) {
                modObject[slotId] = [];
            }

            // 将当前成员的 _tpl 属性值添加到 mod 对象的子对象中
            modObject[slotId].push(_tpl);
        });

        return mod;

    }
    function deepCopy(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }

        var copy = Array.isArray(obj) ? [] : {};

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                copy[key] = deepCopy(obj[key]);
            }
        }

        return copy;
    }
    function convertPresetToAssort(array, name) {
        var arr = []
        arr.push({
            "_id": vulcanAPI.generateHash(`${name}_Assort_${array[0]._id}`),
            "_tpl": array[0]._tpl,
            "parentId": "hideout",
            "slotId": "hideout",
            "upd": {
                "BuyRestrictionMax": 1,
                "BuyRestrictionCurrent": 0,
                "StackObjectsCount": 999999,
                "UnlimitedCount": true,
                "Repairable": {
                    "Durability": 100,
                    "MaxDurability": 100
                }
            }
        })
        for (var i = 1; i < array.length; i++) {
            arr.push({
                "_id": vulcanAPI.generateHash(`${name}_Assort_${array[i]._id}`),
                "_tpl": array[i]._tpl,
                "parentId": vulcanAPI.generateHash(`${name}_Assort_${array[i].parentId}`),
                "slotId": array[i].slotId
            })
        }
        return arr
    }
    function convertPreset(array, name) {
        var arr = []
        arr.push(deepCopy(array[0]))
        for (var i = 1; i < array.length; i++) {
            arr.push(deepCopy(array[i]))
        }
        arr[0]._id = vulcanAPI.generateHash(`${name}_Vanilla_${arr[0]._id}`)
        for (var i = 1; i < arr.length; i++) {
            arr[i]._id = vulcanAPI.generateHash(`${name}_Vanilla_${arr[i]._id}`)
            arr[i].parentId = vulcanAPI.generateHash(`${name}_Vanilla_${arr[i].parentId}`)
        }
        return arr
    }
    function convertWeaponPreset(params) {
        if (params.length !== 1) {
            vulcanAPI.log('cwp命令需要1个参数!');
            return;
        }
        const [player] = params;
        var CachePlayerID = getPlayer(player)
        var PresetObj = {}
        const Preset = saveServer.getProfile(CachePlayerID)?.userbuilds?.weaponBuilds
        if (Preset?.length > 0) {
            vulcanAPI.log('执行cwp命令');
            for (var i = 0; i < Preset.length; i++) {
                var Items = Preset[i].Items //Arr
                var PresetName = getItemName(Items[0]._tpl)
                if (!PresetObj[PresetName]) {
                    PresetObj[PresetName] = {}
                    PresetObj[PresetName].ItemID = Items[0]._tpl
                    PresetObj[PresetName].ItemName = PresetName
                }
                vulcanAPI.log('检测到武器预设:' + CachePlayerID);
                vulcanAPI.log('武器名称:' + PresetName);
                vulcanAPI.log('正在转换预设....');
                PresetObj[PresetName][Preset[i].Name] = {}
                PresetObj[PresetName][Preset[i].Name].ID = Preset[i].Id
                PresetObj[PresetName][Preset[i].Name].Name = Preset[i].Name
                PresetObj[PresetName][Preset[i].Name].ModPreset = convertArrayToObject(Items)
                PresetObj[PresetName][Preset[i].Name].AssortPreset = convertPresetToAssort(Items, Preset[i].Name)
                PresetObj[PresetName][Preset[i].Name].VanillaPreset = convertPreset(Items, Preset[i].Name)
            }
        }
        vulcanAPI.writeFile(`${modDBPath}PresetExport.json`, JSON.stringify(PresetObj, null, 4))
        vulcanAPI.log(`所有武器预设转换完毕,导出到${modDBPath}PresetExport.json.`);
        //vulcanAPI.log(createItemArr(CacheItemID, quantity))
    }
    function quickExport(params) {
        if (params.length !== 1) {
            vulcanAPI.log('qexport命令需要1个参数!');
            return;
        }
        const [player] = params;
        var CachePlayerID = getPlayer(player)
        var PresetObj = {}
        var cachecount = 0
        const Inventory = saveServer.getProfile(CachePlayerID)?.characters?.pmc?.Inventory?.items
        if (Inventory.length > 0) {
            vulcanAPI.log('执行qexport命令');
            Inventory
                .filter(x => x?.slotId == "hideout" && getItemName(x?._tpl) != null)
                .forEach(item => {
                    var CacheResult = []
                    vulcanAPI.log(`发现物品${getItemName(item?._tpl)}, 序列编号${cachecount}, 正在导出....`)
                    PresetObj[`${getItemName(item?._tpl)}_序列${cachecount}`] = { Name: getItemName(item?._tpl), Data: [] }
                    const CacneItem = deepCopy(item)
                    var MainItem = {
                        _id: CacneItem._id,
                        _tpl: CacneItem._tpl,
                        upd: CacneItem.upd != null ? CacneItem.upd : {}
                    }
                    CacheResult.push(MainItem)
                    getChildData(Inventory, item?._id, CacheResult)
                    PresetObj[`${getItemName(item?._tpl)}_序列${cachecount}`].Data = CacheResult
                    cachecount++
                })
        }
        vulcanAPI.writeFile(`${modDBPath}InventoryExport.json`, JSON.stringify(PresetObj, null, 4))
        vulcanAPI.log(`所有装备导出完毕,数据存储于${modDBPath}InventoryExport.json.`);
        //vulcanAPI.log(createItemArr(CacheItemID, quantity))
    }
    function getChildData(itemarr, id, resultarr) {
        // 遍历传入数组中所有满足 parentId 为指定 id 的对象
        itemarr
            .filter(x => x.parentId === id)
            .forEach(item => {
                // 深拷贝当前对象并加入到结果数组
                const copiedItem = deepCopy(item);
                resultarr.push(copiedItem);

                // 递归查找当前对象的子对象
                getChildData(itemarr, item._id, resultarr);
            });
    }
    // 在这里执行additem命令的逻辑


    function startQuest(params) {
        if (params.length !== 2) {
            vulcanAPI.log('start命令需要2个参数!');
            return;
        }
        const [player, questid] = params;
        var CachePlayerID = getPlayer(player)
        if (getQuest(questid) != null) {
            if (CachePlayerID != undefined && saveServer.getProfile(CachePlayerID).characters.pmc.Info.Nickname != undefined) {
                const Quests = saveServer.getProfile(getPlayer(player)).characters.pmc.Quests
                var Quest = Quests.findIndex(x => x.qid == getQuest(questid))
                //vulcanAPI.log(Quest)
                //vulcanAPI.log(Quests[Quest])
                if (Quest == -1) {
                    Quests.push({
                        "qid": getQuest(questid),
                        "startTime": 1694930433,
                        "status": 2,
                        "statusTimers": {},
                        "completedConditions": [],
                        "availableAfter": 0
                    })
                }
                else {
                    Quests[Quest].status = 2
                    Quests[Quest].statusTimers = {}
                }
                vulcanAPI.log('执行start命令');
                vulcanAPI.log('玩家ID:' + CachePlayerID);
                vulcanAPI.log('玩家名:' + saveServer.getProfile(CachePlayerID).characters.pmc.Info.Nickname);
                vulcanAPI.log('任务ID:' + getQuest(questid));
                vulcanAPI.log('任务名:' + getQuestName(getQuest(questid)) + " / " + getQuestEName(getQuest(questid)))
                vulcanAPI.log('所属商人:' + getTraderName(getTrader(questid)));
                vulcanAPI.log('商人ID:' + getTrader(questid));
                vulcanAPI.log("任务已接取,请重启游戏以应用更改")
                //vulcanAPI.log(Quests.findIndex(x => x.qid == getQuest(questid)))
                //vulcanAPI.log(Quests[Quest])
            }
            else {
                vulcanAPI.log("玩家不存在,请检查索引表!")
            }
        }
        else {
            vulcanAPI.log("任务不存在或ID出错,请检查索引表!")
        }
    }
    function setLevel(params) {
        if (params.length !== 2) {
            vulcanAPI.log('level命令需要2个参数!');
            return;
        }
        const [player, level] = params;
        var CachePlayerID = getPlayer(player)
        if (CachePlayerID != undefined) {
            if (saveServer.getProfile(CachePlayerID).characters.pmc.Info.Nickname != undefined) {
                const Info = saveServer.getProfile(getPlayer(player)).characters.pmc.Info
                //vulcanAPI.log(Quest)
                //vulcanAPI.log(Quests[Quest])
                vulcanAPI.log('执行level命令');
                vulcanAPI.log('玩家ID:' + CachePlayerID);
                vulcanAPI.log('玩家名:' + saveServer.getProfile(CachePlayerID).characters.pmc.Info.Nickname);
                vulcanAPI.log('修改前等级:' + Info.Level);
                Info.Level = Number(level)
                Info.Experience = levelMap[Number(level)].exp
                vulcanAPI.log('修改后等级:' + Info.Level);
                vulcanAPI.log("等级修改成功,请重启游戏以应用更改")
                //vulcanAPI.log(Quests.findIndex(x => x.qid == getQuest(questid)))
                //vulcanAPI.log(Quests[Quest])
            }
            else {
                vulcanAPI.log("玩家不存在,请检查索引表!")
            }
        }
        else {
            vulcanAPI.log("任务不存在或ID出错,请检查索引表!")
        }
    }
    function editExp(params) {
        if (params.length !== 2) {
            vulcanAPI.log('exp命令需要2个参数!');
            return;
        }
        const [player, count] = params;
        var CachePlayerID = getPlayer(player)
        if (CachePlayerID != undefined) {
            if (saveServer.getProfile(CachePlayerID).characters.pmc.Info.Nickname != undefined) {
                const Info = saveServer.getProfile(getPlayer(player)).characters.pmc.Info
                //vulcanAPI.log(Quest)
                //vulcanAPI.log(Quests[Quest])
                vulcanAPI.log('执行exp命令');
                vulcanAPI.log('玩家ID:' + CachePlayerID);
                vulcanAPI.log('玩家名:' + saveServer.getProfile(CachePlayerID).characters.pmc.Info.Nickname);
                vulcanAPI.log('修改前经验:' + Info.Experience);
                Info.Level = Number(count)
                Info.Experience += Number(count)
                vulcanAPI.log('修改后经验:' + Info.Experience);
                vulcanAPI.log('经验增加了' + Number(count) + "点");
                vulcanAPI.log("经验修改成功,请重启游戏以应用更改")
                //vulcanAPI.log(Quests.findIndex(x => x.qid == getQuest(questid)))
                //vulcanAPI.log(Quests[Quest])
            }
            else {
                vulcanAPI.log("玩家不存在,请检查索引表!")
            }
        }
        else {
            vulcanAPI.log("任务不存在或ID出错,请检查索引表!")
        }
    }
    function completeQuest(params) {
        if (params.length !== 2) {
            vulcanAPI.log('finish命令需要2个参数!');
            return;
        }
        const [player, questid] = params;
        var CachePlayerID = getPlayer(player)
        if (getQuest(questid) != null) {
            if (CachePlayerID != undefined && saveServer.getProfile(CachePlayerID).characters.pmc.Info.Nickname != undefined) {
                const Quests = saveServer.getProfile(getPlayer(player)).characters.pmc.Quests
                var Quest = Quests.findIndex(x => x.qid == getQuest(questid))
                //vulcanAPI.log(Quest)
                //vulcanAPI.log(Quests[Quest])
                if (Quest == -1) {
                    Quests.push({
                        "qid": getQuest(questid),
                        "startTime": 1694930433,
                        "status": 3,
                        "statusTimers": {},
                        "completedConditions": [],
                        "availableAfter": 0
                    })
                }
                else {
                    Quests[Quest].status = 3
                    Quests[Quest].statusTimers = {}
                }
                vulcanAPI.log('执行finish命令');
                vulcanAPI.log('玩家ID:' + CachePlayerID);
                vulcanAPI.log('玩家名:' + saveServer.getProfile(CachePlayerID).characters.pmc.Info.Nickname);
                vulcanAPI.log('任务ID:' + getQuest(questid));
                vulcanAPI.log('任务名:' + getQuestName(getQuest(questid)) + " / " + getQuestEName(getQuest(questid)))
                vulcanAPI.log('所属商人:' + getTraderName(getTrader(questid)));
                vulcanAPI.log('商人ID:' + getTrader(questid));
                vulcanAPI.log("任务已完成,请重启游戏以应用更改")
                //vulcanAPI.log(Quests.findIndex(x => x.qid == getQuest(questid)))
                //vulcanAPI.log(Quests[Quest])
            }
            else {
                vulcanAPI.log("玩家不存在,请检查索引表!")
            }
        }
        else {
            vulcanAPI.log("任务不存在或ID出错,请检查索引表!")
        }
    }
    function quest(params) {
        if (params.length !== 3) {
            vulcanAPI.log('quest命令需要3个参数!');
            return;
        }
        const [player, questid, status] = params;
        if (player == "@a") {
            for (let pl in vulcanAPI.deserialize(vulcanAPI.readFile(`${modDBPath}玩家索引表.json`))) {
                editQuest([pl, questid, status])
            }
        }
        else {
            editQuest(params)
        }
    }
    function help() {
        vulcanAPI.log("命令列表:")
        vulcanAPI.log("give")
        vulcanAPI.log("向指定玩家/全体玩家发送物品")
        vulcanAPI.log("使用方法:give 玩家名 物品数字ID 数量")
        vulcanAPI.log("使用@a代替玩家名可向所有玩家执行")
        vulcanAPI.log("skill")
        vulcanAPI.log("改变指定玩家的技能等级")
        vulcanAPI.log("使用方法:skill 玩家名 技能数字ID 等级")
        vulcanAPI.log("需要重启游戏以应用更改(无需关闭服务端)")
        vulcanAPI.log("exp")
        vulcanAPI.log("给予指定玩家一定数量的经验")
        vulcanAPI.log("使用方法:exp 玩家名 经验值")
        vulcanAPI.log("需要重启游戏以应用更改(无需关闭服务端)")
        vulcanAPI.log("start")
        vulcanAPI.log("强制指定玩家开始任务")
        vulcanAPI.log("使用方法:start 玩家名 任务数字ID")
        vulcanAPI.log("需要重启游戏以应用更改(无需关闭服务端)")
        vulcanAPI.log("finish")
        vulcanAPI.log("强制指定玩家完成任务")
        vulcanAPI.log("使用方法:finish 玩家名 任务数字ID")
        vulcanAPI.log("需要重启游戏以应用更改(无需关闭服务端)")
        vulcanAPI.log("quest")
        vulcanAPI.log("强制修改指定玩家的任务状态")
        vulcanAPI.log("使用方法:quest 玩家名 任务数字ID 状态码")
        vulcanAPI.log("使用@a代替玩家名可向所有玩家执行")
        vulcanAPI.log("需要重启游戏以应用更改(无需关闭服务端)")
        vulcanAPI.log("playerlist")
        vulcanAPI.log("列出玩家列表并创建玩家索引表")
        vulcanAPI.log("questlist")
        vulcanAPI.log("创建任务索引表")
        vulcanAPI.log("itemlist")
        vulcanAPI.log("创建物品索引表")
        vulcanAPI.log("help")
        vulcanAPI.log("查询帮助")
    }
    function editQuest(params) {
        if (params.length !== 3) {
            vulcanAPI.log('quest命令需要3个参数!');
            return;
        }
        const [player, questid, status] = params;
        var CachePlayerID = getPlayer(player)
        if (getQuest(questid) != null) {
            if (CachePlayerID != undefined && saveServer.getProfile(CachePlayerID).characters.pmc.Info.Nickname != undefined) {
                const Quests = saveServer.getProfile(getPlayer(player)).characters.pmc.Quests
                var Quest = Quests.findIndex(x => x.qid == getQuest(questid))
                //vulcanAPI.log(Quest)
                //vulcanAPI.log(Quests[Quest])
                vulcanAPI.log('执行quest命令');
                vulcanAPI.log('玩家ID:' + CachePlayerID);
                vulcanAPI.log('玩家名:' + saveServer.getProfile(CachePlayerID).characters.pmc.Info.Nickname);
                vulcanAPI.log('任务ID:' + getQuest(questid));
                vulcanAPI.log('任务名:' + getQuestName(getQuest(questid)) + " / " + getQuestEName(getQuest(questid)))
                vulcanAPI.log('所属商人:' + getTraderName(getTrader(questid)));
                vulcanAPI.log('商人ID:' + getTrader(questid));
                if (Quest == -1) {
                    Quests.push({
                        "qid": getQuest(questid),
                        "startTime": 1694930433,
                        "status": Number(status),
                        "statusTimers": {},
                        "completedConditions": [],
                        "availableAfter": 0
                    })
                    vulcanAPI.log('修改前状态码:-1(未激活)');
                    switch (Number(status)) {
                        case 0:
                            vulcanAPI.log('修改后状态码:0(未解锁)');
                            break;
                        case 1:
                            vulcanAPI.log('修改后状态码:1(待接取)');
                            break;
                        case 2:
                            vulcanAPI.log('修改后状态码:2(进行中)');
                            break;
                        case 3:
                            vulcanAPI.log('修改后状态码:3(待交付)');
                            break;
                        case 4:
                            vulcanAPI.log('修改后状态码:4(已完成)');
                            break;
                        case 5:
                            vulcanAPI.log('修改后状态码:5(已失败)');
                            break;

                    }
                }
                else {
                    switch (Quests[Quest].status) {
                        case 0:
                            vulcanAPI.log('修改前状态码:0(未解锁)');
                            break;
                        case 1:
                            vulcanAPI.log('修改前状态码:1(待接取)');
                            break;
                        case 2:
                            vulcanAPI.log('修改前状态码:2(进行中)');
                            break;
                        case 3:
                            vulcanAPI.log('修改前状态码:3(待交付)');
                            break;
                        case 4:
                            vulcanAPI.log('修改前状态码:4(已完成)');
                            break;
                        case 5:
                            vulcanAPI.log('修改前状态码:5(已失败)');
                            break;

                    }
                    Quests[Quest].status = Number(status)
                    Quests[Quest].statusTimers = {}
                    switch (Number(status)) {
                        case 0:
                            vulcanAPI.log('修改后状态码:0(未解锁)');
                            break;
                        case 1:
                            vulcanAPI.log('修改后状态码:1(待接取)');
                            break;
                        case 2:
                            vulcanAPI.log('修改后状态码:2(进行中)');
                            break;
                        case 3:
                            vulcanAPI.log('修改后状态码:3(待交付)');
                            break;
                        case 4:
                            vulcanAPI.log('修改后状态码:4(已完成)');
                            break;
                        case 5:
                            vulcanAPI.log('修改后状态码:5(已失败)');
                            break;

                    }
                }
                vulcanAPI.log("任务进度修改成功,请重启游戏以应用更改")
                //vulcanAPI.log(Quests.findIndex(x => x.qid == getQuest(questid)))
                //vulcanAPI.log(Quests[Quest])
            }
            else {
                vulcanAPI.log("玩家不存在,请检查索引表!")
            }
        }
        else {
            vulcanAPI.log("任务不存在或ID出错,请检查索引表!")
        }
    }
    function writeQuestlist() {
        var QUEST = databaseServer.getTables().templates.quests
        var QUESTLIST = []
        var i = 0
        for (let qt in QUEST) {
            var questid = QUEST[qt]._id
            if (getQuestName(questid) != null) {
                QUESTLIST.push({
                    "数字ID": i,
                    "任务ID": questid,
                    "中文名": getQuestName(questid),
                    "英文名": getQuestEName(questid),
                    "商人ID": QUEST[qt].traderId,
                    "商人名": getTraderName(QUEST[qt].traderId)
                })
                i++
            }
        }
        vulcanAPI.writeFile(`${modDBPath}任务索引表.json`, JSON.stringify(QUESTLIST, null, 4))
        vulcanAPI.log("任务索引表创建完成.")
    }
    function writeItemList() {
        var ITEM = databaseServer.getTables().templates.items
        var ITEMLIST = []
        var i = 0
        for (let it in ITEM) {
            var itemid = ITEM[it]._id
            if (getItemName(itemid) != null && ITEM[it]._props && ITEM[it]._props.Prefab && ITEM[it]._props.Prefab.path != "") {
                ITEMLIST.push({
                    "数字ID": i,
                    "物品ID": itemid,
                    "中文名": getItemShortName(itemid),
                    "中文全名": getItemName(itemid),
                    "英文名": getItemEShortName(itemid),
                    "英文全名": getItemEName(itemid)
                })
                i++
            }
        }
        vulcanAPI.writeFile(`${modDBPath}物品索引表.json`, JSON.stringify(ITEMLIST, null, 4))
        vulcanAPI.log("物品索引表创建完成.")
    }
    function Playerlist() {
        const Profile = saveServer.getProfiles()
        var Profilelist = {}
        for (let pf in Profile) {
            const Name = Profile[pf].info.username.toLowerCase()
            vulcanAPI.log("玩家: " + Name + " 玩家名: " + Profile[pf].characters.pmc.Info.Nickname + " ID: " + Profile[pf].info.id)
            Profilelist[Name] = Profile[pf].info.id
        }
        vulcanAPI.writeFile(`${modDBPath}玩家索引表.json`, JSON.stringify(Profilelist, null, 4))
        vulcanAPI.log("玩家索引表写入完成.")
    }
    function getTraderName(itemid) {
        var Locale = databaseServer.getTables().locales.global["ch"]
        if (Locale[`${itemid} Nickname`] != null && Locale[`${itemid} Nickname`] != "") {
            return Locale[`${itemid} Nickname`]
        }
        else {
            return null
        }
    }
    function getQuestName(itemid) {
        var Locale = databaseServer.getTables().locales.global["ch"]
        if (Locale[`${itemid} name`] != null && Locale[`${itemid} name`] != "") {
            return Locale[`${itemid} name`]
        }
        else {
            return null
        }
    }
    function getQuestEName(itemid) {
        var Locale = databaseServer.getTables().locales.global["en"]
        if (Locale[`${itemid} name`] != null && Locale[`${itemid} name`] != "") {
            return Locale[`${itemid} name`]
        }
        else {
            return null
        }
    }
    function setSkill(params) {
        if (params.length !== 3) {
            vulcanAPI.log('skill命令需要3个参数!');
            return;
        }
        const [player, skill, level] = params;
        var CachePlayerID = getPlayer(player)
        const Player = saveServer.getProfile(getPlayer(player)).characters.pmc
        const Skills = saveServer.getProfile(getPlayer(player)).characters.pmc.Skills.Common
        const Skills2 = saveServer.getProfile(getPlayer(player)).characters.pmc.Skills
        var Skill = Skills.findIndex(x => x.Id == getSkill(skill))
        //var SkillLevel = Math.floor(Skills[Skill].Progress / 100)
        //vulcanAPI.log(Skills[Skill])
        //vulcanAPI.log(Skill)
        //vulcanAPI.log(Skills[Skill].Progress)
        if (getSkillName(getSkill(skill)) != null) {
            if (CachePlayerID != undefined && saveServer.getProfile(CachePlayerID).characters.pmc.Info.Nickname != undefined) {
                if (Number(level) < 52 && Number(level) >= 0) {
                    //questHelper.rewardSkillPoints(CachePlayerID, Player, getSkill(skill), Number(level))
                    vulcanAPI.log('执行skill命令');
                    vulcanAPI.log('玩家ID:' + CachePlayerID);
                    vulcanAPI.log('玩家名:' + saveServer.getProfile(CachePlayerID).characters.pmc.Info.Nickname);
                    vulcanAPI.log('技能ID:' + getSkill(skill));
                    vulcanAPI.log('技能名:' + getSkillName(getSkill(skill)) + " / " + getSkillEName(getSkill(skill)))
                    vulcanAPI.log('修改前等级:' + Math.floor(Skills[Skill].Progress / 100));
                    //vulcanAPI.log(Skills[Skill].Progress)
                    Skills[Skill].Progress = Number(level) * 100
                    //vulcanAPI.log(Skills[Skill].Progress)
                    vulcanAPI.log('修改后等级:' + Math.floor(Skills[Skill].Progress / 100));
                    vulcanAPI.log("技能等级修改成功,请重启游戏以应用更改")
                }
                else {
                    vulcanAPI.log("技能等级不能超过51级或小于0级,请重试")
                }
            }
            else {
                vulcanAPI.log("玩家不存在,请检查索引表!")
            }
        }
        else {
            vulcanAPI.log("技能不存在或ID错误,请检查索引表!")
        }
    }
    function getItemStack(itemid) {
        var ITEM = databaseServer.getTables().templates.items
        if (ITEM[itemid] != null) {
            return ITEM[itemid]._props.StackMaxSize
        }
    }
    function createItemArr(itemid, count) {
        var Array = []
        var maxStack = getItemStack(itemid);
        if (havePreset(itemid)) {
            for (var i = 0; i < count; i++) {
                var preset = getPreset(itemid, i);
                for (var j = 0; j < preset.length; j++) {
                    Array.push(preset[j])
                }
            }
            return Array
        }
        else {
            if (maxStack > 1) {
                if (count > maxStack) {
                    if (count % maxStack != 0) {
                        for (var i = 0; i < Math.floor(count / maxStack); i++) {
                            Array.push({
                                "_id": vulcanAPI.generateHash(`${itemid}_${i}`),
                                "_tpl": itemid,
                                "upd": {
                                    "SpawnedInSession": true,
                                    "StackObjectsCount": maxStack
                                },
                                "parentId": "65dca20340be34cc3e0e3820",
                                "slotId": "main"
                            });
                        }
                        Array.push({
                            "_id": vulcanAPI.generateHash(`${itemid}_${Math.floor(count / maxStack)}`),
                            "_tpl": itemid,
                            "upd": {
                                "SpawnedInSession": true,
                                "StackObjectsCount": (count % maxStack)
                            },
                            "parentId": "65dca20340be34cc3e0e3820",
                            "slotId": "main"
                        });
                    }
                    else {
                        for (var i = 0; i < Math.floor(count / maxStack); i++) {
                            Array.push({
                                "_id": vulcanAPI.generateHash(`${itemid}_${i}`),
                                "_tpl": itemid,
                                "upd": {
                                    "SpawnedInSession": true,
                                    "StackObjectsCount": maxStack
                                },
                                "parentId": "65dca20340be34cc3e0e3820",
                                "slotId": "main"
                            });
                        }
                    }
                }
                else {
                    Array.push({
                        "_id": vulcanAPI.generateHash(`${itemid}_${count}`),
                        "_tpl": itemid,
                        "upd": {
                            "SpawnedInSession": true,
                            "StackObjectsCount": count
                        },
                        "parentId": "65dca20340be34cc3e0e3820",
                        "slotId": "main"
                    });
                }
            }
            else {
                for (var i = 0; i < count; i++) {
                    Array.push({
                        "_id": vulcanAPI.generateHash(`${itemid}_${i}`),
                        "_tpl": itemid,
                        "upd": {
                            "SpawnedInSession": true,
                            "StackObjectsCount": 1
                        },
                        "parentId": "65dca20340be34cc3e0e3820",
                        "slotId": "main"
                    });
                }
            }
            return Array
        }
    }
    function getItemName(itemid) {
        var Locale = databaseServer.getTables().locales.global["ch"]
        if (Locale[`${itemid} Name`] != null && Locale[`${itemid} Name`] != "") {
            return Locale[`${itemid} Name`]
        }
        else {
            return null
        }
    }
    function getItemEName(itemid) {
        var Locale = databaseServer.getTables().locales.global["en"]
        if (Locale[`${itemid} Name`] != null && Locale[`${itemid} Name`] != "") {
            return Locale[`${itemid} Name`]
        }
        else {
            return null
        }
    }
    function getSkillName(itemid) {
        var Locale = databaseServer.getTables().locales.global["ch"]
        if (Locale[`${itemid}`] != null && Locale[`${itemid}`] != "") {
            return Locale[`${itemid}`]
        }
        else {
            return itemid
        }
    }
    function getSkillEName(itemid) {
        var Locale = databaseServer.getTables().locales.global["en"]
        if (Locale[`${itemid}`] != null && Locale[`${itemid}`] != "") {
            return Locale[`${itemid}`]
        }
        else {
            return itemid
        }
    }
    function getItemShortName(itemid) {
        var Locale = databaseServer.getTables().locales.global["ch"]
        if (Locale[`${itemid} ShortName`] != null && Locale[`${itemid} ShortName`] != "") {
            return Locale[`${itemid} ShortName`]
        }
        else {
            return null
        }
    }
    function getItemEShortName(itemid) {
        var Locale = databaseServer.getTables().locales.global["en"]
        if (Locale[`${itemid} ShortName`] != null && Locale[`${itemid} ShortName`] != "") {
            return Locale[`${itemid} ShortName`]
        }
        else {
            return null
        }
    }
    function getPlayer(name) {
        //console.log(name.toLowerCase())
        //console.log(vulcanAPI.deserialize(vulcanAPI.readFile(`${modDBPath}玩家索引表.json`)))
        //console.log(vulcanAPI.deserialize(vulcanAPI.readFile(`${modDBPath}玩家索引表.json`))[name.toLowerCase()])
        return vulcanAPI.deserialize(vulcanAPI.readFile(`${modDBPath}玩家索引表.json`))[name.toLowerCase()]
    }
    function getItem(id) {
        const itemlist1 = vulcanAPI.deserialize(vulcanAPI.readFile(`${modDBPath}物品索引表.json`));
        if (itemlist1.find(x => x["数字ID"] == id)) {
            return itemlist1.find(x => x["数字ID"] == id)["物品ID"]
        }
        else {
            return null
        }
    }
    function getSkill(id) {
        const skilllist = vulcanAPI.deserialize(vulcanAPI.readFile(`${modDBPath}技能索引表.json`));
        if (skilllist.find(x => x["数字ID"] == id)) {
            return skilllist.find(x => x["数字ID"] == id)["技能ID"]
        }
        else {
            return null
        }
    }
    function getQuest(id) {
        const questlist1 = vulcanAPI.deserialize(vulcanAPI.readFile(`${modDBPath}任务索引表.json`));
        if (questlist1.find(x => x["数字ID"] == id)) {
            return questlist1.find(x => x["数字ID"] == id)["任务ID"]
        }
        else {
            return null
        }
    }
    function getTrader(id) {
        const questlist1 = vulcanAPI.deserialize(vulcanAPI.readFile(`${modDBPath}任务索引表.json`));
        if (questlist1.find(x => x["数字ID"] == id)) {
            return questlist1.find(x => x["数字ID"] == id)["商人ID"]
        }
        else {
            return null
        }
    }
    function havePreset(itemid) {
        var Preset = databaseServer.getTables().globals.ItemPresets
        for (let ps in Preset) {
            if (Preset[ps]._encyclopedia != null) {
                if (Preset[ps]._encyclopedia == itemid) {
                    return true
                }
            }
        }
        return false
    }
    function getPresetBase(itemid) {
        var Preset = databaseServer.getTables().globals.ItemPresets
        var PS = []
        for (let ps in Preset) {
            if (Preset[ps]._encyclopedia != null) {
                if (Preset[ps]._encyclopedia == itemid) {
                    PS.push(Preset[ps]._items[0])
                    for (var i = 1; i < Preset[ps]._items.length; i++) {
                        PS.push(Preset[ps]._items[i])
                    }
                    //vulcanAPI.log("原始id" +Preset[ps]._items[0]._id)
                }
            }
        }
        return PS
    }
    function getPreset(itemid, num) {
        var PS = vulcanAPI.deepCopy(getPresetBase(itemid))
        var Array1 = []
        for (var i = 0; i < PS.length; i++) {
            Array1.push(PS[i])
            //vulcanAPI.log("修改前id" + PS[i]._id)
        }
        for (var i = 0; i < Array1.length; i++) {
            Array1[i]._id = `${Array1[i]._id}_${num}`
            //vulcanAPI.log("修改后id" + PS[i]._id)
            Array1[i].desc = "DESC"
            if (Array1[i].parentId) {
                Array1[i].parentId = `${Array1[i].parentId}_${num}`
            }
            if (!Array1[i].upd) {
                Array1[i].upd = {}
                Array1[i].upd.SpawnedInSession = true
            }
        }
        Array1[0].upd.SpawnedInSession = true
        Array1[0].parentId = "65dca20340be34cc3e0e3820"
        Array1[0].slotId = "main"
        return Array1
    }
    var testps = {}
    for (var i = 0; i < 3; i++) {
    }
    //testps[0] = getPreset("5644bd2b4bdc2d3b4c8b4572", 0)
    //testps[1] = getPreset("5644bd2b4bdc2d3b4c8b4572", 1)
    //vulcanAPI.writeFile(`${modDBPath}TestPreset.json`, JSON.stringify(testps, null, 4))
    process.on('exit', (code) => {
        vulcanAPI.log(`子进程退出，退出码：${code}`);
    });
    //vulcanAPI.writeFile(`${modDBPath}suit.json`, JSON.stringify(clientDB.traders["5ac3b934156ae10c4430e83c"].suits, null, 4))

};