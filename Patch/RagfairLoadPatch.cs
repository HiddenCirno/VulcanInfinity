using System.Reflection;
using System;
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
using System.Text;
using JetBrains.Annotations;
using SPTarkov.Server.Core.Constants;
using System.Runtime.Intrinsics.Arm;
using System.Net;
using System.Text.Json;
using System.Runtime.InteropServices;

namespace VulcanInfinity
{
    public class RagfairLoadPatch : AbstractPatch
    {
        public static bool firststart = false;
        public static ConfigClass modConfig = ConfigManager.GetConfig();
        protected override MethodBase GetTargetMethod()
        {
            return typeof(RagfairServer).GetMethod("Load", BindingFlags.NonPublic | BindingFlags.Public | BindingFlags.Instance);
        }
        [PatchPrefix]
        public static bool Prefix(RagfairServer __instance)
        {
            var jsonUtil = ServiceLocator.ServiceProvider.GetService<JsonUtil>();
            var databaseService = ServiceLocator.ServiceProvider.GetService<DatabaseService>();
            var localeService = ServiceLocator.ServiceProvider.GetService<LocaleService>();
            var logger = ServiceLocator.ServiceProvider.GetService<ISptLogger<VulcanCore.VulcanCore>>();
            var configServer = ServiceLocator.ServiceProvider.GetService<ConfigServer>();
            var cloner = ServiceLocator.ServiceProvider.GetService<ICloner>();
            if (modConfig.Module.CoreModule.MilkCore.Active)
            {
                MilkCore.SetItemFoodData(databaseService);
            }
            if (modConfig.Module.CoreModule.ScriptTrainer.Active)
            {
                ScriptTrainer.Init(logger, databaseService, cloner, configServer);
            }
            if (modConfig.Module.ItemModule.CompressEverything.Active)
            {
                CompressEverything.Init(logger, databaseService, cloner, configServer);
            }
            if (modConfig.Module.ItemModule.GunFight.Active)
            {
                GunFight.AddUpgradeSlot(databaseService);
                if (modConfig.Module.ItemModule.GunFight.Config.DeleteInvisibleReciol)
                {
                    GunFight.DeleteInvisibleRecoil(databaseService);
                }
                if (modConfig.Module.ItemModule.GunFight.Config.CompletelyDeleteRecoil)
                {
                    GunFight.CompleteDeleteRecoil(databaseService);
                }
            }
            //File.WriteAllText(System.IO.Path.Combine(ConfigManager.modPath, "exportquest.json"), jsonUtil.Serialize(databaseService.GetQuests(), true));
            //File.WriteAllText(System.IO.Path.Combine(ConfigManager.modPath, "exportitem.json"), jsonUtil.Serialize(databaseService.GetItems(), true));
            //File.WriteAllText(System.IO.Path.Combine(ConfigManager.modPath, "exportlocale.json"), jsonUtil.Serialize(localeService.GetLocaleDb("ch"), true));
            //VulcanLog.Access("抽卡统计结束", logger);
            return true; 
            // 跳过原始方法，直接使用修改后的逻辑
            //下一目标, scripttrainer, 商人美化, 随身老登, 万物压缩(待议), 和平模式(待议), 战利品升变(待议)
            //物品包要不要加个集束雷呢....要不要呢....
            //回来再说
        }
        [PatchPostfix]
        public static void Postfix(RagfairServer __instance)
        {
            var itemPackConfig = modConfig.Module.ItemModule.ItemPack;
            var vuclcanConfig = modConfig.Module.CoreModule.VulcanMod;
            var logger = ServiceLocator.ServiceProvider.GetService<ISptLogger<VulcanCore.VulcanCore>>();
            var databaseService = ServiceLocator.ServiceProvider.GetService<DatabaseService>();
            var configServer = ServiceLocator.ServiceProvider.GetService<ConfigServer>();
            var cloner = ServiceLocator.ServiceProvider.GetService<ICloner>();
            if (vuclcanConfig.Active)
            {
                ItemUtils.InitFilePackage(VulcanUtil.ConvertHashID("外勤公文包"), databaseService, logger, cloner);
                ItemUtils.InitEquipmentChest(VulcanUtil.ConvertHashID("THICC装备箱"), databaseService, logger, cloner);
                VulcanMod.InitOracleQuestData(databaseService, logger, cloner);
                VulcanMod.FixQuestWeapons(databaseService, logger, cloner);
            }
            if (itemPackConfig.Active)
            {
                ItemUtils.InitFilePackage(VulcanUtil.ConvertHashID("万用文件包"), databaseService, logger, cloner);
            }
            if (modConfig.Module.ItemModule.MEStorage.Active)
            {
                ItemUtils.InitEquipmentChest(VulcanUtil.ConvertHashID("1k装备存储元件"), databaseService, logger, cloner);
                ItemUtils.InitEquipmentChest(VulcanUtil.ConvertHashID("4k装备存储元件"), databaseService, logger, cloner);
                ItemUtils.InitEquipmentChest(VulcanUtil.ConvertHashID("16k装备存储元件"), databaseService, logger, cloner);
                ItemUtils.InitEquipmentChest(VulcanUtil.ConvertHashID("64k装备存储元件"), databaseService, logger, cloner);
                ItemUtils.InitEquipmentChest(VulcanUtil.ConvertHashID("256k装备存储元件"), databaseService, logger, cloner);
                AE2.InitFileFolder(VulcanUtil.ConvertHashID("1k档案存储元件"), databaseService, logger, cloner);
                AE2.InitFileFolder(VulcanUtil.ConvertHashID("4k档案存储元件"), databaseService, logger, cloner);
                AE2.InitFileFolder(VulcanUtil.ConvertHashID("16k档案存储元件"), databaseService, logger, cloner);
                AE2.InitFileFolder(VulcanUtil.ConvertHashID("64k档案存储元件"), databaseService, logger, cloner);
                AE2.InitFileFolder(VulcanUtil.ConvertHashID("256k档案存储元件"), databaseService, logger, cloner);
            }
            if (modConfig.Module.TraderModule.InfinityStorage.Active)
            {
                InfinityStorage.InitAllItemsTrader(databaseService, cloner, logger);
            }
        }
        
    }
}