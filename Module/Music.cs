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
namespace VulcanInfinity;
public class Music
{
    public static ConfigClass modConfig = ConfigManager.GetConfig();
    public static Dictionary<string, MusicEquipmentData> EquipmentData = new Dictionary<string, MusicEquipmentData>();
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
        var creator = "<color=#C2B5ED>音乐收藏馆</color>";
        var modconfig = modConfig.Module.ItemModule.Music.Config;
        var modpath = System.IO.Path.Combine(ConfigManager.modPath, $"{ConfigManager.dataPath}music/");
        var items = VulcanUtil.ConvertItemData<Dictionary<string, CustomItemTemplate>>(modpath, "items.json", jsonutil);
        var equimentdata = modHelper.GetJsonDataFromFile<Dictionary<string, MusicEquipmentData>>(modpath, "equipdata.json");
        var inventoryitem = databaseService.GetItems()["55d7217a4bdc2d86028b456d"];
        EquipmentData = equimentdata;
        foreach (var item in items.Values)
        {
            inventoryitem.Properties.Slots.FirstOrDefault(x => x.Name == "Earpiece").Properties.Filters.First().Filter.Add(VulcanUtil.ConvertHashID(item.Id));
            inventoryitem.Properties.Slots.FirstOrDefault(x => x.Name == "ArmBand").Properties.Filters.First().Filter.Add(VulcanUtil.ConvertHashID(item.Id));
            if (modconfig.EnableSellOnTrader)
            {
                AssortUtils.AddAssortToTrader(VulcanUtil.ConvertHashID(item.Id), modconfig.TraderID, item.CustomProps.DefaultPrice, databaseService);
            }
        }
        ItemUtils.InitItem(items, creator, modName, logger, databaseService, cloner, configServer);
    }
    public static void AddMusicToInventory(BotBaseInventory inventory, MongoId itemid, string slot, ISptLogger<BotGenerator> logger)
    {
        var items = inventory.Items.FirstOrDefault(x => x.SlotId == slot);
        if (items == null)
        {
            var equipment = (inventory.Equipment.HasValue ? ((string)inventory.Equipment.GetValueOrDefault()) : null);
            //if (equipment != null) logger.LogWithColor(equipment, LogTextColor.Cyan);
            inventory.Items.Add(new Item
            {
                Id = new MongoId(),
                Template = itemid,
                ParentId = equipment,
                SlotId = slot,
                Upd = new Upd
                {
                    SpawnedInSession = true
                }
            });
        }
        else
        {
            items.Template = itemid;
            if (items.Upd != null)
            {
                items.Upd.SpawnedInSession = true;
            }
            else
            {
                items.Upd = new Upd
                {
                    SpawnedInSession = true
                };
            }
        }
        //logger.LogWithColor("尝试生成箭头", LogTextColor.Magenta);
    }
    public class MusicEquipmentData
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }
        [JsonPropertyName("chance")]
        public int Chance { get; set; }
        [JsonPropertyName("equiplist")]
        public Dictionary<string, int> EquipmentList { get; set; }
        [JsonPropertyName("botlist")]
        public List<string> BotList { get; set; }
    }
    public static string WeightedRandom(Dictionary<string, int> weights)
    {
        int totalWeight = 0;
        foreach (var w in weights.Values)
            totalWeight += w;

        Random rand = new Random();
        int roll = rand.Next(0, totalWeight);

        foreach (var kvp in weights)
        {
            roll -= kvp.Value;
            if (roll < 0)
                return kvp.Key;
        }

        return null; // 理论上不可能走到这里
    }
}