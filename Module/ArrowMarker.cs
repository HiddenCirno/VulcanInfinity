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
namespace VulcanInfinity;
public class ArrowMarker
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
        var creator = "<color=#F08080>箭头标记</color>";
        var modconfig = modConfig.Module.BattleModule.ArrowMarker.Config;
        var modpath = System.IO.Path.Combine(ConfigManager.modPath, $"{ConfigManager.dataPath}arrowmarker/");
        var items = VulcanUtil.ConvertItemData<Dictionary<string, CustomItemTemplate>>(modpath, "items.json", jsonutil);
        foreach (var item in items)
        {
            if (modconfig.EnableESPMode == true)
            {
                var pathname = item.Value.Props.Prefab.Path;
                if (!pathname.Contains("_spec"))
                {
                    item.Value.Props.Prefab.Path = InsertBeforeDot(pathname, "_xray");
                }
                if (modconfig.EnableSellOnTrader)
                {
                    AssortUtils.AddAssortToTrader(VulcanUtil.ConvertHashID(item.Value.Id), modconfig.TraderID, item.Value.CustomProps.DefaultPrice, databaseService);
                }
            }
        }
        ItemUtils.InitItem(items, creator, modName, logger, databaseService, cloner, configServer);
    }
    public static string InsertBeforeDot(string input, string insert)
    {
        // 使用正则表达式查找最后一个点并插入字符串
        int lastDotIndex = input.LastIndexOf('.');
        if (lastDotIndex == -1)
        {
            // 如果没有找到点，就直接返回原字符串
            return input;
        }
        // 将插入的字符串和点之间插入到最后一个点前
        return input.Substring(0, lastDotIndex) + insert + input.Substring(lastDotIndex);
    }
    public static void AddMarkerToInventory(BotBaseInventory inventory, MongoId itemid, string slot, ISptLogger<BotGenerator> logger)
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
                    SpawnedInSession = false
                }
            });
        }
        else
        {
            items.Template = itemid;
            if (items.Upd != null)
            {
                items.Upd.SpawnedInSession = false;
            }
            else
            {
                items.Upd = new Upd
                {
                    SpawnedInSession = false
                };
            }
        }
        //logger.LogWithColor("尝试生成箭头", LogTextColor.Magenta);
    }
}