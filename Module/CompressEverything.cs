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
public class CompressEverything
{
    public static ConfigClass modConfig = ConfigManager.GetConfig();
    public static void Init(
        ISptLogger<VulcanCore.VulcanCore> logger,
        DatabaseService databaseService,
        ICloner cloner,
        ConfigServer configServer
        )
    {
        var modName = modConfig.Global.ModName;
        var items = databaseService.GetItems();
        var quests = databaseService.GetQuests();
        foreach (var item in items.Values)
        {
            if (item.Properties == null) continue;
            item.Properties.Width = 1;
            item.Properties.Height = 1;
            if (item.Properties.ExtraSizeUp != null)
            {
                item.Properties.ExtraSizeUp = 0;
            }
            if (item.Properties.ExtraSizeDown != null)
            {
                item.Properties.ExtraSizeDown = 0;
            }
            if (item.Properties.ExtraSizeLeft != null)
            {
                item.Properties.ExtraSizeLeft = 0;
            }
            if (item.Properties.ExtraSizeRight != null)
            {
                item.Properties.ExtraSizeRight = 0;
            }
            if (item.Properties.ExtraSizeForceAdd != null)
            {
                item.Properties.ExtraSizeForceAdd = false;
            }
        }
        foreach (var quest in quests.Values)
        {
            var finish = quest.Conditions.AvailableForFinish;
            if(finish!=null && finish.Count > 0)
            {
                finish.ForEach(conditions =>
                {
                    if (conditions.ConditionType == "WeaponAssembly")
                    {
                        if (conditions.Width != null)
                        {
                            conditions.Width.CompareMethod = ">=";
                            conditions.Width.Value = 0;
                        }
                        if (conditions.Height != null)
                        {
                            conditions.Height.CompareMethod = ">=";
                            conditions.Height.Value = 0;
                        }
                    }
                });
            }
        }
    }
}