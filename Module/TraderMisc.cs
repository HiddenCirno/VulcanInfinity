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
public class TraderMisc
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
        var modconfig = modConfig.Module.TraderModule.Misc;
        var lightkeeper = databaseService.GetTrader(Traders.LIGHTHOUSEKEEPER);
        var btrdriver = databaseService.GetTrader(Traders.BTR);
        if (modconfig.ShowLightkeeperOnTraderPage)
        {
            VulcanLog.Warn("加载商人模块: 随身老登", logger);
            lightkeeper.Base.AvailableInRaid = false;
            lightkeeper.Assort = new TraderAssort
            {
                Items = new List<Item>(),
                BarterScheme = new Dictionary<MongoId, List<List<BarterScheme>>>(),
                LoyalLevelItems = new Dictionary<MongoId, int>()
            };
            VulcanLog.Access("收到来自Lightkeeper的通讯请求, 已自动转接至藏身处", logger);
        }
        if (modconfig.ShowBTRDriverrOnTraderPage)
        {
            VulcanLog.Warn("加载商人模块: 随身司机", logger);
            btrdriver.Base.AvailableInRaid = false;
            btrdriver.Base.UnlockedByDefault = true;
            btrdriver.Assort = new TraderAssort
            {
                Items = new List<Item>(),
                BarterScheme = new Dictionary<MongoId, List<List<BarterScheme>>>(),
                LoyalLevelItems = new Dictionary<MongoId, int>()
            };
            VulcanLog.Access("收到来自BTR司机的通讯请求, 已自动转接至藏身处", logger);
        }
    }
}