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
public class AE2
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
        var creator = "<color=#915DC0>ME存储</color>";
        var modconfig = modConfig.Module.ItemModule.MEStorage.Config;
        var modpath = System.IO.Path.Combine(ConfigManager.modPath, $"{ConfigManager.dataPath}ae2/");
        var items = VulcanUtil.ConvertItemData<Dictionary<string, CustomItemTemplate>>(modpath, "items.json", jsonutil);
        var blacklist = new List<string>
        {
            "ME驱动器",
            "1k存储元件",
            "4k存储元件",
            "16k存储元件",
            "64k存储元件",
            "256k存储元件",
            "1k交换品存储元件",
            "4k交换品存储元件",
            "16k交换品存储元件",
            "64k交换品存储元件",
            "256k交换品存储元件",
            "1k医疗存储元件",
            "4k医疗存储元件",
            "16k医疗存储元件",
            "64k医疗存储元件",
            "256k医疗存储元件",
            "1k装备存储元件",
            "4k装备存储元件",
            "16k装备存储元件",
            "64k装备存储元件",
            "256k装备存储元件",
            "1k武器存储元件",
            "4k武器存储元件",
            "16k武器存储元件",
            "64k武器存储元件",
            "256k武器存储元件",
            "1k食品存储元件",
            "4k食品存储元件",
            "16k食品存储元件",
            "64k食品存储元件",
            "256k食品存储元件",
            "1k档案存储元件",
            "4k档案存储元件",
            "16k档案存储元件",
            "64k档案存储元件",
            "256k档案存储元件"
        };
        ItemUtils.InitItem(items, creator, modName, logger, databaseService, cloner, configServer);
        if (modconfig.EnableSellOnTrader)
        {
            var storage = VulcanUtil.ConvertHashID("ME驱动器");
            var cell1k = VulcanUtil.ConvertHashID("1k存储元件");
            var cell4k = VulcanUtil.ConvertHashID("4k存储元件");
            var cell16k = VulcanUtil.ConvertHashID("16k存储元件");
            var cell64k = VulcanUtil.ConvertHashID("64k存储元件");
            var cell256k = VulcanUtil.ConvertHashID("256k存储元件");
            var exchangecell1k = VulcanUtil.ConvertHashID("1k交换品存储元件");
            var exchangecell4k = VulcanUtil.ConvertHashID("4k交换品存储元件");
            var exchangecell16k = VulcanUtil.ConvertHashID("16k交换品存储元件");
            var exchangecell64k = VulcanUtil.ConvertHashID("64k交换品存储元件");
            var exchangecell256k = VulcanUtil.ConvertHashID("256k交换品存储元件");
            var medicalcell1k = VulcanUtil.ConvertHashID("1k医疗存储元件");
            var medicalcell4k = VulcanUtil.ConvertHashID("4k医疗存储元件");
            var medicalcell16k = VulcanUtil.ConvertHashID("16k医疗存储元件");
            var medicalcell64k = VulcanUtil.ConvertHashID("64k医疗存储元件");
            var medicalcell256k = VulcanUtil.ConvertHashID("256k医疗存储元件");
            var equipmentcell1k = VulcanUtil.ConvertHashID("1k装备存储元件");
            var equipmentcell4k = VulcanUtil.ConvertHashID("4k装备存储元件");
            var equipmentcell16k = VulcanUtil.ConvertHashID("16k装备存储元件");
            var equipmentcell64k = VulcanUtil.ConvertHashID("64k装备存储元件");
            var equipmentcell256k = VulcanUtil.ConvertHashID("256k装备存储元件");
            var weaponcell1k = VulcanUtil.ConvertHashID("1k武器存储元件");
            var weaponcell4k = VulcanUtil.ConvertHashID("4k武器存储元件");
            var weaponcell16k = VulcanUtil.ConvertHashID("16k武器存储元件");
            var weaponcell64k = VulcanUtil.ConvertHashID("64k武器存储元件");
            var weaponcell256k = VulcanUtil.ConvertHashID("256k武器存储元件");
            var foodcell1k = VulcanUtil.ConvertHashID("1k食品存储元件");
            var foodcell4k = VulcanUtil.ConvertHashID("4k食品存储元件");
            var foodcell16k = VulcanUtil.ConvertHashID("16k食品存储元件");
            var foodcell64k = VulcanUtil.ConvertHashID("64k食品存储元件");
            var foodcell256k = VulcanUtil.ConvertHashID("256k食品存储元件");
            var archivecell1k = VulcanUtil.ConvertHashID("1k档案存储元件");
            var archivecell4k = VulcanUtil.ConvertHashID("4k档案存储元件");
            var archivecell16k = VulcanUtil.ConvertHashID("16k档案存储元件");
            var archivecell64k = VulcanUtil.ConvertHashID("64k档案存储元件");
            var archivecell256k = VulcanUtil.ConvertHashID("256k档案存储元件");

            AssortUtils.AddAssortToTrader(storage, modconfig.TraderID, ItemUtils.GetItemPrice(storage, databaseService), 4, databaseService);
            AssortUtils.AddAssortToTrader(cell1k, modconfig.TraderID, ItemUtils.GetItemPrice(cell1k, databaseService), 1, databaseService);
            AssortUtils.AddAssortToTrader(cell4k, modconfig.TraderID, ItemUtils.GetItemPrice(cell4k, databaseService), 2, databaseService);
            AssortUtils.AddAssortToTrader(cell16k, modconfig.TraderID, ItemUtils.GetItemPrice(cell16k, databaseService), 3, databaseService);
            AssortUtils.AddAssortToTrader(cell64k, modconfig.TraderID, ItemUtils.GetItemPrice(cell64k, databaseService), 4, databaseService);

            AssortUtils.AddAssortToTrader(exchangecell1k, modconfig.TraderID, ItemUtils.GetItemPrice(exchangecell1k, databaseService), 1, databaseService);
            AssortUtils.AddAssortToTrader(exchangecell4k, modconfig.TraderID, ItemUtils.GetItemPrice(exchangecell4k, databaseService), 2, databaseService);
            AssortUtils.AddAssortToTrader(exchangecell16k, modconfig.TraderID, ItemUtils.GetItemPrice(exchangecell16k, databaseService), 3, databaseService);
            AssortUtils.AddAssortToTrader(exchangecell64k, modconfig.TraderID, ItemUtils.GetItemPrice(exchangecell64k, databaseService), 4, databaseService);

            AssortUtils.AddAssortToTrader(medicalcell1k, modconfig.TraderID, ItemUtils.GetItemPrice(medicalcell1k, databaseService), 1, databaseService);
            AssortUtils.AddAssortToTrader(medicalcell4k, modconfig.TraderID, ItemUtils.GetItemPrice(medicalcell4k, databaseService), 2, databaseService);
            AssortUtils.AddAssortToTrader(medicalcell16k, modconfig.TraderID, ItemUtils.GetItemPrice(medicalcell16k, databaseService), 3, databaseService);
            AssortUtils.AddAssortToTrader(medicalcell64k, modconfig.TraderID, ItemUtils.GetItemPrice(medicalcell64k, databaseService), 4, databaseService);

            AssortUtils.AddAssortToTrader(equipmentcell1k, modconfig.TraderID, ItemUtils.GetItemPrice(equipmentcell1k, databaseService), 1, databaseService);
            AssortUtils.AddAssortToTrader(equipmentcell4k, modconfig.TraderID, ItemUtils.GetItemPrice(equipmentcell4k, databaseService), 2, databaseService);
            AssortUtils.AddAssortToTrader(equipmentcell16k, modconfig.TraderID, ItemUtils.GetItemPrice(equipmentcell16k, databaseService), 3, databaseService);
            AssortUtils.AddAssortToTrader(equipmentcell64k, modconfig.TraderID, ItemUtils.GetItemPrice(equipmentcell64k, databaseService), 4, databaseService);

            AssortUtils.AddAssortToTrader(weaponcell1k, modconfig.TraderID, ItemUtils.GetItemPrice(weaponcell1k, databaseService), 1, databaseService);
            AssortUtils.AddAssortToTrader(weaponcell4k, modconfig.TraderID, ItemUtils.GetItemPrice(weaponcell4k, databaseService), 2, databaseService);
            AssortUtils.AddAssortToTrader(weaponcell16k, modconfig.TraderID, ItemUtils.GetItemPrice(weaponcell16k, databaseService), 3, databaseService);
            AssortUtils.AddAssortToTrader(weaponcell64k, modconfig.TraderID, ItemUtils.GetItemPrice(weaponcell64k, databaseService), 4, databaseService);

            AssortUtils.AddAssortToTrader(foodcell1k, modconfig.TraderID, ItemUtils.GetItemPrice(foodcell1k, databaseService), 1, databaseService);
            AssortUtils.AddAssortToTrader(foodcell4k, modconfig.TraderID, ItemUtils.GetItemPrice(foodcell4k, databaseService), 2, databaseService);
            AssortUtils.AddAssortToTrader(foodcell16k, modconfig.TraderID, ItemUtils.GetItemPrice(foodcell16k, databaseService), 3, databaseService);
            AssortUtils.AddAssortToTrader(foodcell64k, modconfig.TraderID, ItemUtils.GetItemPrice(foodcell64k, databaseService), 4, databaseService);

            AssortUtils.AddAssortToTrader(archivecell1k, modconfig.TraderID, ItemUtils.GetItemPrice(archivecell1k, databaseService), 1, databaseService);
            AssortUtils.AddAssortToTrader(archivecell4k, modconfig.TraderID, ItemUtils.GetItemPrice(archivecell4k, databaseService), 2, databaseService);
            AssortUtils.AddAssortToTrader(archivecell16k, modconfig.TraderID, ItemUtils.GetItemPrice(archivecell16k, databaseService), 3, databaseService);
            AssortUtils.AddAssortToTrader(archivecell64k, modconfig.TraderID, ItemUtils.GetItemPrice(archivecell64k, databaseService), 4, databaseService);

            ItemUtils.SetExcludeFilter(cell1k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(cell4k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(cell16k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(cell64k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(cell256k, blacklist, databaseService, logger, cloner);

            ItemUtils.SetExcludeFilter(exchangecell1k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(exchangecell4k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(exchangecell16k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(exchangecell64k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(exchangecell256k, blacklist, databaseService, logger, cloner);

            ItemUtils.SetExcludeFilter(medicalcell1k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(medicalcell4k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(medicalcell16k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(medicalcell64k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(medicalcell256k, blacklist, databaseService, logger, cloner);

            ItemUtils.SetExcludeFilter(equipmentcell1k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(equipmentcell4k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(equipmentcell16k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(equipmentcell64k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(equipmentcell256k, blacklist, databaseService, logger, cloner);

            ItemUtils.SetExcludeFilter(weaponcell1k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(weaponcell4k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(weaponcell16k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(weaponcell64k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(weaponcell256k, blacklist, databaseService, logger, cloner);

            ItemUtils.SetExcludeFilter(foodcell1k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(foodcell4k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(foodcell16k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(foodcell64k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(foodcell256k, blacklist, databaseService, logger, cloner);

            ItemUtils.SetExcludeFilter(archivecell1k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(archivecell4k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(archivecell16k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(archivecell64k, blacklist, databaseService, logger, cloner);
            ItemUtils.SetExcludeFilter(archivecell256k, blacklist, databaseService, logger, cloner);
        }
    }
    public static void InitFileFolder(MongoId itemid, DatabaseService databaseService, ISptLogger<VulcanCore.VulcanCore> logger, ICloner cloner)
    {
        var items = databaseService.GetItems();
        items.TryGetValue(itemid, out var targetfilter);
        items.TryGetValue(ItemTpl.CONTAINER_SICC, out var sicc);
        items.TryGetValue(ItemTpl.CONTAINER_DOCUMENTS_CASE, out var file);
        if (targetfilter != null)
        {
            var filter = targetfilter.Properties.Grids.First().Properties.Filters.First().Filter;
            filter.Clear();
            var filelist = file.Properties.Grids.First().Properties.Filters.First().Filter;
            var sicclist = file.Properties.Grids.First().Properties.Filters.First().Filter;
            foreach (var item in filelist)
            {
                if (!filter.Contains(item))
                {
                    filter.Add(item);
                }
            }
            foreach (var item in sicclist)
            {
                if (!filter.Contains(item))
                {
                    filter.Add(item);
                }
            }
        }
    }
}