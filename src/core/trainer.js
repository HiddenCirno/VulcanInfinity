"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initScriptTrainer = void 0;
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
const config_json_1 = __importDefault(require("../../config.json"));
//
const initScriptTrainer = (container) => {
    const vulcanAPI = container.resolve("VulcanCommon");
    const logger = container.resolve("WinstonLogger");
    const preSptModLoader = container.resolve("PreSptModLoader");
    const databaseServer = container.resolve("DatabaseServer");
    const jsonUtil = container.resolve("JsonUtil");
    const clientDB = databaseServer.getTables();
    const clientItem = databaseServer.getTables().templates.items;
    const clientHideout = clientDB.hideout.areas;
    const clientTrader = clientDB.traders;
    const configServer = container.resolve("ConfigServer");
    const imageRouter = container.resolve("ImageRouter");
    const modPath = config_json_1.default.Global.ModPath;
    const modDB = vulcanAPI.loadRecursive(`${modPath}vulcanmod/`);
    var Therapist = "54cb57776803fa99248b456e";
    const imageFilepath = `./${modPath}vulcanmod/res/`;
    const iconList = vulcanAPI.getFiles(`${imageFilepath}questimage/`);
    const resourceLoaded = preSptModLoader.getImportedModsNames().includes("火神重工-资源包");
    const globalConfig = clientDB.globals.config;
    const scriptTrainerConfig = config_json_1.default.CoreModule.ScriptTrainer.Config;
    const lootConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.LOCATION);
    const deathConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.LOST_ON_DEATH);
    //vulcanAPI.Access(resourceLoaded)
    vulcanAPI.Access("启动核心系统: 万能辅助");
    vulcanAPI.Log("辅助程式开始预热，正在初始化引导程序……");
    vulcanAPI.waitForTime(2);
    vulcanAPI.fetchAsync().then(data => { }).catch(error => {
        if (scriptTrainerConfig.Ragfair.EnableOfferCountEdit) {
            vulcanAPI.Log(`当前可用报价单数量: ${scriptTrainerConfig.Ragfair.OfferCount}`);
            setRagfairOffersCount();
        }
        if (scriptTrainerConfig.Ragfair.EnableRateEdit) {
            vulcanAPI.Log(`当前手续费系数: ${scriptTrainerConfig.Ragfair.Rate}x`);
            serRagfairRate();
        }
        if (scriptTrainerConfig.Ragfair.EnableRagfairLevelEdit) {
            vulcanAPI.Log(`当前跳蚤市场启用等级: ${scriptTrainerConfig.Ragfair.RagfairLevel}级`);
            globalConfig.RagFair.minUserLevel = scriptTrainerConfig.Ragfair.RagfairLevel;
        }
        if (scriptTrainerConfig.Skill.EnableSkillSpeedEdit) {
            globalConfig.SkillsSettings.SkillProgressRate *= scriptTrainerConfig.Skill.SkillSpeed;
            globalConfig.SkillsSettings.WeaponSkillProgressRate *= scriptTrainerConfig.Skill.SkillSpeed;
            vulcanAPI.Log(`当前技能升级速度: ${scriptTrainerConfig.Skill.SkillSpeed}x`);
        }
        if (scriptTrainerConfig.Skill.RemoveSkillFatigue) {
            vulcanAPI.Log("已移除技能疲劳效果");
            removeSkillFatigue();
        }
        if (scriptTrainerConfig.Global.RemoveFencePunish) {
            vulcanAPI.Log("已移除黑商好感惩罚");
            removeFencePunish();
        }
        if (scriptTrainerConfig.Global.RemoveScavCD) {
            vulcanAPI.Log("已移除Scav模式CD");
            globalConfig.SavagePlayCooldown = 0;
            globalConfig.SavagePlayCooldownNdaFree = 0;
        }
        if (scriptTrainerConfig.Global.EnableFreeHealing) {
            vulcanAPI.Log("已启用免费治疗");
            globalConfig.Health.HealPrice.HealthPointPrice = 0;
            globalConfig.Health.HealPrice.TrialLevels = 99;
            globalConfig.Health.HealPrice.TrialRaids = 999999;
        }
        if (scriptTrainerConfig.Global.EnableFeatherFall) {
            vulcanAPI.Log("已启用摔落保护");
            globalConfig.Health.Falling.DamagePerMeter = 0;
            globalConfig.Health.Falling.SafeHeight = 999999;
        }
        if (scriptTrainerConfig.Global.EnableAllExtractPoint == true) {
            vulcanAPI.Log("已开放所有撤离点");
            enableAllExtractPoint();
        }
        if (scriptTrainerConfig.Global.SetExtractPointAlwaysAvaiable) {
            vulcanAPI.Log("已激活所有撤离点");
            setExtractPointAlwaysAvaiable();
        }
        //附魔效果 //不确定有没有用, 改了先, 实在不行可以说概率问题))
        globalConfig.RepairSettings.MinimumLevelToApplyBuff = scriptTrainerConfig.Global.EnchantMinSkillLevel;
        //还差Boss刷率和物资倍率
        vulcanAPI.Log(`当前物资倍率: ${scriptTrainerConfig.Global.LootRate}x`);
        for (let location in lootConfig.looseLootMultiplier) {
            lootConfig.looseLootMultiplier[location] *= scriptTrainerConfig.Global.LootRate;
        }
        if (scriptTrainerConfig.Global.EnableKeepInventory) {
            vulcanAPI.Log("死亡不掉落开启中");
            for (let key in deathConfig.equipment) {
                deathConfig.equipment[key] = false;
            }
            deathConfig.questItems = false;
        }
        setAIChance();
        if (scriptTrainerConfig.Global.EnableAmmoInsurance) {
            enableAmmoInsurance();
            vulcanAPI.Log("已启用子弹投保");
        }
        if (scriptTrainerConfig.AISpawn.Boss.Active) {
            vulcanAPI.Log(`当前Boss刷新率: ${scriptTrainerConfig.AISpawn.Boss.Chance}%`);
        }
        if (scriptTrainerConfig.AISpawn.PMC.Active) {
            vulcanAPI.Log(`当前Bear刷新率: ${scriptTrainerConfig.AISpawn.PMC.BearChance}%`);
            vulcanAPI.Log(`当前Usec刷新率: ${scriptTrainerConfig.AISpawn.PMC.UsecChance}%`);
        }
        if (scriptTrainerConfig.AISpawn.Sectant.Active) {
            vulcanAPI.Log(`当前邪教徒刷新率: ${scriptTrainerConfig.AISpawn.Sectant.Chance}%`);
        }
        if (scriptTrainerConfig.AISpawn.EnableBlackList) {
            vulcanAPI.Log("已阻止部分AI生成");
        }
        if (scriptTrainerConfig.Global.ForceUnlockAssort) {
            forcedUnlockAssort();
            vulcanAPI.Log("已解锁所有报价单");
        }
        if (scriptTrainerConfig.Global.RemoveTraderStandingRequire) {
            removeAllTraderRequireStanding();
            vulcanAPI.Log("已移除商人好感需求");
        }
    });
    function setRagfairOffersCount() {
        for (var i = 0; i < globalConfig.RagFair.maxActiveOfferCount.length; i++) {
            globalConfig.RagFair.maxActiveOfferCount[i].count = scriptTrainerConfig.Ragfair.OfferCount;
        }
    }
    function serRagfairRate() {
        globalConfig.RagFair.communityTax *= scriptTrainerConfig.Ragfair.Rate;
        globalConfig.RagFair.communityItemTax *= scriptTrainerConfig.Ragfair.Rate;
        globalConfig.RagFair.communityRequirementTax *= scriptTrainerConfig.Ragfair.Rate;
    }
    function removeSkillFatigue() {
        globalConfig.SkillFatiguePerPoint = 0;
        globalConfig.SkillMinEffectiveness = 1;
    }
    function removeFencePunish() {
        const best = vulcanAPI.deepCopy(globalConfig.FenceSettings.Levels["6"]);
        const newSettings = {};
        for (let level in globalConfig.FenceSettings.Levels) {
            newSettings[level] = best;
        }
        globalConfig.FenceSettings.Levels = {};
        globalConfig.FenceSettings.Levels = newSettings;
        //vulcanAPI.writeFile(`${modPath}export.json`,JSON.stringify(globalConfig.FenceSettings, null, 4))
        //vulcanAPI.Debug("导出数据成功")
        //妈的还是有bug
        //等会vulcanAPI导出下看看
    }
    function setExtractPointAlwaysAvaiable() {
        for (let map in clientDB.locations) {
            if (clientDB.locations[map].base != undefined) {
                var extarr = clientDB.locations[map].base.exits;
                if (extarr.length > 0) {
                    for (var i = 0; i < extarr.length; i++) {
                        extarr[i].Chance = 100;
                    }
                }
            }
        }
    }
    function enableAllExtractPoint() {
        for (let lt in clientDB.locations) {
            var ExitArr = [];
            var CacheStr = "";
            const Map = clientDB.locations[lt].base;
            if (Map != null) {
                if (Map.exits.length > 0) {
                    for (var i = 0; i < Map.exits.length; i++) {
                        if (CacheStr == "") {
                            CacheStr = Map.exits[i].EntryPoints;
                        }
                        else {
                            CacheStr = CacheStr + "," + Map.exits[i].EntryPoints;
                        }
                    }
                    var CacheArr = CacheStr.split(",");
                    for (var i = 0; i < CacheArr.length; i++) {
                        if (!(ExitArr.includes(CacheArr[i]))) {
                            ExitArr.push(CacheArr[i]);
                        }
                    }
                    var ExitStr = ExitArr.join(",");
                    for (var i = 0; i < Map.exits.length; i++) {
                        Map.exits[i].EntryPoints = ExitStr;
                        //CustomDenied(Map.exits[i].EntryPoints)
                    }
                }
                //var CacheArr = 
            }
        }
    }
    function setAIChance() {
        for (let map in clientDB.locations) {
            if (clientDB.locations[map].base != undefined) {
                var bossarr = clientDB.locations[map].base.BossLocationSpawn;
                if (bossarr.length > 0) {
                    if (scriptTrainerConfig.AISpawn.Boss.Active) {
                        bossarr.filter(x => scriptTrainerConfig.AISpawn.Boss.BossList.includes(x.BossName)).forEach(x => x.BossChance = scriptTrainerConfig.AISpawn.Boss.Chance);
                    }
                    if (scriptTrainerConfig.AISpawn.PMC.Active) {
                        bossarr.filter(x => x.BossName == "pmcBEAR").forEach(x => x.BossChance = scriptTrainerConfig.AISpawn.PMC.BearChance);
                        bossarr.filter(x => x.BossName == "pmcUSEC").forEach(x => x.BossChance = scriptTrainerConfig.AISpawn.PMC.UsecChance);
                    }
                    if (scriptTrainerConfig.AISpawn.Sectant.Active) {
                        bossarr.filter(x => x.BossName == "sectantPriest").forEach(x => x.BossChance = scriptTrainerConfig.AISpawn.Sectant.Chance);
                    }
                    if (scriptTrainerConfig.AISpawn.EnableBlackList) {
                        bossarr.filter(x => scriptTrainerConfig.AISpawn.BossBlackList.includes(x.BossName)).forEach(x => x.BossChance = 0);
                    }
                }
            }
        }
    }
    function forcedUnlockAssort() {
        for (let t in clientTrader) {
            const questassort = clientTrader[t].questassort;
            if (questassort) {
                if (questassort.success) {
                    questassort.started = {};
                    questassort.success = {};
                    questassort.fail = {};
                }
            }
        }
    }
    function removeAllTraderRequireStanding() {
        for (let t in clientTrader) {
            const base = clientTrader[t].base;
            if (base.loyaltyLevels.length > 0) {
                for (var l = 0; l < base.loyaltyLevels.length; l++) {
                    const level = base.loyaltyLevels[l];
                    level.minStanding = 0;
                }
            }
        }
    }
    function enableAmmoInsurance() {
        for (let i in clientItem) {
            const item = clientItem[i];
            const tag = vulcanAPI.getItemRagfairTag(item._id);
            if (tag == "5b47574386f77428ca22b33b") {
                //console.log(1)
                item._props.InsuranceDisabled = false;
                item._props.IsAlwaysAvailableForInsurance = true;
            }
        }
    }
};
exports.initScriptTrainer = initScriptTrainer;
//# sourceMappingURL=trainer.js.map