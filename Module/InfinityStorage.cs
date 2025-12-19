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
public class InfinityStorage
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
        var creator = "<color=#FFD700>无限秘库</color>";
        var modconfig = modConfig.Module.TraderModule.InfinityStorage.Config;
        var modpath = System.IO.Path.Combine(ConfigManager.modPath, "moddata/infinitystorage/");
        var imagepath = System.IO.Path.Combine(modpath, "res/");
        var traderBase = modHelper.GetJsonDataFromFile<TraderBaseWithDesc>(modpath, "base.json");
        if (modconfig.ShowTraderInTraderPage)
        {
            traderBase.AvailableInRaid = false;
        }
        TraderUtils.InitTrader(traderBase, imagepath, 100, 315360000, 315360000, true, creator, modName, configServer, databaseService, cloner, imageRouter);
        //VulcanLog.Debug($"{jsonutil.Serialize(TraderUtils.GetTrader(traderBase.Id, databaseService).Assort)}", logger);
        //回来先把弹药盒自动生成给Assort做了
        //然后是全物品初始化, 预计需要用到cloner, 估计又只能挂到路由上....
        //哎, 静态
        //要不等会试试给Prefix打上ServiceGet看看
        //我觉得可以
        //总之事已至此先出门吧
    }
    public static void InitAllItemsTrader(DatabaseService databaseService, ICloner cloner, ISptLogger<VulcanCore.VulcanCore> logger)
    {
        var items = databaseService.GetItems();
        var traderid = VulcanUtil.ConvertHashID("InfinityStorage");
        var modconfig = modConfig.Module.TraderModule.InfinityStorage.Config;
        var jsonutil = ServiceLocator.ServiceProvider.GetService<JsonUtil>();
        var count = 0;
        foreach (var item in items)
        {
            if (item.Value.Type != "Node" && item.Value.Properties != null)
            {
                var itemid = item.Value.Id;
                var assortid = VulcanUtil.ConvertHashID($"{itemid}_AIT_IS");
                var havepreset = ItemUtils.HavePreset(itemid, databaseService, logger, cloner);
                if (havepreset)
                {
                    var preset = ItemUtils.GetPreset(itemid, $"IS_Preset_{count}", databaseService, logger, cloner);
                    var assortdata = new CustomAssortData
                    {
                        Id = preset[0].Id,
                        Trader = traderid,
                        Item = new List<CustomItem>(),
                        Barter = new Dictionary<string, double>
                    {
                        {
                            modconfig.MoneySet, modconfig.EnableOverridePrice ? modconfig.MoneyCount : ItemUtils.GetPresetPrice(itemid, databaseService, logger, cloner)
                        }
                    },
                        DogTag = new Dictionary<string, CustomDogTag>(),
                        TrustLevel = 1,
                        isWeapon = false
                    };
                    assortdata.Item.Add(new CustomItem
                    {
                        Id = preset[0].Id,
                        Template = preset[0].Template,
                        SlotId = "hideout",
                        ParentId = "hideout",
                        Upd = new Upd
                        {
                            StackObjectsCount = 99999999,
                            UnlimitedCount = true
                        }
                    });
                    if (preset.Count > 1)
                    {
                        for (var i = 1; i < preset.Count; i++)
                        {
                            assortdata.Item.Add(new CustomItem
                            {
                                Id = preset[i].Id,
                                Template = preset[i].Template,
                                ParentId = preset[i].ParentId,
                                SlotId = preset[i].SlotId
                            });
                        }
                    }
                    //VulcanLog.Debug($"{JsonSerializer.Serialize(assortdata)}", logger);
                    //if(count >= 63)
                    //{
                    AssortUtils.InitAssort(assortdata, databaseService, cloner, logger);
                    //VulcanLog.Debug($"{itemid}", logger);
                    //}
                    //VulcanLog.Debug($"{jsonutil.Serialize(assortdata)}", logger);
                    count++;
                    //if (count>=68) break;
                    //我草啊, 我想起来了, 应该是哪个预设有问题
                    //管他呢, 看电影去, 明天再修
                    //明天还得早起看看那个傻逼招聘会怎么个事
                    //打个count二分法调吧哎我草
                }
                if (
                    ItemUtils.GetItemRagfairTag(itemid, databaseService) != ERagfairTagsType.防弹衣 &&
                    ItemUtils.GetItemRagfairTag(itemid, databaseService) != ERagfairTagsType.战术胸挂 &&
                    ItemUtils.GetItemRagfairTag(itemid, databaseService) != ERagfairTagsType.头部装备
                    )
                {
                    var assortdata = new CustomAssortData
                    {
                        Id = assortid,
                        Trader = traderid,
                        Item = new List<CustomItem> {
                        new CustomItem
                        {
                            Id = assortid,
                            Template = itemid,
                            ParentId = "hideout",
                            SlotId = "hideout",
                            Upd = new Upd
                            {
                                StackObjectsCount = 99999999,
                                UnlimitedCount = true
                            }
                        }
                    },
                        Barter = new Dictionary<string, double>
                    {
                        {
                            modconfig.MoneySet, modconfig.EnableOverridePrice ? modconfig.MoneyCount : ItemUtils.GetItemPrice(itemid, databaseService)
                        }
                    },
                        DogTag = new Dictionary<string, CustomDogTag>(),
                        TrustLevel = 1,
                        isWeapon = false
                    };
                    AssortUtils.InitAssort(assortdata, databaseService, cloner, logger);
                }
                else
                {
                    if (!havepreset)
                    {
                        var assortdata = new CustomAssortData
                        {
                            Id = assortid,
                            Trader = traderid,
                            Item = new List<CustomItem> {
                        new CustomItem
                        {
                            Id = assortid,
                            Template = itemid,
                            ParentId = "hideout",
                            SlotId = "hideout",
                            Upd = new Upd
                            {
                                StackObjectsCount = 99999999,
                                UnlimitedCount = true
                            }
                        }
                    },
                            Barter = new Dictionary<string, double>
                    {
                        {
                            modconfig.MoneySet, modconfig.EnableOverridePrice ? modconfig.MoneyCount : ItemUtils.GetItemPrice(itemid, databaseService)
                        }
                    },
                            DogTag = new Dictionary<string, CustomDogTag>(),
                            TrustLevel = 1,
                            isWeapon = false
                        };
                        AssortUtils.InitAssort(assortdata, databaseService, cloner, logger);
                    }
                }
            }
        }
    }
}