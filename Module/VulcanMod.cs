using HarmonyLib;
using Microsoft.AspNetCore.Http.HttpResults;
using SPTarkov.DI.Annotations;
using SPTarkov.Reflection.Patching;
using SPTarkov.Server.Core.DI;
using SPTarkov.Server.Core.Generators;
using SPTarkov.Server.Core.Helpers;
using SPTarkov.Server.Core.Models.Common;
using SPTarkov.Server.Core.Models.Eft.Bot;
using SPTarkov.Server.Core.Models.Eft.Common;
using SPTarkov.Server.Core.Models.Eft.Common.Tables;
using SPTarkov.Server.Core.Models.Eft.ItemEvent;
using SPTarkov.Server.Core.Models.Enums;
using SPTarkov.Server.Core.Models.Logging;
using SPTarkov.Server.Core.Models.Spt.Bots;
using SPTarkov.Server.Core.Models.Spt.Config;
using SPTarkov.Server.Core.Models.Spt.Mod;
using SPTarkov.Server.Core.Models.Utils;
using SPTarkov.Server.Core.Routers;
using SPTarkov.Server.Core.Servers;
using SPTarkov.Server.Core.Services;
using SPTarkov.Server.Core.Services.Mod;
using SPTarkov.Server.Core.Utils;
using SPTarkov.Server.Core.Utils.Cloners;
using System.Collections.Generic;
using System.Reflection;
using VulcanCore;
namespace VulcanInfinity;
public class VulcanMod
{
    public static ConfigClass modConfig = ConfigManager.GetConfig();
    public static void Init(
        ISptLogger<VulcanCore.VulcanCore> logger,
        DatabaseService databaseService,
        CustomItemService customItemService,
        ModHelper modHelper,
        JsonUtil jsonutil,
        ICloner cloner,
        ConfigServer configServer,
        ImageRouter imageRouter
        )
    {
        var modconfig = modConfig.Module.CoreModule.VulcanMod.Config;
        var globals = databaseService.GetGlobals();
        var items = databaseService.GetItems();
        var prices = databaseService.GetPrices();
        globals.Configuration.ItemsCommonSettings.MaxBackpackInserting = 99999999;
        InitVanillaItemEdit(databaseService);
        RemoveBlackAltynLockedCondition(databaseService);
        InitModBaseData(logger, databaseService, customItemService, modHelper, jsonutil, cloner, configServer, imageRouter);
        //var botConfig = configServer.GetConfig<BotConfig>();
        //botConfig.BotRolesWithDogTags.Add("assault");
        if (modconfig.DogTagGenerate.Active)
        {
            InitDogTagFeature(configServer);
        }
        if (modconfig.BotEdit.ReshalaEdit)
        {
            InitReshalaEdit(modconfig, databaseService, modHelper);
        }
        if (modconfig.BotEdit.AddBlackDivision)
        {
            InitBDReplace(modconfig, databaseService, modHelper);
        }
        InitBotEdit(modconfig, databaseService, modHelper);
        if (modconfig.KeyEdit.Active)
        {
            InitKeyEdit(modconfig, databaseService);
        }
        if (modconfig.HideoutEdit.Active)
        {
            InitHideoutAreaEdit(databaseService);
        }
        if (modconfig.HideoutEdit.RevertHideout)
        {
            RevertHideoutFIRRequired(databaseService);
        }
        if (modconfig.HideoutEdit.EnableRecipeEdit)
        {
            InitHideoutRecipeEdit(databaseService);
        }
        if (modconfig.Prestige.Active)
        {
            InitPrestigeEdit(modconfig, databaseService);
        }
        if (modconfig.Misc.CultistCircleSettings.Active)
        {
            InitCultistCircleExtend(modconfig, databaseService, configServer);
        }
        if (modconfig.Misc.BTRSettings.Active)
        {
            InitBTRExtend(modconfig, databaseService);
        }
        if (modconfig.Misc.TransitSettings.Active)
        {
            InitTransitExtend(modconfig, databaseService);
        }
        if (modconfig.Global.Container.Active)
        {
            items[ItemTpl.CONTAINER_STREAMER_ITEM_CASE].Properties.Grids.First().Properties.CellsH = modconfig.Global.Container.TwitchContiner[0];
            items[ItemTpl.CONTAINER_STREAMER_ITEM_CASE].Properties.Grids.First().Properties.CellsV = modconfig.Global.Container.TwitchContiner[1];
        }
        var pocketsjaney = items[VulcanUtil.ConvertHashID("1x2x4口袋")].Properties.Grids.ToList();
        foreach (var grid in pocketsjaney)
        {
            grid.Properties.CellsV = 2;
        }
        items[VulcanUtil.ConvertHashID("1x2x4口袋")].Properties.Grids = pocketsjaney;
        if (modconfig.BotEdit.AddKabanInShoreline)
        {
            AddKabanToShoreline(modconfig, databaseService);
        }
        ForcedUnlockEventQuest(databaseService, configServer);

    }
    public static void InitModBaseData(
        ISptLogger<VulcanCore.VulcanCore> logger,
        DatabaseService databaseService,
        CustomItemService customItemService,
        ModHelper modHelper,
        JsonUtil jsonUtil,
        ICloner cloner,
        ConfigServer configServer,
        ImageRouter imageRouter
        )
    {
        var modName = modConfig.Global.ModName;
        var creator = "<color=#55FFFF>火神重工</color>";
        var modpath = System.IO.Path.Combine(ConfigManager.modPath, $"{ConfigManager.dataPath}vulcanmod/");
        var imagepath = System.IO.Path.Combine(modpath, "res/");
        var iconpath = System.IO.Path.Combine(imagepath, "icon/");
        var questimagepath = System.IO.Path.Combine(imagepath, "questimage/");
        //var items = modHelper.GetJsonDataFromFile<Dictionary<string, CustomItemTemplate>>(pathToMod, "vulcanmod/newitem.json");
        var items_normal = VulcanUtil.ConvertItemData<Dictionary<string, CustomItemTemplate>>(modpath, "items_normal.json", jsonUtil);
        var items_ammochest = VulcanUtil.ConvertItemData<Dictionary<string, CustomItemTemplate>>(modpath, "items_ammochest.json", jsonUtil);
        var items_skillchest = VulcanUtil.ConvertItemData<Dictionary<string, CustomItemTemplate>>(modpath, "items_skillchest.json", jsonUtil);
        //TraderBase traderBase = modHelper.GetJsonDataFromFile<TraderBase>(pathToMod, "vulcanmod/trader/base.json");
        var traderBase = modHelper.GetJsonDataFromFile<TraderBaseWithDesc>(modpath, "trader/base.json");
        var assortData = modHelper.GetJsonDataFromFile<List<CustomAssortData>>(modpath, "traderdata/assort_mod.json");
        var vanillaAssortData = modHelper.GetJsonDataFromFile<List<CustomAssortData>>(modpath, "traderdata/assort_vanilla.json");
        var ammoChestAssortData = modHelper.GetJsonDataFromFile<List<CustomAssortData>>(modpath, "traderdata/assort_ammochest.json");
        var skillChestAssortData = modHelper.GetJsonDataFromFile<List<CustomAssortData>>(modpath, "traderdata/assort_skillchest.json");
        var questData = modHelper.GetJsonDataFromFile<Dictionary<string, CustomQuest>>(modpath, "traderdata/quest/init.json");
        var eventQuestData = modHelper.GetJsonDataFromFile<Dictionary<string, CustomQuest>>(modpath, "traderdata/quest/init_event.json");
        var vanillaRewardData = modHelper.GetJsonDataFromFile<List<CustomQuestRewardData>>(modpath, "traderdata/quest/rewards_vanilla.json");
        var vanillaAchievementRewardData = modHelper.GetJsonDataFromFile<List<CustomQuestRewardData>>(modpath, "traderdata/quest/achievement_rewards_vanilla.json");
        var questLocaleData = modHelper.GetJsonDataFromFile<Dictionary<string, Dictionary<string, CustomQuestLocaleData>>>(modpath, "locales/quest.json");
        var normalLocaleData = modHelper.GetJsonDataFromFile<Dictionary<string, Dictionary<string, string>>>(modpath, "locales/mail.json");
        var questLogicTree = modHelper.GetJsonDataFromFile<Dictionary<string, QuestLogicTree>>(modpath, "traderdata/quest/logic.json");
        var eventQuestLogicTree = modHelper.GetJsonDataFromFile<Dictionary<string, QuestLogicTree>>(modpath, "traderdata/quest/logic_event.json");
        var presetData = modHelper.GetJsonDataFromFile<List<CustomPresetData>>(modpath, "preset.json");
        var normalRecipeData = modHelper.GetJsonDataFromFile<Dictionary<string, CustomRecipeData>>(modpath, "hideout/recipe.json");
        var scavCaseRecipeData = modHelper.GetJsonDataFromFile<Dictionary<string, CustomScavCaseRecipeData>>(modpath, "hideout/scavcase.json");
        var customCustomizationsData = modHelper.GetJsonDataFromFile<Dictionary<string, CustomCustomizationItem>>(modpath, "custom.json");
        var customHideoutCustomizationsData = modHelper.GetJsonDataFromFile<Dictionary<string, CustomHideoutCustomization>>(modpath, "hideout/custom.json");
        var customSuitData = modHelper.GetJsonDataFromFile<List<CustomSuit>>(modpath, "suits.json");
        var customAchievementData = modHelper.GetJsonDataFromFile<List<CustomAchievementData>>(modpath, "traderdata/quest/achievement.json");
        var drawpool = VulcanUtil.ConvertItemData<Dictionary<string, DrawPoolClass>>(modpath, "newdrawpool.json", jsonUtil);
        ItemUtils.InitItem(items_normal, creator, modName, logger, databaseService, cloner, configServer);
        ItemUtils.InitItem(items_ammochest, creator, modName, logger, databaseService, cloner, configServer);
        ItemUtils.InitItem(items_skillchest, creator, modName, logger, databaseService, cloner, configServer);
        TraderUtils.InitTrader(traderBase, imagepath, 100, 3600, 5400, true, creator, modName, configServer, databaseService, cloner, imageRouter);
        QuestUtils.InitQuestData(questData, databaseService, cloner, logger);
        QuestUtils.InitQuestData(eventQuestData, databaseService, cloner, logger);
        AchievementUtils.InitAchievementData(customAchievementData, databaseService, cloner, logger);
        AssortUtils.InitAssortData(assortData, databaseService, cloner, logger);
        AssortUtils.InitAssortData(vanillaAssortData, databaseService, cloner, logger);
        AssortUtils.InitAssortData(ammoChestAssortData, databaseService, cloner, logger);
        AssortUtils.InitAssortData(skillChestAssortData, databaseService, cloner, logger);
        LocaleUtils.InitQuestLocale(questLocaleData, creator, modName, databaseService);
        LocaleUtils.InitLocaleText(normalLocaleData, databaseService);
        ImageUtils.RegisterFolderImageRoute("/files/quest/icon/", questimagepath, imageRouter);
        ImageUtils.RegisterFolderImageRoute("/files/icon/", iconpath, imageRouter);
        QuestUtils.InitQuestLogicTreeData(questLogicTree, databaseService, cloner);
        QuestUtils.InitQuestLogicTreeData(eventQuestLogicTree, databaseService, cloner);
        QuestUtils.InitQuestRewards(vanillaRewardData, databaseService, cloner, logger);
        QuestUtils.InitQuestRewards(vanillaAchievementRewardData, databaseService, cloner, logger);
        PresetUtils.InitPresetData(presetData, databaseService, cloner, logger);
        RecipeUtils.InitRecipeData(normalRecipeData, databaseService, cloner);
        RecipeUtils.InitScavCaseRecipeData(scavCaseRecipeData, databaseService, cloner);
        CustomizationUtils.InitCustomiaztionData(customCustomizationsData, databaseService, cloner);
        CustomizationUtils.InitHideoutCustomiaztionData(customHideoutCustomizationsData, databaseService, cloner);
        SuitUtils.InitCustomSuitData(customSuitData, traderBase.Id, databaseService, cloner);
        ItemUtils.InitDrawPool(drawpool);
        //原版数值修改
        ItemUtils.GetItem(VulcanUtil.ConvertHashID("盒装闪光子弹"), databaseService).Properties.StackSlots.First().MaxCount = 10;
    }
    public static void InitDogTagFeature(ConfigServer configServer)
    {
        var botConfig = configServer.GetConfig<BotConfig>();
        var dogTagConfig = modConfig.Module.CoreModule.VulcanMod.Config.DogTagGenerate;
        var ailist = new List<string>
        {
                "assault",
                "bosstagilla",
                "bosstagillaagro",
                "bossbully",
                "bossboar",
                "bossgluhar",
                "bosssanitar",
                "bosskilla",
                "bosskillaagro",
                "bosskojaniy",
                "bosszryachiy",
                "bosskolontay",
                "bossknight",
                "bosspartisan",
                "followerbigpipe",
                "followerbirdeye",
                "sectantpriest",
                "sectantwarrior",
                "marksman",
                "cursedassault",
                "followerbully",
                "followergluharassault",
                "followergluharscout",
                "followergluharsecurity",
                "followergluharsnipe",
                "followerkolontay",
                "followerboarclose1",
                "followerboarclose2",
                "followerkolontayassault",
                "followerkolontaysecurity",
                "followersanitar",
                "followerboar",
                "pmcbot",
                "exusec",
                "bossboarsniper",
                "arenafighter",
                "arenafighterevent",
                "crazyassaultevent",
                "gifter"
        };
        foreach (var ai in ailist)
        {
            botConfig.BotRolesWithDogTags.Add(ai);
        }
        new BotGeneratorPatch.AddDogtagToBotPatch().Enable();
    }
    public static void InitReshalaEdit(VulcanModConfigClass config, DatabaseService databaseService, ModHelper modHelper)
    {
        var bots = databaseService.GetBots();
        var locations = databaseService.GetLocations();
        var reshala = bots.Types["bossbully"];
        var followerreshala = bots.Types["followerbully"];
        var botReshala = modHelper.GetJsonDataFromFile<BotType>(ConfigManager.modPath, "moddata/vulcanmod/bots/Reshala.json");
        var botFollowerReshala = modHelper.GetJsonDataFromFile<BotType>(ConfigManager.modPath, "moddata/vulcanmod/bots/ReshalaFollower.json");
        reshala.BotChances.EquipmentChances = botReshala.BotChances.EquipmentChances;
        reshala.BotChances.WeaponModsChances = botReshala.BotChances.WeaponModsChances;
        reshala.BotChances.EquipmentModsChances = botReshala.BotChances.EquipmentModsChances;
        reshala.BotExperience.Reward = botReshala.BotExperience.Reward;
        reshala.BotHealth = botReshala.BotHealth;
        reshala.BotInventory = botReshala.BotInventory;
        reshala.BotSkills = botReshala.BotSkills;
        reshala.BotGeneration = botReshala.BotGeneration;
        followerreshala.BotChances.EquipmentChances = botFollowerReshala.BotChances.EquipmentChances;
        followerreshala.BotChances.WeaponModsChances = botFollowerReshala.BotChances.WeaponModsChances;
        followerreshala.BotChances.EquipmentModsChances = botFollowerReshala.BotChances.EquipmentModsChances;
        followerreshala.BotExperience.Reward = botFollowerReshala.BotExperience.Reward;
        followerreshala.BotHealth = botFollowerReshala.BotHealth;
        followerreshala.BotInventory = botFollowerReshala.BotInventory;
        followerreshala.BotSkills = botFollowerReshala.BotSkills;
        followerreshala.BotGeneration = botFollowerReshala.BotGeneration;
        var bossspawn = locations.Bigmap.Base.BossLocationSpawn;
        foreach (var location in bossspawn)
        {
            if (location.BossName == "bossBully")
            {
                location.BossChance = config.BotEdit.ReshalaChance;
            }
        }
    }
    public static void InitBDReplace(VulcanModConfigClass config, DatabaseService databaseService, ModHelper modHelper)
    {
        var bots = databaseService.GetBots();
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
        var bloodhound = bots.Types["arenafighterevent"];
        var zhCNLang = databaseService.GetLocales().Global["ch"];
        var botBDOperator = modHelper.GetJsonDataFromFile<BotType>(ConfigManager.modPath, "moddata/vulcanmod/bots/BDOperator.json");
        bloodhound.BotAppearance = botBDOperator.BotAppearance;
        bloodhound.BotChances.EquipmentChances = botBDOperator.BotChances.EquipmentChances;
        bloodhound.BotChances.WeaponModsChances = botBDOperator.BotChances.WeaponModsChances;
        bloodhound.BotChances.EquipmentModsChances = botBDOperator.BotChances.EquipmentModsChances;
        bloodhound.BotExperience.Reward = botBDOperator.BotExperience.Reward;
        bloodhound.BotHealth = botBDOperator.BotHealth;
        bloodhound.BotInventory = botBDOperator.BotInventory;
        bloodhound.BotSkills = botBDOperator.BotSkills;
        bloodhound.BotGeneration = botBDOperator.BotGeneration;
        zhCNLang.AddTransformer(lang =>
        {
            lang["ScavRole/ArenaFighterEvent"] = "黑色军团";
            return lang;
        });
        foreach (var location in locations)
        {
            var map = location.Base;
            if (map == null) continue;
            var bosslist = map.BossLocationSpawn;
            if (bosslist == null) continue;
            foreach (var boss in bosslist)
            {
                if (boss == null) continue;
                if (boss.BossName == "arenaFighterEvent")
                {
                    boss.BossName = "bossKillaAgro";
                    boss.BossChance = 40;
                }
            }
        }
    }
    public static void InitBotEdit(VulcanModConfigClass config, DatabaseService databaseService, ModHelper modHelper)
    {
        var bots = databaseService.GetBots();
        var sectantpriest = bots.Types["sectantpriest"];
        sectantpriest.BotInventory.Equipment[SPTarkov.Server.Core.Models.Enums.EquipmentSlots.Pockets].Clear();
        sectantpriest.BotInventory.Equipment[SPTarkov.Server.Core.Models.Enums.EquipmentSlots.Pockets].TryAdd("60c7272c204bc17802313365", 1);
        var mchead = config.BotEdit.MCHeadData;
        foreach (var data in mchead)
        {
            foreach (var name in data.Bot)
            {
                var bot = bots.Types[name];
                foreach (var equip in data.Data)
                {
                    bot.BotInventory.Equipment[SPTarkov.Server.Core.Models.Enums.EquipmentSlots.FaceCover].TryAdd(VulcanUtil.ConvertHashID(equip[0]), double.Parse(equip[1]));
                }
            }
        }
    }
    public static void InitKeyEdit(VulcanModConfigClass config, DatabaseService databaseService)
    {
        var items = databaseService.GetItems();
        var keyconfig = config.KeyEdit;
        var blacklist = new List<MongoId>();
        foreach (var k in keyconfig.MachineKeyList.BlackList)
        {
            blacklist.Add(VulcanUtil.ConvertHashID(k));
        }
        foreach (var item in items.Values)
        {
            var itemid = item.Id;
            if (item.Parent == "5c99f98d86f7745c314214b3" && !blacklist.Contains(itemid) && item.Properties != null)
            {
                item.Properties.MaximumNumberOfUsage = keyconfig.MachineKeyCount.Normal == 9999 ? 0 : keyconfig.MachineKeyCount.Normal;
                if (keyconfig.MachineKeyList.Rare.Contains(itemid))
                {
                    item.Properties.MaximumNumberOfUsage = keyconfig.MachineKeyCount.Rare == 9999 ? 0 : keyconfig.MachineKeyCount.Rare;
                }
                if (keyconfig.MachineKeyList.Sectant.Contains(itemid))
                {
                    item.Properties.MaximumNumberOfUsage = keyconfig.MachineKeyCount.Sectant == 9999 ? 0 : keyconfig.MachineKeyCount.Sectant;
                }
                if (keyconfig.MachineKeyList.Special.Contains(itemid))
                {
                    item.Properties.MaximumNumberOfUsage = keyconfig.MachineKeyCount.Special == 9999 ? 0 : keyconfig.MachineKeyCount.Special;
                }
                if (keyconfig.MachineKeyList.Custom1.Contains(itemid))
                {
                    item.Properties.MaximumNumberOfUsage = keyconfig.MachineKeyCount.Custom1 == 9999 ? 0 : keyconfig.MachineKeyCount.Custom1;
                }
                if (keyconfig.MachineKeyList.Custom2.Contains(itemid))
                {
                    item.Properties.MaximumNumberOfUsage = keyconfig.MachineKeyCount.Custom2 == 9999 ? 0 : keyconfig.MachineKeyCount.Custom2;
                }
                if (keyconfig.MachineKeyList.Custom3.Contains(itemid))
                {
                    item.Properties.MaximumNumberOfUsage = keyconfig.MachineKeyCount.Custom3 == 9999 ? 0 : keyconfig.MachineKeyCount.Custom3;
                }
            }
        }
    }
    public static void InitHideoutAreaEdit(DatabaseService databaseService)
    {
        var items = databaseService.GetItems();
        var areas = databaseService.GetHideout().Areas;
        var 蓄电池 = items["5733279d245977289b77ec24"];
        var 坦克电池 = items["5d03794386f77420415576f5"];
        蓄电池.Properties.MaxResource = 40;
        蓄电池.Properties.Resource = 40;
        蓄电池.Parent = "5d650c3e815116009f6201d2";
        坦克电池.Properties.MaxResource = 150;
        坦克电池.Properties.Resource = 150;
        坦克电池.Parent = "5d650c3e815116009f6201d2";
        var solarpower = areas.Find(x => x.Type == SPTarkov.Server.Core.Models.Enums.Hideout.HideoutAreas.SolarPower);
        solarpower.Stages["1"].Bonuses.First().Value = -60;
        var solarpowerrequirement = solarpower.Stages["1"].Requirements;
        solarpowerrequirement.Clear();
        solarpowerrequirement.Add(new SPTarkov.Server.Core.Models.Eft.Hideout.StageRequirement
        {
            TemplateId = "5d0375ff86f774186372f685",
            Count = 8,
            IsFunctional = false,
            IsEncoded = false,
            IsSpawnedInSession = true,
            Type = "Item"
        });
        solarpowerrequirement.Add(new SPTarkov.Server.Core.Models.Eft.Hideout.StageRequirement
        {
            TemplateId = "5d03775b86f774203e7e0c4b",
            Count = 4,
            IsFunctional = false,
            IsEncoded = false,
            IsSpawnedInSession = true,
            Type = "Item"
        });
        solarpowerrequirement.Add(new SPTarkov.Server.Core.Models.Eft.Hideout.StageRequirement
        {
            TemplateId = "5d0378d486f77420421a5ff4",
            Count = 4,
            IsFunctional = false,
            IsEncoded = false,
            IsSpawnedInSession = true,
            Type = "Item"
        });
        solarpowerrequirement.Add(new SPTarkov.Server.Core.Models.Eft.Hideout.StageRequirement
        {
            TemplateId = "6389c85357baa773a825b356",
            Count = 2,
            IsFunctional = false,
            IsEncoded = false,
            IsSpawnedInSession = true,
            Type = "Item"
        });
        solarpowerrequirement.Add(new SPTarkov.Server.Core.Models.Eft.Hideout.StageRequirement
        {
            TemplateId = "5d0376a486f7747d8050965c",
            Count = 2,
            IsFunctional = false,
            IsEncoded = false,
            IsSpawnedInSession = true,
            Type = "Item"
        });
        solarpowerrequirement.Add(new SPTarkov.Server.Core.Models.Eft.Hideout.StageRequirement
        {
            TemplateId = VulcanUtil.ConvertHashID("太阳能模块"),
            Count = 1,
            IsFunctional = false,
            IsEncoded = false,
            IsSpawnedInSession = false,
            Type = "Item"
        });
        solarpowerrequirement.Add(new SPTarkov.Server.Core.Models.Eft.Hideout.StageRequirement
        {
            TemplateId = "5696686a4bdc2da3298b456a",
            Count = 50000,
            IsFunctional = false,
            IsEncoded = false,
            IsSpawnedInSession = true,
            Type = "Item"
        });
        solarpowerrequirement.Add(new SPTarkov.Server.Core.Models.Eft.Hideout.StageRequirement
        {
            AreaType = 4,
            RequiredLevel = 3,
            Type = "Area"
        });
        solarpowerrequirement.Add(new SPTarkov.Server.Core.Models.Eft.Hideout.StageRequirement
        {
            TraderId = VulcanUtil.ConvertHashID("Persicaria"),
            LoyaltyLevel = 4,
            Type = "TraderLoyalty"
        });
        solarpowerrequirement.Add(new SPTarkov.Server.Core.Models.Eft.Hideout.StageRequirement
        {
            TraderId = Traders.MECHANIC,
            LoyaltyLevel = 4,
            Type = "TraderLoyalty"
        });
        solarpower.Stages["1"].ConstructionTime = 259200.0;
        areas.Find(x => x.Type == SPTarkov.Server.Core.Models.Enums.Hideout.HideoutAreas.Generator).Stages["1"].Bonuses.First().Filter.Add(ItemTpl.BARTER_CAR_BATTERY);
        areas.Find(x => x.Type == SPTarkov.Server.Core.Models.Enums.Hideout.HideoutAreas.Generator).Stages["2"].Bonuses.First().Filter.Add(ItemTpl.BARTER_6STEN140M_MILITARY_BATTERY);
        areas.Find(x => x.Type == SPTarkov.Server.Core.Models.Enums.Hideout.HideoutAreas.Generator).Stages["1"].Bonuses.First().Filter.Add(VulcanUtil.ConvertHashID("煤炭"));
        areas.Find(x => x.Type == SPTarkov.Server.Core.Models.Enums.Hideout.HideoutAreas.Generator).Stages["1"].Bonuses.First().Filter.Add(VulcanUtil.ConvertHashID("炼金煤炭"));
        areas.Find(x => x.Type == SPTarkov.Server.Core.Models.Enums.Hideout.HideoutAreas.Generator).Stages["1"].Bonuses.First().Filter.Add(VulcanUtil.ConvertHashID("莫比乌斯燃料"));
        areas.Find(x => x.Type == SPTarkov.Server.Core.Models.Enums.Hideout.HideoutAreas.Generator).Stages["1"].Bonuses.First().Filter.Add(VulcanUtil.ConvertHashID("永恒燃料"));
        areas.Find(x => x.Type == SPTarkov.Server.Core.Models.Enums.Hideout.HideoutAreas.Generator).Stages["1"].Bonuses.First().Filter.Add(VulcanUtil.ConvertHashID("恒星燃料"));
        areas.Find(x => x.Type == SPTarkov.Server.Core.Models.Enums.Hideout.HideoutAreas.Generator).Stages["2"].Bonuses.First().Filter.Add(VulcanUtil.ConvertHashID("能量水晶"));
        areas.Find(x => x.Type == SPTarkov.Server.Core.Models.Enums.Hideout.HideoutAreas.Generator).Stages["3"].Bonuses.First().Filter.Add(VulcanUtil.ConvertHashID("兰波顿水晶"));
        areas.Find(x => x.Type == SPTarkov.Server.Core.Models.Enums.Hideout.HideoutAreas.BitcoinFarm).Stages["3"].Requirements.RemoveAll(r => r.Type == "Area" && r.AreaType == 18);
    }
    public static void RevertHideoutFIRRequired(DatabaseService databaseService)
    {
        var areas = databaseService.GetHideout().Areas;
        foreach (var area in areas)
        {
            if (area.Stages == null) continue;
            foreach (var stage in area.Stages.Values)
            {
                if (stage.Requirements == null) continue;
                foreach (var requirement in stage.Requirements)
                {
                    if (requirement.Type == "Item")
                    {
                        requirement.IsSpawnedInSession = false;
                    }
                }
            }
        }
    }
    public static void InitHideoutRecipeEdit(DatabaseService databaseService)
    {
        var recipes = databaseService.GetHideout().Production.Recipes;
        recipes.Find(x => x.EndProduct == "5e85a9f4add9fe03027d9bf1").Requirements.Add(new SPTarkov.Server.Core.Models.Eft.Hideout.Requirement
        {
            TemplateId = VulcanUtil.ConvertHashID("荧石粉"),
            Count = 1,
            IsFunctional = false,
            IsEncoded = false,
            Type = "Item"
        }); recipes.Find(x => x.EndProduct == "5a0c27731526d80618476ac4").Requirements.Find(r => r.TemplateId == "590c5a7286f7747884343aea").TemplateId = VulcanUtil.ConvertHashID("荧石粉");

    }
    public static void ForcedUnlockEventQuest(DatabaseService databaseService, ConfigServer configServer)
    {
        var eventlist = new List<string>
        {
            "641dbfd7f43eda9d810d7137", //重要伤员
            "64764abcd125ab430a14ccb5", //寻血猎犬
            "647710905320c660d91c15a5", //杀鸡儆猴
            "64916da7ad4e722c106f2345", //东窗事发
            "649af47d717cb30e7e4b5e26", //品酒师
            "655e427b64d09b4122018228", //惩罚者大丰收
            "6672ec2a2b6f3b71be794cc5"  //大妈彩色卡
        };
        var questconfig = configServer.GetConfig<QuestConfig>();
        var quests = databaseService.GetQuests();
        var zhCNLang = databaseService.GetLocales().Global["ch"];
        foreach (var key in eventlist)
        {
            questconfig.EventQuests.Remove(key);
        }
        var 重要伤员 = quests["641dbfd7f43eda9d810d7137"];
        var 寻血猎犬 = quests["64764abcd125ab430a14ccb5"];
        var 东窗事发 = quests["64916da7ad4e722c106f2345"];
        var 品酒师 = quests["649af47d717cb30e7e4b5e26"];
        var 大丰收 = quests["655e427b64d09b4122018228"];
        var smnjtlist = new List<string>
        {
            "59f32bb586f774757e1e8442",
            "59f32c3b86f77472a31742f0",
            "6662ea05f6259762c56f3189",
            "6662e9cda7e0b43baa3d5f76",
            "6662e9f37fa79a6d83730fa0",
            "6662e9aca7e0b43baa3d5f74",
            "6764207f2fa5e32733055c4a",
            "675dc9d37ae1a8792107ca96",
            "6764202ae307804338014c1a",
            "675dcb0545b1a2d108011b2b"
        };
        重要伤员.Conditions.AvailableForFinish[0].OnlyFoundInRaid = true;
        重要伤员.Conditions.AvailableForFinish[0].Value = 100;
        重要伤员.Conditions.AvailableForFinish[1].OnlyFoundInRaid = true;
        重要伤员.Conditions.AvailableForFinish[1].Value = 100;
        寻血猎犬.Conditions.AvailableForFinish[0].Counter.Conditions[0].SavageRole = new List<string> { "exUsec", "pmcBot" };
        东窗事发.Conditions.Fail.Clear();
        品酒师.Conditions.Fail.Clear();
        大丰收.Conditions.AvailableForFinish[1].Target.List.Clear();
        foreach (var key in smnjtlist)
        {
            大丰收.Conditions.AvailableForFinish[1].Target.List.Add(key);
        }
    }
    public static void InitBTRExtend(VulcanModConfigClass config, DatabaseService databaseService)
    {
        var globals = databaseService.GetGlobals();
        var btrsettings = globals.Configuration.BTRSettings;
        var fencesttings = globals.Configuration.FenceSettings;
        if (config.Misc.BTRSettings.FreeDeliver)
        {
            btrsettings.DeliveryMinPrice = 1;
            btrsettings.DeliveryPrice = 1;
            btrsettings.ModDeliveryCost = 0.001;
        }
        foreach (var level in fencesttings.Levels.Values)
        {
            level.DeliveryGridSize.X = config.Misc.BTRSettings.DeliverSpeace[0];
            level.DeliveryGridSize.Y = config.Misc.BTRSettings.DeliverSpeace[1];
        }
    }
    public static void InitTransitExtend(VulcanModConfigClass config, DatabaseService databaseService)
    {
        var globals = databaseService.GetGlobals();
        var transitsettings = globals.Configuration.TransitSettings;
        var fencesttings = globals.Configuration.FenceSettings;
        if (config.Misc.BTRSettings.FreeDeliver)
        {
            transitsettings.DeliveryMinPrice = 1;
            transitsettings.DeliveryPrice = 1;
            transitsettings.ModDeliveryCost = 0.001;
        }
        foreach (var level in fencesttings.Levels.Values)
        {
            level.TransitGridSize.X = config.Misc.TransitSettings.DeliverSpeace[0];
            level.TransitGridSize.Y = config.Misc.TransitSettings.DeliverSpeace[1];
        }
    }
    public static void InitCultistCircleExtend(VulcanModConfigClass config, DatabaseService databaseService, ConfigServer configServer)
    {
        var hideoutconfig = configServer.GetConfig<HideoutConfig>();
        var cultistcircleconfig = hideoutconfig.CultistCircle;
        var items = databaseService.GetItems();
        var cultistcirclecontainer = items["66740c3739b9da6ce402ee65"].Properties.Grids.First();
        cultistcircleconfig.MaxRewardItemCount = config.Misc.CultistCircleSettings.MaxRewardCount;
        cultistcircleconfig.RewardPriceMultiplierMinMax.Min = config.Misc.CultistCircleSettings.RewardPriceMutipler[0];
        cultistcircleconfig.RewardPriceMultiplierMinMax.Max = config.Misc.CultistCircleSettings.RewardPriceMutipler[1];
        cultistcirclecontainer.Properties.CellsH = config.Misc.CultistCircleSettings.CircleSpace[0];
        cultistcirclecontainer.Properties.CellsV = config.Misc.CultistCircleSettings.CircleSpace[1];
        cultistcirclecontainer.Properties.MaxCount = config.Misc.CultistCircleSettings.MaxInputCount;
        if (config.Misc.CultistCircleSettings.RemoveInputItemLimit)
        {
            cultistcirclecontainer.Properties.Filters.First().ExcludedFilter.Clear();
            cultistcirclecontainer.Properties.Filters.First().Filter.Clear();
            cultistcirclecontainer.Properties.Filters.First().Filter.Add("54009119af1c881c07000029");
        }
    }
    public static void InitPrestigeEdit(VulcanModConfigClass config, DatabaseService databaseService)
    {
        var prestigesettings = databaseService.GetTemplates().Prestige.Elements;
        foreach (var prestige in prestigesettings)
        {
            prestige.TransferConfigs.StashConfig.Filters.IncludedItems.Clear();
            if (config.Prestige.RemoveTransferLimit)
            {
                prestige.TransferConfigs.StashConfig.Filters.IncludedItems.Add("54009119af1c881c07000029");
            }
            prestige.TransferConfigs.StashConfig.XCellCount = config.Prestige.PrestigeTransferSetting[0];
            prestige.TransferConfigs.StashConfig.YCellCount = config.Prestige.PrestigeTransferSetting[1];
            prestige.TransferConfigs.SkillConfig.TransferMultiplier = 1 - config.Prestige.PrestigeSkillPersent;
            prestige.TransferConfigs.MasteringConfig.TransferMultiplier = 1 - config.Prestige.PrestigeMasteringPersent;
        }
    }
    public static void InitTips(VulcanModConfigClass config, DatabaseService databaseService, ModHelper modHelper)
    {
        var modpath = System.IO.Path.Combine(ConfigManager.modPath, $"{ConfigManager.dataPath}vulcanmod/");
        var menu = databaseService.GetLocales().Menu["ch"];
        var menulocale = modHelper.GetJsonDataFromFile<List<string>>(modpath, "locales/menu.json");
        var target = VulcanUtil.DrawFromList<string>(menulocale);
        if (config.LoadText.EnableTextColor)
        {
            target = $"<color={config.LoadText.TextColor}>{target}</color>";
        }
        menu["menu"] = new Dictionary<string, string>
        {
            { "206 - Wrong email or password", "邮箱或密码错误" },
            { "213 - Error connecting to auth server", "授权当前不可用，请稍后再试。" },
            { "240 - Servers temporarily unavailable. Please, try later.", "服务器维护中" },
            { "ASSEMBLE", "组装" },
            { "AUTHORIZATION", "授权" },
            { "BATTLEYE_ANTICHEAT_BadServiceVersion", "服务版本错误" },
            { "BATTLEYE_ANTICHEAT_ClientNotResponding", "反作弊连接失败" },
            { "BATTLEYE_ANTICHEAT_CorruptedData", "游戏的完整性验证失败。请重新安装反作弊系统" },
            { "BATTLEYE_ANTICHEAT_CorruptedMemory", "文件损坏。完整性验证失败。请重新安装反作弊系统" },
            { "BATTLEYE_ANTICHEAT_DisallowedProgram", "非法程序正在运行" },
            { "BATTLEYE_ANTICHEAT_FailedToLoadAnticheat", "反作弊载入失败。" },
            { "BATTLEYE_ANTICHEAT_GameRestartRequired", "游戏需要重新启动" },
            { "BATTLEYE_ANTICHEAT_GlobalBan", "该玩家已被BattleEye封禁" },
            { "BATTLEYE_ANTICHEAT_QueryTimeout", "反作弊连接失败。请重新启动游戏" },
            { "BATTLEYE_ANTICHEAT_WinAPIFailure", "关键Windows API调用失败" },
            { "BATTLEYE_ServiceNeedsToBeUpdated", "反作弊版本过时。游戏需要重新启动" },
            { "BATTLEYE_ServiceNotRunningProperly", "反作弊运行不正确。游戏需要重新启动" },
            { "BATTLEYE_UnknownRestartReason", "反作弊运行错误。 游戏需要重新启动" },
            { "EXIT", "退出游戏" },
            { "NEXT", "下一步" },
            { "Place in queue:", "在队列中的位置:" },
            { "Profile data loading...", target },
            { "SABER_ANTICHEAT_AnticheatConnectionFailed", "反作弊连接失败" },
            { "Servers are currently at full capacity", "服务器当前已满载" }
        };
    }
    public static void InitVanillaItemEdit(DatabaseService databaseService)
    {
        var items = databaseService.GetItems();
        var prices = databaseService.GetPrices();

        //原版修改
        //火神头内衬
        items["657bbe73a1c61ee0c303632b"].Properties.ArmorClass = 6;
        items["657bbed0aab96fccee08be96"].Properties.ArmorClass = 6;
        items["657bbefeb30eca9763051189"].Properties.ArmorClass = 6;
        //市场调整
        //762bp
        items["59e0d99486f7744a32234762"].Properties.CanSellOnRagfair = true;
        prices["59e0d99486f7744a32234762"] = 1751;
        //762ap
        items["601aa3d2b2bcb34913271e6d"].Properties.CanSellOnRagfair = true;
        prices["601aa3d2b2bcb34913271e6d"] = 3299;
        //856a1
        prices["59e6906286f7746c9f75e847"] = 695;
        //855a1
        items["54527ac44bdc2d36668b4567"].Properties.CanSellOnRagfair = true;
        prices["54527ac44bdc2d36668b4567"] = 999;
        //m995
        items["59e690b686f7746c9f75e848"].Properties.CanSellOnRagfair = true;
        prices["59e690b686f7746c9f75e848"] = 2999;
        //hybrid
        items["6529243824cbe3c74a05e5c1"].Properties.CanSellOnRagfair = true;
        prices["6529243824cbe3c74a05e5c1"] = 1799;
        //.300M62 
        prices["619636be6db0f2477964e710"] = 599;
        //CBJ
        items["64b8725c4b75259c590fa899"].Properties.CanSellOnRagfair = true;
        prices["64b8725c4b75259c590fa899"] = 1099;
        //AP20
        items["5d6e68a8a4b9360b6c0d54e2"].Properties.CanSellOnRagfair = true;
        //338FMJ
        items["5fc275cf85fd526b824a571a"].Properties.CanSellOnRagfair = true;
        //PS12B 
        items["5cadf6eeae921500134b2799"].Properties.CanSellOnRagfair = true;
        prices["5cadf6eeae921500134b2799"] = 1999;
        //5457n40
        items[ItemTpl.AMMO_545X39_7N40].Properties.CanSellOnRagfair = true;
        prices[ItemTpl.AMMO_545X39_7N40] = 799;
        //545bp
        items["56dfef82d2720bbd668b4567"].Properties.CanSellOnRagfair = true;
        prices["56dfef82d2720bbd668b4567"] = 1099;
        //545bs
        items["56dff026d2720bb8668b4567"].Properties.CanSellOnRagfair = true;
        prices["56dff026d2720bb8668b4567"] = 2599;
        //m62
        items[ItemTpl.AMMO_762X51_M62].Properties.CanSellOnRagfair = true;
        prices[ItemTpl.AMMO_762X51_M62] = 849;
        //m80
        items["58dd3ad986f77403051cba8f"].Properties.CanSellOnRagfair = true;
        prices["58dd3ad986f77403051cba8f"] = 899;
        //pab9 
        items["61962d879bb3d20b0946d385"].Properties.CanSellOnRagfair = true;
        prices["61962d879bb3d20b0946d385"] = 899;
        //sp6
        items["57a0e5022459774d1673f889"].Properties.CanSellOnRagfair = true;
        prices["57a0e5022459774d1673f889"] = 1599;
        //7n12
        items["5c0d688c86f77413ae3407b2"].Properties.CanSellOnRagfair = true;
        prices["5c0d688c86f77413ae3407b2"] = 2999;
        //lps
        prices["5887431f2459777e1612938f"] = 799;
        //7bt1
        items["5e023d34e8a400319a28ed44"].Properties.CanSellOnRagfair = true;
        prices["5e023d34e8a400319a28ed44"] = 1899;
        //m61
        items["5a6086ea4f39f99cd479502f"].Properties.CanSellOnRagfair = true;
        prices["5a6086ea4f39f99cd479502f"] = 1899;
        //366ap
        items["5f0596629e22f464da6bbdd9"].Properties.CanSellOnRagfair = true;
        prices["5f0596629e22f464da6bbdd9"] = 1199;
        //snb
        items["560d61e84bdc2da74d8b4571"].Properties.CanSellOnRagfair = true;
        prices["560d61e84bdc2da74d8b4571"] = 3999;
        //m80a1
        items["6768c25aa7b238f14a08d3f6"].Properties.CanSellOnRagfair = true;
        prices["6768c25aa7b238f14a08d3f6"] = 4999;
        //7n39
        items["5c0d5e4486f77478390952fe"].Properties.CanSellOnRagfair = true;
        prices["5c0d5e4486f77478390952fe"] = 3499;
        //APSX
        items["5ba26835d4351e0035628ff5"].Properties.CanSellOnRagfair = true;
        prices["5ba26835d4351e0035628ff5"] = 2699;
        //武器调整
        //黑dt
        items["5dcbd56fdbd3d91b3e5468d5"].Properties.CanSellOnRagfair = true;
        prices["65290f395ae2ae97b80fdf2d"] = 186666;
        //spear
        items["65290f395ae2ae97b80fdf2d"].Properties.CanSellOnRagfair = true;
        prices["65290f395ae2ae97b80fdf2d"] = 319000;
        //vss
        items["57838ad32459774a17445cd2"].Properties.CanSellOnRagfair = true;
        prices["57838ad32459774a17445cd2"] = 139999;
        //M10
        items["673cab3e03c6a20581028bc1"].Properties.CanSellOnRagfair = true;
        prices["673cab3e03c6a20581028bc1"] = 299999;
        //配件
        //宙斯热成像 
        items["63fc44e2429a8a166c7f61e6"].Properties.CanSellOnRagfair = true;
        prices["63fc44e2429a8a166c7f61e6"] = 699999;
        //Trijicon 
        items["5a1eaa87fcdbcb001865f75e"].Properties.CanSellOnRagfair = true;
        prices["5a1eaa87fcdbcb001865f75e"] = 799999;
        //四眼夜视仪 
        items["5c0558060db834001b735271"].Properties.CanSellOnRagfair = true;
        prices["5c0558060db834001b735271"] = 199999;
        //6.8弹鼓 
        items["6761770e48fa5c377e06fc3c"].Properties.CanSellOnRagfair = true;
        //556弹鼓 
        items["59c1383d86f774290a37e0ca"].Properties.CanSellOnRagfair = true;
        //55660发弹匣
        items["544a37c44bdc2d25388b4567"].Properties.CanSellOnRagfair = true;
        //RS32热成像 
        items["5d1b5e94d7ad1a2b865a96b0"].Properties.CanSellOnRagfair = true;
        prices["5d1b5e94d7ad1a2b865a96b0"] = 799999;
        //插板
        //原色Killa面
        items["5c0919b50db834001b7ce3b9"].Properties.CanSellOnRagfair = true;
        prices["5c0919b50db834001b7ce3b9"] = 89999;
        //火神面
        items["5ca2113f86f7740b2547e1d2"].Properties.CanSellOnRagfair = true;
        //黑阿尔金面罩 
        items["5f60c85b58eff926626a60f7"].Properties.CanSellOnRagfair = true;
        prices["5f60c85b58eff926626a60f7"] = 129999;
        //5级Killa背板
        items["654a4a964b446df1ad03f192"].Properties.CanSellOnRagfair = true;
        prices["654a4a964b446df1ad03f192"] = 119999;
        //BR4 55耐5级陶瓷美板
        items["65573fa5655447403702a816"].Properties.CanSellOnRagfair = true;
        prices["65573fa5655447403702a816"] = 99999;
        //Cult 5级钛美板
        items["656fa8d700d62bcd2e024084"].Properties.CanSellOnRagfair = true;
        prices["656fa8d700d62bcd2e024084"] = 119999;
        //5级复合美板
        items["656fa53d94b480b8a500c0e4"].Properties.CanSellOnRagfair = true;
        prices["656fa53d94b480b8a500c0e4"] = 139999;
        //45耐5级PE美板
        items["656fae5f7c2d57afe200c0d7"].Properties.CanSellOnRagfair = true;
        prices["656fae5f7c2d57afe200c0d7"] = 169999;
        //5级俄甲背板
        items["657b2797c3dbcb01d60c35ea"].Properties.CanSellOnRagfair = true;
        prices["657b2797c3dbcb01d60c35ea"] = 69999;
        //5级俄甲前板
        items["656f664200d62bcd2e024077"].Properties.CanSellOnRagfair = true;
        prices["656f664200d62bcd2e024077"] = 69999;
        //5级俄甲菱形板
        items["656f611f94b480b8a500c0db"].Properties.CanSellOnRagfair = true;
        prices["656f611f94b480b8a500c0db"] = 79999;
        //5级跳弹板
        items["5c0e66e2d174af02a96252f4"].Properties.CanSellOnRagfair = true;
        prices["5c0e66e2d174af02a96252f4"] = 149999;
        //Galvion3级头
        items["5f60b34a41e30a4ab12a6947"].Properties.CanSellOnRagfair = true;
        prices["5f60b34a41e30a4ab12a6947"] = 69999;
        //新钻石头 
        items["65709d2d21b9f815e208ff95"].Properties.CanSellOnRagfair = true;
        prices["65709d2d21b9f815e208ff95"] = 99999;
        //黄fastmt
        items["5ac8d6885acfc400180ae7b0"].Properties.CanSellOnRagfair = true;
        prices["5ac8d6885acfc400180ae7b0"] = 129999;
        //fastmt
        items["5a154d5cfcdbcb001a3b00da"].Properties.CanSellOnRagfair = true;
        prices["5a154d5cfcdbcb001a3b00da"] = 149999;
        //面罩温迪
        items["5e01ef6886f77445f643baa4"].Properties.CanSellOnRagfair = true;
        prices["5e01ef6886f77445f643baa4"] = 233333;
        //温迪
        items["5e00c1ad86f774747333222c"].Properties.CanSellOnRagfair = true;
        prices["5e00c1ad86f774747333222c"] = 139999;
        //黄温迪面
        items["5e01f37686f774773c6f6c15"].Properties.CanSellOnRagfair = true;
        prices["5e01f37686f774773c6f6c15"] = 59999;
        //黑温迪面
        items["5e00cdd986f7747473332240"].Properties.CanSellOnRagfair = true;
        prices["5e00cdd986f7747473332240"] = 69999;
    }
    public static void AddKabanToShoreline(VulcanModConfigClass config, DatabaseService databaseService)
    {
        var shoreline = databaseService.GetLocations().Shoreline.Base;
        shoreline.BossLocationSpawn.Add(new BossLocationSpawn
        {
            BossChance = 30,
            BossDifficulty = "normal",
            BossEscortAmount = "2",
            BossEscortDifficulty = "normal",
            BossEscortType = "followerBoar",
            BossName = "bossBoar",
            IsBossPlayer = false,
            BossZone = "ZoneSmuglers",
            Delay = 0,
            ForceSpawn = false,
            IgnoreMaxBots = true,
            IsRandomTimeSpawn = false,
            SpawnMode = new List<string>
            {
                "regular",
                "pve"
            },
            Supports = new List<BossSupport>
            {
                new BossSupport
                {
                    BossEscortAmount = "0",
                    BossEscortDifficulty = new SPTarkov.Server.Core.Utils.Json.ListOrT<string>(new List<string>
                    {
                        "normal"
                    }, null),
                    BossEscortType = "followerBoar"
                },
                new BossSupport
                {
                    BossEscortAmount = "1",
                    BossEscortDifficulty = new SPTarkov.Server.Core.Utils.Json.ListOrT<string>(new List<string>
                    {
                        "normal"
                    }, null),
                    BossEscortType = "followerBoarClose1"
                },
                new BossSupport
                {
                    BossEscortAmount = "1",
                    BossEscortDifficulty = new SPTarkov.Server.Core.Utils.Json.ListOrT<string>(new List<string>
                    {
                        "normal"
                    }, null),
                    BossEscortType = "followerBoarClose2"
                }
            },
            Time = -1,
            TriggerId = "",
            TriggerName = ""
        });
    }
    public static void RemoveBlackAltynLockedCondition(DatabaseService databaseService)
    {
        var recipes = databaseService.GetHideout().Production.Recipes;
        var quests = databaseService.GetQuests();
        var recipesblackalytn = recipes.Find(recipe => recipe.EndProduct == ItemTpl.HEADWEAR_RYST_BULLETPROOF_HELMET_BLACK);
        recipesblackalytn.Requirements.RemoveAll(requirement => requirement.Type == "QuestComplete");
        recipesblackalytn.Locked = false;
        quests["60e71b62a0beca400d69efc4"].Rewards["Success"].RemoveAll(reward => reward.Type == RewardType.ProductionScheme);
    }
    public static void InitOracleQuestData(DatabaseService databaseService, ISptLogger<VulcanCore.VulcanCore> logger, ICloner cloner)
    {
        var quests = databaseService.GetQuests();
        var oraclequest = quests[VulcanUtil.ConvertHashID("永寂孤芒")];
        var conditions = oraclequest.Conditions.AvailableForFinish;
        var foodsanddrinks = conditions[1].Target.List;
        var medicines = conditions[2].Target.List;
        ItemUtils.AddItemToListByRagfairTag(ERagfairTagsType.食物, foodsanddrinks, databaseService, logger, cloner);
        ItemUtils.AddItemToListByRagfairTag(ERagfairTagsType.饮品, foodsanddrinks, databaseService, logger, cloner);
        ItemUtils.AddItemToListByRagfairTag(ERagfairTagsType.创伤处理, medicines, databaseService, logger, cloner);
        ItemUtils.AddItemToListByRagfairTag(ERagfairTagsType.急救包, medicines, databaseService, logger, cloner);
        ItemUtils.AddItemToListByRagfairTag(ERagfairTagsType.注射器, medicines, databaseService, logger, cloner);
        ItemUtils.AddItemToListByRagfairTag(ERagfairTagsType.药品, medicines, databaseService, logger, cloner);
    }
}