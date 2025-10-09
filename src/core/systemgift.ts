import { DependencyContainer } from "tsyringe";
import crypto from "crypto";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { DialogueHelper } from "@spt/helpers/DialogueHelper";
import { ProfileHelper } from "@spt/helpers/ProfileHelper";
import { MailSendService } from "@spt/services/MailSendService";
import { IPostSptLoadMod } from "@spt/models/external/IPostSptLoadMod";
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

export const initSystemGift = (container: DependencyContainer) => {
    const vulcanAPI = container.resolve<VulcanCommon>("VulcanCommon")
    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
    const clientDB = databaseServer.getTables();
    const modPath = Config.Global.ModPath
    const modDBPath = `${modPath}${Config.CoreModule.SystemGift.Global.ModPath}`
    const modDB = vulcanAPI.loadRecursive(`${modDBPath}`)
    vulcanAPI.access("启动核心系统: 每日补给")
    for (let lang in modDB.mail) {
        for (let mails in modDB.mail[lang]) {
            clientDB.locales.global[lang][mails] = modDB.mail[lang][mails]
        }
    }
    vulcanAPI.log("后勤中心上线，新一批物资即将抵达")
    vulcanAPI.waitForTime(2)
};
export const sentGit = (container: DependencyContainer, sessionId: String) => {
    const vulcanAPI = container.resolve<VulcanCommon>("VulcanCommon")
    const diaoluehelper = container.resolve("DialogueHelper")
    const hashUtil = container.resolve("HashUtil")
    const preSptModLoader = container.resolve("PreSptModLoader");
    const logger = container.resolve<ILogger>("WinstonLogger");
    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
    const profileHelper = container.resolve<ProfileHelper>("ProfileHelper");
    const jsonUtil = container.resolve<JsonUtil>("JsonUtil");
    const clientDB = databaseServer.getTables();
    const Handbook = clientDB.templates.handbook
    const mailSendService = container.resolve<MailSendService>("MailSendService");
    const modPath = Config.Global.ModPath
    const modDBPath = `${modPath}${Config.CoreModule.SystemGift.Global.ModPath}`
    const Locale = clientDB.locales.global["ch"]
    const ELocale = clientDB.locales.global["en"]
    const presetArray = Object.values(clientDB.globals.ItemPresets)
    const GunPool = Config.CoreModule.SystemGift.Config.GiftData.Global
    const timer = jsonUtil.deserialize(vulcanAPI.readFile(`${modDBPath}timer.json`));
    //使用跳蚤市场标签创建附件数组
    function CreateArrWithTag(Tag) {
        var Array = []
        for (var i = 0; i < clientDB.templates.handbook.Items.length; i++) {
            var ItemData = clientDB.templates.handbook.Items[i]
            if (ItemData.ParentId == Tag) {
                Array.push(
                    {
                        "_id": hashUtil.generate(),
                        "_tpl": ItemData.Id,
                        "upd": {
                            "StackObjectsCount": 1,
                            "SpawnedInSession": Config.CoreModule.SystemGift.Config.GiftData.Global.FindInRaid
                        },
                        "parentId": "65dca20340be34cc3e0e3820",
                        "slotId": "main"
                    }
                )
            }
        }
        return Array
    }
    //从跳蚤市场标签创建ID数组
    function createWithTag(Tag) {
        var Array = []
        for (var i = 0; i < clientDB.templates.handbook.Items.length; i++) {
            var ItemData = clientDB.templates.handbook.Items[i]
            if (ItemData.ParentId == Tag) {
                Array.push(ItemData.Id)
            }
        }
        return Array
    }
    //数组处理
    function addInArray(Arr1, Arr2) {
        for (var i = 0; i < Arr2.length; i++) {
            Arr1.push(Arr2[i])
        }
    }
    function addRewardWithCount(id, stack, count, array) {
        for (var i = 0; i < count; i++) {
            array.push(
                {
                    "_id": hashUtil.generate(),
                    "_tpl": id,
                    "upd": {
                        "StackObjectsCount": stack,
                        "SpawnedInSession": Config.CoreModule.SystemGift.Config.GiftData.Global.FindInRaid
                    },
                    "parentId": "65dca20340be34cc3e0e3820",
                    "slotId": "main"
                }
            )
        }
    }
    //使用跳蚤市场标签创建满堆叠弹药附件数组
    function CreateAmmoWithTag(Tag) {
        var Array = []
        for (var i = 0; i < clientDB.templates.handbook.Items.length; i++) {
            var ItemData = clientDB.templates.handbook.Items[i]
            if (ItemData.ParentId == Tag && clientDB.templates.items[ItemData.Id]._props.StackMaxSize > 1) {
                Array.push(
                    {
                        "_id": hashUtil.generate(),
                        "_tpl": ItemData.Id,
                        "upd": {
                            "StackObjectsCount": clientDB.templates.items[ItemData.Id]._props.StackMaxSize,
                            "SpawnedInSession": Config.CoreModule.SystemGift.Config.GiftData.Global.FindInRaid
                        },
                        "parentId": "65dca20340be34cc3e0e3820",
                        "slotId": "main"
                    }
                )
            }
        }
        return Array
    }
    //添加战利品
    function AddReward(id, count, Array) {
        const maxStack = vulcanAPI.getItem(id)._props.StackMaxSize
        const num = Math.floor(count / maxStack)
        const remain = count % maxStack
        for (var i = 0; i < num; i++) {
            Array.push(
                {
                    "_id": vulcanAPI.generateHash(`${id}_${i}`),
                    "_tpl": id,
                    "upd": {
                        "StackObjectsCount": maxStack,
                        "SpawnedInSession": false
                    },
                    "parentId": "65dca20340be34cc3e0e3820",
                    "slotId": "main"
                }
            )
        }
        if (remain > 0) {
            Array.push(
                {
                    "_id": vulcanAPI.generateHash(`${id}_${num}`),
                    "_tpl": id,
                    "upd": {
                        "StackObjectsCount": remain,
                        "SpawnedInSession": false
                    },
                    "parentId": "65dca20340be34cc3e0e3820",
                    "slotId": "main"
                }
            )
        }
    }
    //节日日期计算
    function findThanksgivingMonth(year) {
        let thanksgiving = new Date(year, 10, 1); // 10 is the index for November
        thanksgiving.setDate(thanksgiving.getDate() + (21 - thanksgiving.getDay() % 7) % 7);
        let month = (thanksgiving.getMonth() + 1)
        return month;
    }
    function findThanksgivingDay(year) {
        var thanksgiving = new Date(year, 10, 1); // 10 is the index for November
        var thanksgivingDay = thanksgiving.getDay();
        var diff = 5 - thanksgivingDay + 21; // Number of days to the second Sunday
        var thanksgivingday = new Date(thanksgiving.getTime() + diff * 24 * 60 * 60 * 1000);
        var day = thanksgivingday.getDate()
        return day;
    }
    function motherDayMonth(year) {
        // Calculate the date of the second Sunday in May
        var firstMay = new Date(year, 4, 1); // 1st May
        var firstMayDay = firstMay.getDay();
        var diff = 7 - firstMayDay + 7; // Number of days to the second Sunday
        var motherDay = new Date(firstMay.getTime() + diff * 24 * 60 * 60 * 1000);
        // Format the date as 'dd-mm-yyyy'
        var month = (motherDay.getMonth() + 1)
        return month;
    }
    function motherDayDay(year) {
        // Calculate the date of the second Sunday in May
        var firstMay = new Date(year, 4, 1); // 1st May
        var firstMayDay = firstMay.getDay();
        var diff = 7 - firstMayDay + 7; // Number of days to the second Sunday
        var motherDay = new Date(firstMay.getTime() + diff * 24 * 60 * 60 * 1000);
        // Format the date as 'dd-mm-yyyy'
        var day = motherDay.getDate()
        return day;
    }
    //自定义函数
    //读取数据
    function getBackpackSize(id) {
        var size = 0
        for (var j = 0; j < clientDB.templates.items[id]._props.Grids.length; j++) {
            size = size + (clientDB.templates.items[id]._props.Grids[j]._props.cellsH * clientDB.templates.items[id]._props.Grids[j]._props.cellsV)
        }
        return size
    }
    function getArmorLevel(id) {
        return clientDB.templates.items[id]._props.armorClass
    }
    function isArmor(id) {
        if (clientDB.templates.items[id]._props.Slots.length > 0 && clientDB.templates.items[id]._props.Slots[0]._props.filters[0].Plate) {
            return true
        }
        return false
    }
    function isTac(id) {
        if (clientDB.templates.items[id]._props.Slots.length == 0) {
            return true
        }
        return false
    }
    function getAmmoData(id) {
        return clientDB.templates.items[id]._props.PenetrationPower
    }
    //废弃内容
    function countInArray(array, item) {
        return array.reduce((count, current) => count + (current === item), 0);
    }
    function condition(num) {
        return 1 / num;
    }
    function randomPick(array, type) {
        var total = 0;
        var weights = [];
        for (var i = 0; i < array.length; i++) {
            var weight = 0
            switch (type) {
                case "ammo": {
                    weight = condition(Math.floor((clientDB.templates.items[array[i]._tpl]._props.PenetrationPower) / 10));
                    total += weight;
                    weights.push(total);
                }
                    break
                case "armor": {
                    weight = condition(clientDB.templates.items[array[i]._tpl]._props.armorClass);
                    total += weight;
                    weights.push(total);
                }
                    break
                case "backpack": {
                    weight = condition((getBackpackSize(array[i]._tpl)) / 10);
                    total += weight;
                    weights.push(total);
                }
            }
        }

        var randomValue = Math.random() * total;
        for (var i = 0; i < weights.length; i++) {
            if (randomValue < weights[i]) {
                return array[i];
            }
        }
    }
    //自定义log
    //添加战利品
    function addWithCount(arr, obj, int) {
        for (var i = 0; i < int; i++) {
            var randomint = Math.floor(Math.random() * obj.length)
            arr.push(obj[randomint])
        }
    }
    //从数组中抽取随机元素
    function DrawObjFromArr(Array) {
        var randomint = Math.floor(Math.random() * Array.length)
        return Array[randomint]
    }
    //使用二维数组合并数组
    function createArrs(Array) {
        var allarr = []
        for (var i = 0; i < Array.length; i++) {
            for (var j = 0; j < Array[i].length; j++) {
                allarr.push(Array[i][j])
            }
        }
        return allarr
    }
    //从id生成武器
    function generateWeapon(inputWeapon, count, custom) {
        const weapon = clientDB.templates.items[inputWeapon];
        let preset = [];
        preset.push({
            "_id": GenerateHash(weapon._id + "parent" + custom),
            "_tpl": weapon._id,
            "parentId": "65dca20340be34cc3e0e3820",
            "slotId": "main"
        })
        function generateAttachment(slots, parentId) {
            slots.forEach(slot => {
                const availableAttachments = slot._props.filters[0].Filter;
                const randomAttachment = availableAttachments[Math.floor(Math.random() * availableAttachments.length)];
                const attachment = clientDB.templates.items[randomAttachment];
                if (availableAttachments.length > 0) {
                    if (slot._required == true) {
                        try {
                            preset.push({
                                "_id": GenerateHash(attachment._id + slot._name + custom),
                                "_tpl": attachment._id,
                                "parentId": parentId,
                                "slotId": slot._name
                            });
                            if (attachment._props.Slots) {
                                generateAttachment(attachment._props.Slots, GenerateHash(attachment._id + slot._name + custom));
                            }
                        }
                        catch (err) {
                            vulcanAPI.warn("Undefined Item: " + attachment._id)
                            vulcanAPI.warn(err)
                        }
                    }
                    else if (Math.floor(Math.random() * 100) < count) {
                        try {
                            preset.push({
                                "_id": GenerateHash(attachment._id + slot._name + custom),
                                "_tpl": attachment._id,
                                "parentId": parentId,
                                "slotId": slot._name
                            });
                            if (attachment._props.Slots) {
                                generateAttachment(attachment._props.Slots, GenerateHash(attachment._id + slot._name + custom));
                            }
                        }
                        catch (err) {
                            vulcanAPI.warn("Undefined Item: " + attachment._id)
                            vulcanAPI.warn(err)
                        }
                    }
                }
            });
        }
        if (weapon._props.Slots) {

            try {
                generateAttachment(weapon._props.Slots, GenerateHash(weapon._id + "parent" + custom));
            }
            catch (err) {
                vulcanAPI.warn("Undefined Weapon: " + inputWeapon)
                vulcanAPI.warn(err)

            }
        }
        return {
            Preset: preset
        };
    }

    //将生成结果输入附件数组
    function convertWponArr(result, arr) {
        for (var i = 0; i < result.Preset.length; i++) {
            arr.push(
                {
                    "_id": result.Preset[i]._id,
                    "_tpl": result.Preset[i]._tpl,
                    "parentId": result.Preset[i].parentId,
                    "slotId": result.Preset[i].slotId,
                    "upd": {
                        "SpawnedInSession": Config.CoreModule.SystemGift.Config.GiftData.Global.FindInRaid
                    }
                }
            )
        }
    }
    function GenerateHash(string) {
        const shasum = crypto.createHash("sha1");
        shasum.update(string);
        return shasum.digest("hex").substring(0, 24);
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
                var preset = getPreset(itemid, i)
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
                                "_id": GenerateHash(`${itemid}_${i}`),
                                "_tpl": itemid,
                                "upd": {
                                    "SpawnedInSession": Config.CoreModule.SystemGift.Config.GiftData.Global.FindInRaid,
                                    "StackObjectsCount": maxStack
                                },
                                "parentId": "65dca20340be34cc3e0e3820",
                                "slotId": "main"
                            });
                        }
                        Array.push({
                            "_id": GenerateHash(`${itemid}_${Math.floor(count / maxStack)}`),
                            "_tpl": itemid,
                            "upd": {
                                "SpawnedInSession": Config.CoreModule.SystemGift.Config.GiftData.Global.FindInRaid,
                                "StackObjectsCount": (count % maxStack)
                            },
                            "parentId": "65dca20340be34cc3e0e3820",
                            "slotId": "main"
                        });
                    }
                    else {
                        for (var i = 0; i < count; i++) {
                            Array.push({
                                "_id": GenerateHash(`${itemid}_${i}`),
                                "_tpl": itemid,
                                "upd": {
                                    "SpawnedInSession": Config.CoreModule.SystemGift.Config.GiftData.Global.FindInRaid,
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
                        "_id": GenerateHash(`${itemid}_${count}`),
                        "_tpl": itemid,
                        "upd": {
                            "SpawnedInSession": Config.CoreModule.SystemGift.Config.GiftData.Global.FindInRaid,
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
                        "_id": GenerateHash(`${itemid}_${i}`),
                        "_tpl": itemid,
                        "upd": {
                            "SpawnedInSession": Config.CoreModule.SystemGift.Config.GiftData.Global.FindInRaid,
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
                    //console.log("原始id" +Preset[ps]._items[0]._id)
                }
            }
        }
        return PS
    }
    function getPreset(itemid, num) {
        var PS = jsonUtil.clone(getPresetBase(itemid))
        var Array1 = []
        for (var i = 0; i < PS.length; i++) {
            Array1.push(PS[i])
            //console.log("修改前id" + PS[i]._id)
        }
        for (var i = 0; i < Array1.length; i++) {
            Array1[i]._id = vulcanAPI.generateHash(`${Array1[i]._id}_${num}`)
            if (!Array1[i].upd) {
                Array1[i].upd = {}
                Array1[i].upd.SpawnedInSession = true
            }
            if (Array1[i].parentId) {
                Array1[i].parentId = vulcanAPI.generateHash(`${Array1[i].parentId}_${num}`)
            }
        }
        Array1[0].upd.SpawnedInSession = true
        Array1[0].parentId = "65dca20340be34cc3e0e3820"
        Array1[0].slotId = "main"
        return Array1
    }
    function sentMailAndConsoleMassage(profileID, localekey, itempack, hideoutpack, time) {
        mailSendService.sendLocalisedSystemMessageToPlayer(profileID, localekey, itempack, hideoutpack, time);
        vulcanAPI.log("你的补给已发放到藏身处")
    }
    function checkArmorLevel(id, level) {
        return presetArray.find(x => x._encyclopedia == id)?._items.some(x => getArmorLevel(x._tpl) >= level) || false;
    }
    function initRewardPack(target, pack) {
        const Normal = pack.NormalItem
        const Preset = pack.VanillaPreset
        const ItemList = pack.ItemList
        const Weapon = pack.CustomWeapon
        for (let item in Normal) {
            vulcanAPI.debug(item)
            vulcanAPI.debug(RewardMap[item])
            addWithCount(target, RewardMap[item], Normal[item])
        }
        for (let item in Preset) {
            for (var i = 0; i < Preset[item]; i++) {
                vulcanAPI.debug(item)
                vulcanAPI.debug(RewardMap[item])
                addInArray(target, createItemArr(DrawObjFromArr(RewardMap[item]), 1))
            }
        }
        for (let item in ItemList) {
            AddReward(item, ItemList[item], target)
        }
        for (let item in Weapon) {
            for (var i = 0; i < Weapon[item]; i++) {
                convertWponArr(generateWeapon(DrawObjFromArr(RewardMap[item]), pack.CustomWeaponPerSlotModChance, `${pack.Name}_${i}`), target)
            }
        }
        //vulcanAPI.debug(JSON.stringify(target, null, 4))

    }
    //准备简单捋一遍这玩意....要是能和前年的我对话就好了= =
    //数组拆分成对象, 从config文件读key进行添加, 方便调整内容
    //甲和胸挂得捋一捋, 最好是想办法依然限制一下等级
    //改枪算法实在不想写了, 写不动了
    //顺便把下面那一大串他妈的send给改了, 我TM写十六个log也是牛逼
    //OK, 就这些
    //呃, 节日算法
    //硬编码吧, 往前个三五年差不多
    //事已至此, 该吃饭了
    //当前时间16:16 01.30.2025
    //晚上见, 世界
    //当前时间21:29 01.30.2025
    //妈的, 我才到家
    //歇会儿先
    //烦死我了= =
    //当前时间22:29 01.30.2025
    //躺了一小时发现我鼠标忘了关了
    //裂开....
    //战歌起, 开写
    //\n
    //还剩一点小bug, 邮件存储时间好像出了点小问题, 明天再改, 受不了了
    //我copilot还到期了, 烦= =
    //当前时间02:58 01.31.2025
    //晚安, 世界
    //搞完了搞完了搞完了搞完了搞完了!!!
    //出门吃饭咯
    //剩下的东西都好搞了, 控制台是真的捋不动= =
    //好吧, 有几个东西不是很好搞
    //问题不大
    //当前时间14:44 01.31.2025
    //事已至此, 该吃饭了


    //核心运算部分
    var firstlogin = false
    var sentmail = false
    var now = new Date
    //检测是否是第一次登陆
    if (timer[sessionId] == undefined) {
        //第一次登陆, 生成基础数据
        vulcanAPI.debug("发现第一次登陆, 正在生成数据....")
        timer[sessionId] = {}
        timer[sessionId].Name = profileHelper.getFullProfile(sessionId).info.username
        timer[sessionId].Time = Date.now()
        timer[sessionId].Year = now.getFullYear()
        timer[sessionId].Month = now.getMonth() + 1
        timer[sessionId].Day = now.getDate()
        timer[sessionId].count = 1
        timer[sessionId].Week = now.getDay() == 0 ? 7 : now.getDay()
        timer[sessionId].firstlogin = false
        firstlogin = true
        sentmail = true
    }
    //并非第一次登陆
    else {
        const intervalTime = Config.CoreModule.SystemGift.Config.MinIntervalTime * 1000
        //check if 24 hours later
        if ((Date.now() - timer[sessionId].Time) >= intervalTime || timer[sessionId].firstlogin == true) {
            timer[sessionId].Time = Date.now()
            vulcanAPI.debug("已更新时间数据")
            timer[sessionId].Year = now.getFullYear()
            timer[sessionId].Month = now.getMonth() + 1
            timer[sessionId].Day = now.getDate()
            timer[sessionId].count += 1
            timer[sessionId].Week = now.getDay() == 0 ? 7 : now.getDay()
            timer[sessionId].firstlogin = false
            sentmail = true
        }
    }
    if (sentmail == true) {
        var 每日奖励 = []//每日奖励池
        var 每周奖励 = []//每周奖励池
        var 每月奖励 = []//每月奖励池
        var 节日奖励 = []
        var DebugAttachment = []
        var 五六级甲 = []
        var 四级甲 = []
        var 甲 = []
        var 防弹胸挂 = []
        var 普通胸挂 = []
        var 小背包 = []
        var 大背包 = []
        var 四穿 = []
        var 高穿 = []
        const 医疗包 = CreateArrWithTag("5b47574386f77428ca22b338")//急救包
        const 注射器 = CreateArrWithTag("5b47574386f77428ca22b33a")//注射器
        const ArmorArr = CreateArrWithTag("5b5f701386f774093f2ecf0f")//护甲
        const TacticalVestArr = CreateArrWithTag("5b5f6f8786f77447ed563642")//弹挂
        const 食品 = CreateArrWithTag("5b47574386f77428ca22b336")//食品
        const 饮料 = CreateArrWithTag("5b47574386f77428ca22b335")//饮品
        const 背包 = CreateArrWithTag("5b5f6f6c86f774093f2ecf0b")//背包
        const 容器 = CreateArrWithTag("5b5f6fa186f77409407a7eb7")//容器
        const 子弹大类 = CreateAmmoWithTag("5b47574386f77428ca22b33b")//子弹大类
        const 突击卡宾枪 = createWithTag("5b5f78e986f77447ed5636b1")
        const 特殊武器 = createWithTag("5b5f79eb86f77447ed5636b7")
        const 突击步枪 = createWithTag("5b5f78fc86f77409407a7f90")
        const DMR = createWithTag("5b5f791486f774093f2ed3be")
        const 手枪 = createWithTag("5b5f792486f77447ed5636b3")
        const 霰弹枪 = createWithTag("5b5f794b86f77409407a7f92")
        const SMG = createWithTag("5b5f796a86f774093f2ed3c0")
        const 栓动式步枪 = createWithTag("5b5f798886f77447ed5636b5")
        const 机枪 = createWithTag("5b5f79a486f77409407a7f94")
        const 榴弹发射器 = createWithTag("5b5f79d186f774093f2ed3c2")
        const 其他 = CreateArrWithTag("5b47574386f77428ca22b2f4")//其他
        const 医疗物资 = CreateArrWithTag("5b47574386f77428ca22b2f3")//医疗物资
        const 家居用品 = CreateArrWithTag("5b47574386f77428ca22b2f0")//家居用品
        const 工具 = CreateArrWithTag("5b47574386f77428ca22b2f6")//工具
        const 建筑材料 = CreateArrWithTag("5b47574386f77428ca22b2ee")//建筑材料
        const 易燃物品 = CreateArrWithTag("5b47574386f77428ca22b2f2")//易燃物品
        const 电子产品 = CreateArrWithTag("5b47574386f77428ca22b2ef")//电子产品
        const 能源物品 = CreateArrWithTag("5b47574386f77428ca22b2ed")//能源物品
        const 情报物品 = CreateArrWithTag("5b47574386f77428ca22b341")//情报物品
        const 贵重物品 = CreateArrWithTag("5b47574386f77428ca22b2f1")//贵重物品
        const 投掷物 = CreateArrWithTag("5b5f7a2386f774093f2ed3c4")//投掷物
        const 总枪械池 = createArrs([突击卡宾枪, 突击步枪, DMR, 手枪, 霰弹枪, SMG, 栓动式步枪, 机枪, 榴弹发射器])
        //var 每日枪械池 = createArrs([突击卡宾枪, 突击步枪, 手枪, 霰弹枪, SMG, 特殊武器])
        //var 每周枪械池 = createArrs([突击卡宾枪, 突击步枪, 霰弹枪, SMG, 栓动式步枪, 机枪, 特殊武器])
        //var 每月枪械池 = createArrs([突击步枪, 栓动式步枪, DMR, 机枪, 榴弹发射器, 特殊武器])
        var 每日枪械池 = []
        var 每周枪械池 = []
        var 每月枪械池 = []
        var 每日枪械池Cache = []
        var 每周枪械池Cache = []
        var 每月枪械池Cache = []
        const 交换用品 = createArrs([其他, 医疗物资, 家居用品, 工具, 建筑材料, 易燃物品, 电子产品, 能源物品, 情报物品, 贵重物品])
        const 药丸 = CreateArrWithTag("5b47574386f77428ca22b337")//药丸
        convertWponArr(generateWeapon(DrawObjFromArr(突击卡宾枪), 60, "DebugAttachment1"), DebugAttachment)
        //构建带有条件的数组(比如高级护甲, 大容量背包)
        //防弹胸挂
        vulcanAPI.debug("开始构建奖励池....")
        for (var i = 0; i < TacticalVestArr.length; i++) {
            if (isArmor(TacticalVestArr[i]._tpl)) {
                防弹胸挂.push(TacticalVestArr[i])
            }
        }
        //普通胸挂
        for (var i = 0; i < TacticalVestArr.length; i++) {
            if (isTac(TacticalVestArr[i]._tpl)) {
                普通胸挂.push(TacticalVestArr[i])
            }
        }
        //全护甲初始化
        for (var i = 0; i < ArmorArr.length; i++) {
            if (isArmor(ArmorArr[i]._tpl)) {
                甲.push(ArmorArr[i]._tpl)
            }
        }
        for (var i = 0; i < TacticalVestArr.length; i++) {
            if (isArmor(TacticalVestArr[i]._tpl)) {
                甲.push(TacticalVestArr[i]._tpl)
            }
        }
        //新版护甲初始化 // 1.30.2025
        for (var i = 0; i < 甲.length; i++) {
            if (checkArmorLevel(甲[i], 5)) {
                五六级甲.push(甲[i])
            }
            else {
                四级甲.push(甲[i])
            }
        }
        //背包
        for (var i = 0; i < 背包.length; i++) {
            if (getBackpackSize(背包[i]._tpl) < 30) {
                小背包.push(背包[i])
            }
            if (getBackpackSize(背包[i]._tpl) >= 30) {
                大背包.push(背包[i])
            }
        }
        //子弹
        for (var i = 0; i < 子弹大类.length; i++) {
            if (getAmmoData(子弹大类[i]._tpl) < 50 && getAmmoData(子弹大类[i]._tpl) >= 20) {
                四穿.push(子弹大类[i])
            }
            if (getAmmoData(子弹大类[i]._tpl) >= 50) {
                高穿.push(子弹大类[i])
            }
        }
        var RewardMap = {
            贵重物品: 贵重物品,
            其他: 其他,
            医疗物资: 医疗物资,
            家居用品: 家居用品,
            工具: 工具,
            建筑材料: 建筑材料,
            易燃物品: 易燃物品,
            电子产品: 电子产品,
            能源物品: 能源物品,
            情报物品: 情报物品,
            //交换品总表
            交换用品: 交换用品,
            //医疗
            医疗包: 医疗包,
            注射器: 注射器,
            药丸: 药丸,
            //武器
            突击卡宾枪: 突击卡宾枪,
            特殊武器: 特殊武器,
            突击步枪: 突击步枪,
            DMR: DMR,
            手枪: 手枪,
            霰弹枪: 霰弹枪,
            SMG: SMG,
            栓动式步枪: 栓动式步枪,
            机枪: 机枪,
            榴弹发射器: 榴弹发射器,
            投掷物: 投掷物,
            //武器总表
            总枪械池: 总枪械池,
            //吃喝
            食品: 食品,
            饮料: 饮料,
            //装备
            小背包: 小背包,
            大背包: 大背包,
            五六级甲: 五六级甲,
            四级甲: 四级甲,
            普通胸挂: 普通胸挂,
            容器: 容器,
            //枪械池
            每日枪械池: {},
            每周枪械池: {},
            每月枪械池: {},
            //弹药
            四穿: 四穿,
            高穿: 高穿,
        }
        //枪械池初始化
        for (var i = 0; i < GunPool.DailyGun.length; i++) {
            每日枪械池Cache.push(RewardMap[GunPool.DailyGun[i]])
        }
        for (var i = 0; i < GunPool.WeeklyGun.length; i++) {
            每周枪械池Cache.push(RewardMap[GunPool.WeeklyGun[i]])
        }
        for (var i = 0; i < GunPool.MonthlyGun.length; i++) {
            每月枪械池Cache.push(RewardMap[GunPool.MonthlyGun[i]])
        }
        每日枪械池 = createArrs(每日枪械池Cache)
        每周枪械池 = createArrs(每周枪械池Cache)
        每月枪械池 = createArrs(每月枪械池Cache)
        //添加到索引表
        RewardMap.每日枪械池 = 每日枪械池
        RewardMap.每周枪械池 = 每周枪械池
        RewardMap.每月枪械池 = 每月枪械池
        //从数组中抽取随机元素
        var DailyMessageArr = [
            "SystemMessageDaily1",
            "SystemMessageDaily2",
            "SystemMessageDaily3",
            "SystemMessageDaily4",
            "SystemMessageDaily5",
            "SystemMessageDaily6",
            "SystemMessageDaily7",
            "SystemMessageDaily8",
            "SystemMessageDaily9",
            "SystemMessageDaily10",
            "SystemMessageDaily11",
            "SystemMessageDaily12",
            "SystemMessageDaily13",
            "SystemMessageDaily14"
        ]
        var WeeklyMessageArr = [
            "SystemMessageWeekly1",
            "SystemMessageWeekly2",
            "SystemMessageWeekly3",
            "SystemMessageWeekly4",
            "SystemMessageWeekly5",
            "SystemMessageWeekly6"
        ]
        var MonthlyMessageArr = [
            "SystemMessageMonthly1",
            "SystemMessageMonthly2",
            "SystemMessageMonthly3",
            "SystemMessageMonthly4",
            "SystemMessageMonthly5"
        ]
        var DailyMessageID = DrawObjFromArr(DailyMessageArr)
        var WeeklyMessageID = DrawObjFromArr(WeeklyMessageArr)
        var MonthlyMessageID = DrawObjFromArr(MonthlyMessageArr)
        var SpecialDaysStr = ""
        const newSpecialDays = {
            fixed: {
                "情人节": { month: 2, day: 14 },
                "公历新年": { month: 1, day: 1 },
                "圣诞节": { month: 12, day: 25 },
                "万圣节": { month: 10, day: 31 },
            },
            dynamic: {
                "感恩节": [[11, 27, 2025], [11, 26, 2026], [11, 25, 2027], [11, 23, 2028], [11, 22, 2029], [11, 28, 2030]],
                "母亲节": [[5, 11, 2025], [5, 10, 2026], [5, 9, 2027], [5, 14, 2028], [5, 13, 2029], [5, 12, 2030]]
            }
        }
        //节日运算部分
        for (let date in newSpecialDays.fixed) {
            if (now.getMonth() + 1 === newSpecialDays.fixed[date].month && now.getDate() === newSpecialDays.fixed[date].day) {
                SpecialDaysStr = date
            }
        }
        for (let date in newSpecialDays.dynamic) {
            for (let i = 0; i < newSpecialDays.dynamic[date].length; i++) {
                if (now.getMonth() + 1 === newSpecialDays.dynamic[date][i][0] && now.getDate() === newSpecialDays.dynamic[date][i][1] && now.getFullYear() === newSpecialDays.dynamic[date][i][2]) {
                    SpecialDaysStr = date
                }
            }
        }
        //判定节日
        var specialDays = { mailkey: "", itempack: [], maxstoragetime: Config.CoreModule.SystemGift.Config.GiftData.Special.StorageMaxTime }
        switch (SpecialDaysStr) {
            case "情人节": {
                specialDays.mailkey = "SystemMessageFirstLoginWithValentine"
                initRewardPack(节日奖励, Config.CoreModule.SystemGift.Config.GiftData.Special[SpecialDaysStr])
                vulcanAPI.debug("初始化节日奖励-情人节")
                specialDays.itempack = 节日奖励
            }
                break
            case "圣诞节": {
                specialDays.mailkey = "SystemMessageFirstLoginWithChristmas"
                initRewardPack(节日奖励, Config.CoreModule.SystemGift.Config.GiftData.Special[SpecialDaysStr])
                specialDays.itempack = 节日奖励
                vulcanAPI.debug("初始化节日奖励-圣诞节")
            }
                break
            case "感恩节": {
                specialDays.mailkey = "SystemMessageFirstLoginWithThxgvngDay"
                initRewardPack(节日奖励, Config.CoreModule.SystemGift.Config.GiftData.Special[SpecialDaysStr])
                specialDays.itempack = 节日奖励
                vulcanAPI.debug("初始化节日奖励-感恩节")
            }
                break
            case "母亲节": {
                specialDays.mailkey = "SystemMessageFirstLoginWithMothersDay"
                initRewardPack(节日奖励, Config.CoreModule.SystemGift.Config.GiftData.Special[SpecialDaysStr])
                specialDays.itempack = 节日奖励
                vulcanAPI.debug("初始化节日奖励-母亲节")
            }
                break
            case "公历新年": {
                specialDays.mailkey = "SystemMessageFirstLoginWithNewYear"
                initRewardPack(节日奖励, Config.CoreModule.SystemGift.Config.GiftData.Special[SpecialDaysStr])
                specialDays.itempack = 节日奖励
                vulcanAPI.debug("初始化节日奖励-公历新年")
            }
                break
            case "万圣节": {
                specialDays.mailkey = "SystemMessageFirstLoginWithHalloween"
                initRewardPack(节日奖励, Config.CoreModule.SystemGift.Config.GiftData.Special[SpecialDaysStr])
                specialDays.itempack = 节日奖励
                vulcanAPI.debug("初始化节日奖励-万圣节")
            }
                break
            default: {
                if (timer[sessionId].count >= 30 && timer[sessionId].count % 30 == 0) {
                    specialDays.mailkey = MonthlyMessageID
                    initRewardPack(每月奖励, Config.CoreModule.SystemGift.Config.GiftData.MonthlyGiftData)
                    specialDays.itempack = 每月奖励
                    vulcanAPI.debug("初始化每月奖励")
                    specialDays.maxstoragetime = Config.CoreModule.SystemGift.Config.GiftData.MonthlyGiftData.StorageMaxTime
                }
                else if (timer[sessionId].count >= 7 && timer[sessionId].count % 7 == 0) {
                    specialDays.mailkey = WeeklyMessageID
                    initRewardPack(每周奖励, Config.CoreModule.SystemGift.Config.GiftData.WeeklyGiftData)
                    specialDays.itempack = 每周奖励
                    vulcanAPI.debug("初始化每周奖励")
                    specialDays.maxstoragetime = Config.CoreModule.SystemGift.Config.GiftData.WeeklyGiftData.StorageMaxTime
                }
                else {
                    specialDays.mailkey = DailyMessageID
                    initRewardPack(每日奖励, Config.CoreModule.SystemGift.Config.GiftData.DailyGiftData)
                    specialDays.itempack = 每日奖励
                    vulcanAPI.debug("初始化每日奖励")
                    specialDays.maxstoragetime = Config.CoreModule.SystemGift.Config.GiftData.DailyGiftData.StorageMaxTime
                }
            }
        }
        if (!firstlogin) {
            vulcanAPI.debug("邮件设置为正常登陆")
            specialDays.mailkey = specialDays.mailkey.replace("FirstLogin", "").replace("With", "")
        }
        else {
            if (SpecialDaysStr != "") {
                vulcanAPI.debug("邮件设置为第一次节日登陆")
            }
            else {
                specialDays.mailkey = "SystemMessageFirstLogin"
                vulcanAPI.debug("邮件设置为第一次登陆")
            }
        }
        sentMailAndConsoleMassage(sessionId, specialDays.mailkey, specialDays.itempack, [], specialDays.maxstoragetime)
        vulcanAPI.debug("补给发送成功")
        vulcanAPI.writeFile(`${modDBPath}timer.json`, JSON.stringify(timer, null, 4))
    }
};