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
using SPTarkov.Server.Core.Models.Eft.Match;
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
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using VulcanCore;
using static VulcanCore.VulcanUtil;
namespace VulcanInfinity;
public class GunSmith
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
        var modconfig = modConfig.Module.TraderModule.GunSmith.Config;
        var modpath = System.IO.Path.Combine(ConfigManager.modPath, $"{ConfigManager.dataPath}gunsmith/");
        var imagepath = System.IO.Path.Combine(modpath, "res/");
        var presets = modHelper.GetJsonDataFromFile<List<GumSmithPresetData>>(modpath, "preset.json");
        foreach (var preset in presets)
        {
            var price = 0;
            var money = Money.ROUBLES;
            if (modconfig.EnableOverridePrice)
            {
                price = modconfig.MoneyCount;
                money = modconfig.MoneySet;
            }
            else
            {
                var items = ItemUtils.ConvertItemListData(preset.Items, cloner);
                price = ItemUtils.GetPresetPrice(items, databaseService, logger, cloner);
            }
            AssortUtils.AddAssortToTrader(preset.Items, modconfig.Trader, price, 1, money, databaseService, cloner);
        }
    }
    public class GumSmithPresetData
    {
        [JsonPropertyName("Id")]
        [JsonConverter(typeof(MongoIdConverter))]
        public MongoId Id { get; set; }
        [JsonPropertyName("Name")]
        public string Name { get; set; }
        [JsonPropertyName("Root")]
        [JsonConverter(typeof(MongoIdConverter))]
        public MongoId Root { get; set; }
        [JsonPropertyName("Items")]
        public List<CustomItem> Items { get; set; }
    }
}