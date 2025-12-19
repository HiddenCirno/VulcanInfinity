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
public class BeautyTrader
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
        var modconfig = modConfig.Module.TraderModule.BeautyTrader.Config;
        var modpath = System.IO.Path.Combine(ConfigManager.modPath, $"{ConfigManager.dataPath}beautytrader/");
        var imagepath = System.IO.Path.Combine(modpath, "res/");
        var traders = databaseService.GetTraders();
        var zhCNLang = databaseService.GetLocales().Global["ch"];
        foreach (var trader in traders.Values)
        {
            var traderbase = trader.Base;
            if (traderbase == null) continue;
            var traderid = traderbase.Id;
            foreach (var traderconfig in modconfig.TraderData.Values)
            {
                if (traderconfig.TraderID == traderid)
                {
                    if (traderconfig.OverrideTraderImage)
                    {
                        traderbase.Avatar = $"/files/trader/avatar/{traderconfig.TraderImageName}";
                        ImageUtils.RegisterImageRoute(traderbase.Avatar.Replace(".jpg", "").Replace(".png", ""), System.IO.Path.Combine(imagepath, System.IO.Path.GetFileName(traderbase.Avatar)), imageRouter);
                    }
                    if (traderconfig.OverrideTraderName)
                    {
                        zhCNLang.AddTransformer(lang =>
                        {
                            foreach(var key in lang)
                            {
                                lang[key.Key] = lang[key.Key].Replace(traderconfig.TraderNameReplace[0], traderconfig.TraderNameReplace[1]);
                            }
                            return lang;
                        });
                    }
                }
            }
        }
    }
}