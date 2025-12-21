using Microsoft.AspNetCore.Http.HttpResults;
using SPTarkov.DI.Annotations;
using SPTarkov.Server.Core.DI;
using SPTarkov.Server.Core.Generators;
using SPTarkov.Server.Core.Helpers;
using SPTarkov.Server.Core.Models.Logging;
using SPTarkov.Server.Core.Models.Spt.Mod;
using SPTarkov.Server.Core.Models.Utils;
using SPTarkov.Server.Core.Routers;
using SPTarkov.Server.Core.Servers;
using SPTarkov.Server.Core.Services;
using SPTarkov.Server.Core.Services.Mod;
using SPTarkov.Server.Core.Utils;
using SPTarkov.Server.Core.Utils.Cloners;
using SPTarkov.Reflection.Patching;
using System.Reflection;
using VulcanCore;
using SPTarkov.Server.Core.Models.Common;
using SPTarkov.Server.Core.Models.Eft.Common.Tables;
using SPTarkov.Server.Core.Models.Spt.Bots;
using HarmonyLib;
using SPTarkov.Server.Core.Models.Eft.Bot;
using SPTarkov.Server.Core.Models.Spt.Config;
using SPTarkov.Server.Core.Models.Eft.Common;
using SPTarkov.Server.Core.Models.Eft.ItemEvent;
using SPTarkov.Server.Core.Models.Eft.Match;
using System.Text.Json.Serialization;
using System.Text.Json;
using SPTarkov.Server.Core.Models.Enums;
using SPTarkov.Server.Core.Models.Eft.Game;
namespace VulcanInfinity;
public class ScriptTrainer
{
    public static ConfigClass modConfig = ConfigManager.GetConfig();
    public static void Init(
        ISptLogger<VulcanCore.VulcanCore> logger,
        DatabaseService databaseService,
        ICloner cloner,
        ConfigServer configServer
        )
    {
        //trainer开写
        var trainer = modConfig.Module.CoreModule.ScriptTrainer;
        var trainerConfig = trainer.Config;
        var globalConfig = databaseService.GetGlobals().Configuration;
        var lootConfig = configServer.GetConfig<LocationConfig>();
        var deathConfig = configServer.GetConfig<LostOnDeathConfig>();
        //if(trainerConfig.)
        if (trainerConfig.Ragfair.EnableOfferCountEdit)
        {
            VulcanLog.Log($"当前跳蚤市场可用报价单数量: {trainerConfig.Ragfair.OfferCount}", logger);
            SetRagfairOffersCount(globalConfig, trainerConfig);
        }
        VulcanLog.Log($"当前跳蚤市场手续费系数: {trainerConfig.Ragfair.OfferPriceRate}x", logger);
        SetRagfairRate(globalConfig, trainerConfig);
        var ragfairlevel = trainerConfig.Ragfair.RagfairLevel;
        VulcanLog.Log($"当前跳蚤市场解锁等级: {ragfairlevel}", logger);
        globalConfig.RagFair.MinUserLevel = ragfairlevel;
        if (trainerConfig.Skill.EnableSkillSpeedEdit)
        {
            var skillspeed = trainerConfig.Skill.SkillSpeed;
            VulcanLog.Log($"当前技能升级速度: {skillspeed}x", logger);
            globalConfig.SkillsSettings.SkillProgressRate *= skillspeed;
            globalConfig.SkillsSettings.WeaponSkillProgressRate *= skillspeed;
        }
        if (trainerConfig.Skill.RemoveSkillFatigue)
        {
            VulcanLog.Log($"已移除技能疲劳惩罚", logger);
            RemoveSkillFatigue(globalConfig);
        }
        if (trainerConfig.Global.RemoveFencePunish)
        {
            VulcanLog.Log($"已移除黑商好感惩罚", logger);
            RemoveFencePunish(globalConfig, cloner);
        }
        if (trainerConfig.Global.RemoveScavCD)
        {
            VulcanLog.Log($"已移除Scav模式CD", logger);
            globalConfig.SavagePlayCooldown = 0;
            globalConfig.SavagePlayCooldownDevelop = 0;
            globalConfig.SavagePlayCooldownNdaFree = 0;
        }
        if (trainerConfig.Global.RemoveQuestCD)
        {
            VulcanLog.Log($"已移除任务CD", logger);
            RemoveQuestCD(databaseService);
        }
        if (trainerConfig.Global.EnableFreeHealing)
        {
            VulcanLog.Log($"已启用免费治疗", logger);
            globalConfig.Health.HealPrice.HealthPointPrice = 0;
            globalConfig.Health.HealPrice.TrialRaids = 99999999;
            globalConfig.Health.HealPrice.TrialLevels = 100;
        }
        if (trainerConfig.Global.EnableFeatherFall)
        {
            VulcanLog.Log($"已启用摔落保护", logger);
            globalConfig.Health.Falling.DamagePerMeter = 0;
            globalConfig.Health.Falling.SafeHeight = 99999999;
        }
        if (trainerConfig.Global.EnableEasyExercise)
        {
            VulcanLog.Log($"已启用简单健身", logger);
            EnableEasyExercise(databaseService, cloner);
        }
        if (trainerConfig.Global.EnableAllExitPoint)
        {
            VulcanLog.Log($"已开放所有撤离点", logger);
            EnableAllExitPoint(databaseService);
        }
        if (trainerConfig.Global.SetExitPointAlwaysAvaiable)
        {
            VulcanLog.Log($"已激活所有撤离点", logger);
            SetExitPointAlwaysAvaiable(databaseService);
        }
        globalConfig.RepairSettings.MinimumLevelToApplyBuff = trainerConfig.Global.EnchantMinSkillLevel;
        var lootrate = trainerConfig.Global.LootRate;
        VulcanLog.Log($"当前物资倍率: {lootrate}x", logger);
        foreach (var location in lootConfig.LooseLootMultiplier)
        {
            lootConfig.LooseLootMultiplier[location.Key] = location.Value * lootrate;
        }
        if (trainerConfig.Global.EnableKeepInventory)
        {
            VulcanLog.Log($"死亡不掉落开启中", logger);
            deathConfig.Equipment.ArmBand = false;
            deathConfig.Equipment.Headwear = false;
            deathConfig.Equipment.Earpiece = false;
            deathConfig.Equipment.FaceCover = false;
            deathConfig.Equipment.ArmorVest = false;
            deathConfig.Equipment.Eyewear = false;
            deathConfig.Equipment.TacticalVest = false;
            deathConfig.Equipment.PocketItems = false;
            deathConfig.Equipment.Backpack = false;
            deathConfig.Equipment.Holster = false;
            deathConfig.Equipment.FirstPrimaryWeapon = false;
            deathConfig.Equipment.SecondPrimaryWeapon = false;
            deathConfig.Equipment.Scabbard = false;
            deathConfig.Equipment.Compass = false;
            deathConfig.Equipment.SecuredContainer = false;
            deathConfig.QuestItems = false;
        }
        if (trainerConfig.Global.EnableAmmoInsurance)
        {
            VulcanLog.Log($"已启用子弹投保", logger);
            EnableAmmoInsurance(databaseService);
        }
        if (trainerConfig.Global.RemoveAmmoWeight)
        {
            VulcanLog.Log($"已消除子弹重量", logger);
            RemoveAmmoWeight(databaseService);
        }
        SetAIChance(databaseService, trainerConfig, configServer);
        SetItemStackMutiple(databaseService, trainerConfig);
        VulcanLog.Log($"当前弹药堆叠倍率: {trainerConfig.Global.AmmoStackMutiple}x", logger);
        VulcanLog.Log($"当前卢布堆叠倍率: {trainerConfig.Global.RubsStackMutiple}x", logger);
        VulcanLog.Log($"当前美元&欧元堆叠倍率: {trainerConfig.Global.DollarAndEuroStackMutiple}x", logger);
        VulcanLog.Log($"当前GP币堆叠倍率: {trainerConfig.Global.GPCoinsStackMutiple}x", logger);
        if (trainerConfig.AISpawn.Boss.Active)
        {
            VulcanLog.Log($"当前Boss刷新率: {trainerConfig.AISpawn.Boss.Chance}%", logger);
        }
        if (trainerConfig.AISpawn.PMC.Active)
        {
            VulcanLog.Log($"当前Bear刷新率: {trainerConfig.AISpawn.PMC.BearChance}%", logger);
            VulcanLog.Log($"当前Usec刷新率: {trainerConfig.AISpawn.PMC.UsecChance}%", logger);
        }
        if (trainerConfig.AISpawn.Sectant.Active)
        {
            VulcanLog.Log($"当前邪教徒刷新率: {trainerConfig.AISpawn.Sectant.Chance}%", logger);
        }
        if (trainerConfig.AISpawn.EnableBlackList)
        {
            VulcanLog.Log($"已阻止部分AI生成", logger);
        }
        if (trainerConfig.AISpawn.EnableNoobMode)
        {
            SetNoobMode(databaseService, trainerConfig, cloner);
            VulcanLog.Log($"已启用菜鸟模式", logger);
        }
        if (trainerConfig.AISpawn.EnableShareMode)
        {
            SetShareMode(databaseService, trainerConfig, cloner);
            VulcanLog.Log($"已启用共享模式", logger);
        }
        if (trainerConfig.AISpawn.EnablePeacefulMode)
        {
            SetPeacefulMode(databaseService, trainerConfig, cloner);
            VulcanLog.Log($"已启用和平模式", logger);
        }

        if (trainerConfig.Global.ForceUnlockAssort)
        {
            VulcanLog.Log($"已解锁所有商人报价单", logger);
            ForcedUnlockAssort(databaseService);
        }
        if (trainerConfig.Global.RemoveTraderStandingRequire)
        {
            VulcanLog.Log($"已移除商人好感度需求", logger);
            RemoveAllTraderStandingRequire(databaseService);
        }
        if (trainerConfig.Global.RemoveTraderMoneyRequire)
        {
            VulcanLog.Log($"已移除商人交易额需求", logger);
            RemoveAllTraderMoneyRequire(databaseService);
        }

    }
    public static void SetRagfairOffersCount(Config globalConfig, ScriptTrainerConfigClass trainerConfig)
    {
        foreach (var offersettings in globalConfig.RagFair.MaxActiveOfferCount)
        {
            offersettings.Count = trainerConfig.Ragfair.OfferCount;
            offersettings.CountForSpecialEditions = trainerConfig.Ragfair.OfferCount;
        }
    }
    public static void SetRagfairRate(Config globalConfig, ScriptTrainerConfigClass trainerConfig)
    {
        globalConfig.RagFair.CommunityItemTax = trainerConfig.Ragfair.OfferPriceRate;
        globalConfig.RagFair.CommunityRequirementTax = trainerConfig.Ragfair.OfferPriceRate;
        globalConfig.RagFair.CommunityTax = trainerConfig.Ragfair.OfferPriceRate;
    }
    public static void RemoveSkillFatigue(Config globalConfig)
    {
        globalConfig.SkillFatiguePerPoint = 0;
        globalConfig.SkillMinEffectiveness = 1;
    }
    public static void RemoveFencePunish(Config globalConfig, ICloner cloner)
    {
        var best = cloner.Clone(globalConfig.FenceSettings.Levels[6]);
        var newlevel = new Dictionary<double, FenceLevel>();
        foreach (var level in globalConfig.FenceSettings.Levels)
        {
            newlevel.TryAdd(level.Key, best);
        }
        globalConfig.FenceSettings.Levels.Clear();
        globalConfig.FenceSettings.Levels = newlevel;
    }
    public static void SetExitPointAlwaysAvaiable(DatabaseService databaseService)
    {
        var getedlocations = databaseService.GetLocations();
        var locations = new List<SPTarkov.Server.Core.Models.Eft.Common.Location> {
                getedlocations.Bigmap,
                getedlocations.Woods,
                getedlocations.Factory4Day,
                getedlocations.Factory4Night,
                getedlocations.Laboratory,
                getedlocations.Shoreline,
                getedlocations.RezervBase,
                getedlocations.Interchange,
                getedlocations.Lighthouse,
                getedlocations.TarkovStreets,
                getedlocations.Sandbox,
                getedlocations.SandboxHigh
            };
        foreach (var location in locations)
        {
            if (location.Base != null)
            {
                var exitpointlist = location.Base.Exits;
                foreach (var exitpoint in exitpointlist)
                {
                    exitpoint.Chance = 100;
                    exitpoint.ChancePVE = 100;
                }
            }
        }
    }
    public static void EnableAllExitPoint(DatabaseService databaseService)
    {
        var getedlocations = databaseService.GetLocations();
        var locations = new List<SPTarkov.Server.Core.Models.Eft.Common.Location> {
                getedlocations.Bigmap,
                getedlocations.Woods,
                getedlocations.Factory4Day,
                getedlocations.Factory4Night,
                getedlocations.Laboratory,
                getedlocations.Shoreline,
                getedlocations.RezervBase,
                getedlocations.Interchange,
                getedlocations.Lighthouse,
                getedlocations.TarkovStreets,
                getedlocations.Sandbox,
                getedlocations.SandboxHigh
            };
        foreach (var location in locations)
        {
            var exitstringlist = new HashSet<string>();
            var exitstring = "";
            var map = location.Base;
            if (map == null) continue;
            if (map.Exits.Count() > 0)
            {
                foreach (var exitpoint in map.Exits)
                {
                    var entry = exitpoint.EntryPoints;
                    if (entry == null) continue;
                    var cachestring = entry.Split(',');
                    foreach (var exitname in cachestring)
                    {
                        exitstringlist.Add(exitname);
                    }
                }
                exitstring = string.Join(",", exitstringlist);
                foreach (var exitpoint in map.Exits)
                {
                    var entry = exitpoint.EntryPoints;
                    if (entry == null) continue;
                    exitpoint.EntryPoints = exitstring;
                }
            }
        }
    }
    public static void SetAIChance(DatabaseService databaseService, ScriptTrainerConfigClass trainerConfig, ConfigServer configServer)
    {
        var getedlocations = databaseService.GetLocations();
        var locations = new List<SPTarkov.Server.Core.Models.Eft.Common.Location> {
                getedlocations.Bigmap,
                getedlocations.Woods,
                getedlocations.Factory4Day,
                getedlocations.Factory4Night,
                getedlocations.Laboratory,
                getedlocations.Shoreline,
                getedlocations.RezervBase,
                getedlocations.Interchange,
                getedlocations.Lighthouse,
                getedlocations.TarkovStreets,
                getedlocations.Sandbox,
                getedlocations.SandboxHigh
            };
        var botConfig = configServer.GetConfig<BotConfig>();
        var botlist = new List<string>
        {
            "bossPartisan",
                "bossKnight",
                "bossBully",
                "bossBoar",
                "bossTagilla",
                "bossTagillaAgro",
                "bossKilla",
                "bossKillaAgro",
                "bossKojaniy",
                "bossSanitar",
                "bossKolontay",
                "bossGluhar"
        };
        foreach (var location in locations)
        {
            var map = location.Base;
            if (map == null) continue;
            var bosslist = map.BossLocationSpawn;
            if (bosslist == null) continue;
            foreach (var boss in bosslist)
            {
                if (boss == null) continue;
                if (trainerConfig.AISpawn.Boss.Active)
                {
                    if (botlist.Contains(boss.BossName) && boss.BossChance!= 100 && boss.BossChance != 0)
                    {
                        boss.BossChance = trainerConfig.AISpawn.Boss.Chance;
                    }
                    botConfig.GoonSpawnSystem.SpawnChance = trainerConfig.AISpawn.Boss.Chance;
                }
                if (trainerConfig.AISpawn.PMC.Active)
                {
                    if (boss.BossName == "pmcBEAR")
                    {
                        boss.BossChance = trainerConfig.AISpawn.PMC.BearChance;
                    }
                    if (boss.BossName == "pmcUSEC")
                    {
                        boss.BossChance = trainerConfig.AISpawn.PMC.UsecChance;
                    }
                }
                if (trainerConfig.AISpawn.Sectant.Active)
                {
                    if (boss.BossName == "sectantPriest")
                    {
                        boss.BossChance = trainerConfig.AISpawn.Sectant.Chance;
                    }
                }
                if (trainerConfig.AISpawn.EnableBlackList)
                {
                    if (trainerConfig.AISpawn.BlackList.Contains(boss.BossName))
                    {
                        boss.BossChance = 0;
                    }
                }
            }
        }
    }
    public static void ForcedUnlockAssort(DatabaseService databaseService)
    {
        var traders = databaseService.GetTraders();
        foreach (var trader in traders.Values)
        {
            var questassort = trader.QuestAssort;
            if (questassort == null) continue;
            questassort = new Dictionary<string, Dictionary<MongoId, MongoId>>();
            questassort.TryAdd("started", new Dictionary<MongoId, MongoId>());
            questassort.TryAdd("success", new Dictionary<MongoId, MongoId>());
            questassort.TryAdd("fail", new Dictionary<MongoId, MongoId>());
        }
    }
    public static void RemoveAllTraderStandingRequire(DatabaseService databaseService)
    {
        var traders = databaseService.GetTraders();
        foreach (var trader in traders.Values)
        {
            var traderbase = trader.Base;
            if (traderbase == null) continue;
            var llr = traderbase.LoyaltyLevels;
            if (llr == null) continue;
            foreach (var level in llr)
            {
                level.MinStanding = 0;
            }
        }
    }
    public static void RemoveAllTraderMoneyRequire(DatabaseService databaseService)
    {
        var traders = databaseService.GetTraders();
        foreach (var trader in traders.Values)
        {
            var traderbase = trader.Base;
            if (traderbase == null) continue;
            var llr = traderbase.LoyaltyLevels;
            if (llr == null) continue;
            foreach (var level in llr)
            {
                level.MinSalesSum = 0;
            }
        }
    }
    public static void EnableAmmoInsurance(DatabaseService databaseService)
    {
        var items = databaseService.GetItems();
        foreach (var item in items.Values)
        {
            var itemid = item.Id;
            var itemtag = ItemUtils.GetItemRagfairTag(itemid, databaseService);
            if (itemtag == null) continue;
            if (itemtag == ERagfairTagsType.子弹 || itemtag == ERagfairTagsType.弹药包)
            {
                item.Properties.InsuranceDisabled = false;
                item.Properties.IsAlwaysAvailableForInsurance = true;
            }
        }
    }
    public static void RemoveAmmoWeight(DatabaseService databaseService)
    {
        var items = databaseService.GetItems();
        foreach (var item in items.Values)
        {
            var itemid = item.Id;
            var itemtag = ItemUtils.GetItemRagfairTag(itemid, databaseService);
            if (itemtag == null) continue;
            if (itemtag == ERagfairTagsType.子弹 || itemtag == ERagfairTagsType.弹药包)
            {
                item.Properties.Weight = 0;
            }
        }
    }
    public static void SetItemStackMutiple(DatabaseService databaseService, ScriptTrainerConfigClass trainerConfig)
    {
        var items = databaseService.GetItems();
        foreach (var item in items.Values)
        {
            var itemid = item.Id;
            if (itemid == Money.ROUBLES)
            {
                item.Properties.StackMaxSize = (int)(item.Properties.StackMaxSize * trainerConfig.Global.RubsStackMutiple);
            }
            if (itemid == Money.DOLLARS || itemid == Money.EUROS)
            {
                item.Properties.StackMaxSize = (int)(item.Properties.StackMaxSize * trainerConfig.Global.DollarAndEuroStackMutiple);
            }
            if (itemid == Money.GP)
            {
                item.Properties.StackMaxSize = (int)(item.Properties.StackMaxSize * trainerConfig.Global.GPCoinsStackMutiple);
            }
            var itemtag = ItemUtils.GetItemRagfairTag(itemid, databaseService);
            if (itemtag == null) continue;
            if (itemtag == ERagfairTagsType.子弹)
            {
                item.Properties.StackMaxSize = (int)(item.Properties.StackMaxSize * trainerConfig.Global.AmmoStackMutiple);
            }
            if (itemtag == ERagfairTagsType.弹药包)
            {
                var filter = item.Properties.StackSlots.First();
                if (filter == null) continue;
                filter.MaxCount = (int)(filter.MaxCount * trainerConfig.Global.AmmoStackMutiple);
            }
        }
    }
    public static void SetPeacefulMode(DatabaseService databaseService, ScriptTrainerConfigClass trainerConfig, ICloner cloner)
    {
        var bots = databaseService.GetBots().Types;
        bots.TryGetValue("shooterbtr", out var shooterbtr);
        if (shooterbtr != null)
        {
            shooterbtr.BotDifficulty.TryGetValue("easy", out var difficult);
            if (difficult != null)
            {
                var peacefulcore = cloner.Clone(difficult);
                foreach (var bot in bots)
                {
                    if (bot.Value == null || bot.Value.BotDifficulty == null) continue;
                    foreach (var key in bot.Value.BotDifficulty.Keys.ToList())
                    {
                        // 为每个键值对的值赋新值
                        bot.Value.BotDifficulty[key] = peacefulcore;
                    }
                }
            }
        }
    }
    public static void SetShareMode(DatabaseService databaseService, ScriptTrainerConfigClass trainerConfig, ICloner cloner)
    {
        var bots = databaseService.GetBots().Types;
        bots.TryGetValue("shooterbtr", out var shooterbtr);
        if (shooterbtr != null)
        {
            shooterbtr.BotDifficulty.TryGetValue("easy", out var difficult);
            if (difficult != null)
            {
                var peacefulcore = cloner.Clone(difficult);
                bots.TryGetValue("pmcbear", out var pmcbear);
                bots.TryGetValue("pmcusec", out var pmcusec);
                bots.TryGetValue("bear", out var bear);
                bots.TryGetValue("usec", out var usec);
                if (pmcbear != null && pmcbear.BotDifficulty != null)
                {
                    foreach (var key in pmcbear.BotDifficulty.Keys.ToList())
                    {
                        // 为每个键值对的值赋新值
                        pmcbear.BotDifficulty[key] = peacefulcore;
                    }
                }
                if (bear != null && bear.BotDifficulty != null)
                {
                    foreach (var key in bear.BotDifficulty.Keys.ToList())
                    {
                        // 为每个键值对的值赋新值
                        bear.BotDifficulty[key] = peacefulcore;
                    }
                }
                if (pmcusec != null && pmcusec.BotDifficulty != null)
                {
                    foreach (var key in pmcusec.BotDifficulty.Keys.ToList())
                    {
                        // 为每个键值对的值赋新值
                        pmcusec.BotDifficulty[key] = peacefulcore;
                    }
                }
                if (usec != null && usec.BotDifficulty != null)
                {
                    foreach (var key in usec.BotDifficulty.Keys.ToList())
                    {
                        // 为每个键值对的值赋新值
                        usec.BotDifficulty[key] = peacefulcore;
                    }
                }
            }
        }
    }
    public static void SetNoobMode(DatabaseService databaseService, ScriptTrainerConfigClass trainerConfig, ICloner cloner)
    {
        var bots = databaseService.GetBots().Types;
        foreach (var bot in bots)
        {
            if (bot.Value == null || bot.Value.BotDifficulty == null || bot.Key == "shooterbtr") continue;
            foreach (var difficulty in bot.Value.BotDifficulty.Values)
            {
                //difficulty.Aiming.AimingType = 4;
                //difficulty.Aiming.AnyPartShootTime = 3;
                //difficulty.Aiming.BaseHitAffectionDelaySec = 17.7f;
                difficulty.Aiming.BaseHitAffectionMinAng = 180;
                difficulty.Aiming.BaseHitAffectionMaxAng = 360;
                difficulty.Aiming.BetterPrecicingCoef = 0.1f;
                difficulty.Aiming.HardAim = 0.1f;
                difficulty.Aiming.HardAimChance100 = 0;
                //difficulty.Aiming.MaxAimingUpgradeByTime = 64;
                difficulty.Aiming.MaxAimPrecicing = -1; ;
                difficulty.Shoot.ChanceToChangeToAutomaticFire100 = 0;
                difficulty.Look.FarDistance = 15;
                difficulty.Look.LightOnVisionDistance = 15;
                //difficulty.Core.VisibleAngle = 0.2f;
                //difficulty.Core.VisibleDistance = 0.2f;
                //difficulty.Core.GainSightCoef = 0.1;
                difficulty.Core.ScatteringPerMeter = 3;
                difficulty.Core.ScatteringClosePerMeter = 6;
                difficulty.Core.HearingSense = -1;
                difficulty.Core.AccuratySpeed = 4;
                difficulty.Scattering.MinScatter = 2;
                difficulty.Scattering.WorkingScatter = 4;
                difficulty.Scattering.MaxScatter = 5;
                difficulty.Core.WaitInCoverBetweenShotsSec = 15;
                //difficulty.Mind.DefaultBearBehaviour = SPTarkov.Server.Core.Models.Eft.Bot.GlobalSettings.BotGlobalsMindSettings.EWarnBehaviour.Warn;
                difficulty.Mind.DefaultSavageBehaviour = SPTarkov.Server.Core.Models.Eft.Bot.GlobalSettings.BotGlobalsMindSettings.EWarnBehaviour.AlwaysFriends;
                //difficulty.Mind.DefaultUsecBehaviour = SPTarkov.Server.Core.Models.Eft.Bot.GlobalSettings.BotGlobalsMindSettings.EWarnBehaviour.Warn;
            }
        }
    }
    public static void EnableEasyExercise(DatabaseService databaseService, ICloner cloner)
    {
        var qte = databaseService.GetHideout().Qte[0].QuickTimeEvents;
        if (qte != null)
        {
            var pattern = cloner.Clone(qte[0]);
            var count = qte.Count;
            qte.Clear();
            for (var i = 0; i < count; i++)
            {
                qte.Add(cloner.Clone(pattern));
            }
        }
    }
    public static void RemoveQuestCD(DatabaseService databaseService)
    {
        var quests = databaseService.GetQuests();
        foreach (var quest in quests.Values)
        {
            var start = quest.Conditions.AvailableForStart;
            if (start == null || start.Count == 0) continue;
            foreach (var condition in start)
            {
                if (condition.AvailableAfter == null) continue;
                condition.AvailableAfter = 0;
            }
        }
    }
}