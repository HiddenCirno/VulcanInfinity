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
namespace VulcanInfinity;
public class GunFight
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
        var modName = modConfig.Global.ModName;
        var creator = "<color=#DC143C>枪械武术</color>";
        var modconfig = modConfig.Module.ItemModule.GunFight.Config;
        var modpath = System.IO.Path.Combine(ConfigManager.modPath, $"{ConfigManager.dataPath}gunfight/");
        var items = VulcanUtil.ConvertItemData<Dictionary<string, CustomItemTemplate>>(modpath, "items.json", jsonutil);
        var modrecipes = modHelper.GetJsonDataFromFile<Dictionary<string, CustomRecipeData>>(modpath, "recipemod.json");
        var vanillarecipes = modHelper.GetJsonDataFromFile<Dictionary<string, CustomRecipeData>>(modpath, "recipevanilla.json");
        var zhCNLang = databaseService.GetLocales().Global["ch"];
        foreach (var item in items.Values)
        {
            if (modconfig.EnableSellOnTrader)
            {
                AssortUtils.AddAssortToTrader(VulcanUtil.ConvertHashID(item.Id), modconfig.TraderID, item.CustomProps.DefaultPrice, databaseService);
            }
        }
        ItemUtils.InitItem(items, creator, modName, logger, databaseService, cloner, configServer);
        if (modConfig.Module.CoreModule.VulcanMod.Active)
        {
            RecipeUtils.InitRecipeData(modrecipes, databaseService, cloner);
        }
        else
        {
            RecipeUtils.InitRecipeData(vanillarecipes, databaseService, cloner);
        }
        zhCNLang.AddTransformer(lang =>
        {
            var slotkey = "MOD_UPGRADE";
            var pluginskey = "MOD_PLUGINS";
            var pluginsadvkey = "MOD_PLUGINSADV";
            lang[slotkey] = "升级插槽";
            lang[pluginskey] = "基础插件";
            lang[pluginsadvkey] = "神话插件";
            for (var i = 0; i < 20; i++)
            {
                lang[$"{pluginskey}_00{i}"] = "基础插件";
                lang[$"{pluginskey}00{i}"] = "基础插件";
                lang[$"{pluginsadvkey}_00{i}"] = "神话插件";
                lang[$"{pluginsadvkey}00{i}"] = "神话插件";
            }
            return lang;
        });
    }
    public static void AddUpgradeSlot(DatabaseService databaseService)
    {
        var items = databaseService.GetItems();
        foreach (var item in items.Values)
        {
            var itemid = item.Id;
            var ragfairtag = ItemUtils.GetItemRagfairTag(itemid, databaseService);
            if (
                ragfairtag == ERagfairTagsType.冲锋枪 ||
                ragfairtag == ERagfairTagsType.手枪 ||
                ragfairtag == ERagfairTagsType.机枪 ||
                ragfairtag == ERagfairTagsType.栓动式步枪 ||
                ragfairtag == ERagfairTagsType.榴弹发射器 ||
                ragfairtag == ERagfairTagsType.突击卡宾枪 ||
                ragfairtag == ERagfairTagsType.突击步枪 ||
                ragfairtag == ERagfairTagsType.精确射手步枪 ||
                ragfairtag == ERagfairTagsType.霰弹枪 ||
                itemid == ItemTpl.MACHINEGUN_KALASHNIKOV_PKTM_762X54R_MODERNIZED_TANK_MACHINE_GUN ||
                itemid == ItemTpl.MACHINEGUN_AGS30_30X29MM_AUTOMATIC_GRENADE_LAUNCHER ||
                itemid == ItemTpl.MACHINEGUN_NSV_UTYOS_127X108_HEAVY_MACHINE_GUN ||
                itemid == VulcanUtil.ConvertHashID("Ashval")
                )
            {
                if (item.Properties == null) continue;
                if (item.Properties.Slots == null) continue;
                item.Properties.Slots = item.Properties.Slots.AddItem(new Slot
                {
                    Name = "mod_upgrade",
                    Id = VulcanUtil.ConvertHashID($"{itemid}_upgrade"),
                    Parent = itemid,
                    Properties = new SlotProperties
                    {
                        Filters = new List<SlotFilter>
                        {
                            new SlotFilter
                            {
                                Shift = 0,
                                Filter = new HashSet<MongoId>
                                {
                                    VulcanUtil.ConvertHashID("初级升级插槽"),
                                    VulcanUtil.ConvertHashID("中级升级插槽"),
                                    VulcanUtil.ConvertHashID("高级升级插槽"),
                                    VulcanUtil.ConvertHashID("银框初级升级插槽"),
                                    VulcanUtil.ConvertHashID("银框中级升级插槽"),
                                    VulcanUtil.ConvertHashID("银框高级升级插槽"),
                                    VulcanUtil.ConvertHashID("金框初级升级插槽"),
                                    VulcanUtil.ConvertHashID("金框中级升级插槽"),
                                    VulcanUtil.ConvertHashID("金框高级升级插槽"),
                                    VulcanUtil.ConvertHashID("作弊升级插槽")
                                }
                            }
                        }
                    },
                    Required = false,
                    MergeSlotWithChildren = false,
                    Prototype = "55d30c4c4bdc2db4468b457e"
                });
            }
        }
    }
    public static void DeleteInvisibleRecoil(DatabaseService databaseService)
    {
        var recoil = databaseService.GetGlobals().Configuration.Aiming;
        recoil.RecoilBackBonus = 0;
        recoil.RecoilVertBonus = 0;
    }
    public static void CompleteDeleteRecoil(DatabaseService databaseService)
    {
        var recoil = databaseService.GetGlobals().Configuration.Aiming;
        var pos = new XYZ
        {
            X = 0,
            Y = 0,
            Z = 0,
        };
        recoil.RecoilBackBonus = 0;
        recoil.RecoilVertBonus = 0;
        recoil.RecoilScaling = 0;
        recoil.RecoilCrank = false;
        recoil.RecoilXIntensityByPose = pos;
        recoil.RecoilYIntensityByPose = pos;
        recoil.RecoilZIntensityByPose = pos;
    }
}