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
public class MilkCore
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
        //这里好像什么都不需要....
    }
    public static void SetItemFoodData(DatabaseService databaseService)
    {
        var items = databaseService.GetItems();
        foreach(var item in items.Values)
        {
            if(IsFood(item.Id, databaseService)){
                var fooddata = GetItemFoodData(item);
                var durability = Caculate(fooddata.Energy, fooddata.Hydration);
                if (durability > 0)
                {
                    item.Properties.MaxResource = durability;
                }
            }
        }
    }
    public static int Caculate(int a, int b)
    {
        if (a == 0)
        {
            return Math.Abs(b);
        }
        if (b == 0)
        {
            return Math.Abs(a);
        }
        // 计算绝对值最大的值
        int max = Math.Max(Math.Abs(a), Math.Abs(b));
        return max;
    }
    public static bool IsFood(MongoId itemid, DatabaseService databaseService)
    {
        var tag = ItemUtils.GetItemRagfairTag(itemid, databaseService);
        if (tag == null)
        {
            return false;
        }
        else if (tag == ERagfairTagsType.食物 || tag == ERagfairTagsType.饮品)
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    public static FoodItemData GetItemFoodData(TemplateItem item)
    {
        var fooddata = new FoodItemData
        {
            Energy = 0,
            Hydration = 0
        };
        var itemdata = item.Properties.EffectsHealth;
        if (itemdata != null)
        {
            itemdata.TryGetValue(HealthFactor.Energy, out var energy);
            itemdata.TryGetValue(HealthFactor.Hydration, out var hydration);
            if (energy != null)
            {
                fooddata.Energy = (int)energy.Value;
            }
            if (hydration != null)
            {
                fooddata.Hydration = (int)hydration.Value;
            }
        }
        return fooddata;
    }
    public class FoodItemData
    {
        public int Energy { get; set; }
        public int Hydration { get; set; }
    }
}