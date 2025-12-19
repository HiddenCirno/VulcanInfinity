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
using System.Text.Json.Serialization;
using System.Text.Json;
using System.Xml.Linq;
using static VulcanCore.VulcanUtil;

namespace VulcanInfinity;
public class ConfigManager
{
    public static string modPath = System.IO.Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
    public static string dataPath = "moddata/";
    public static string configJsoncContent = File.ReadAllText(System.IO.Path.Combine(modPath, "config.jsonc"));
    public static ConfigClass GetConfig()
    {
        return JsonSerializer.Deserialize<ConfigClass>(configJsoncContent, new JsonSerializerOptions
        {
            ReadCommentHandling = JsonCommentHandling.Skip // ∆Ù”√◊¢ ÕΩ‚Œˆ
        });
    }
}
public class ConfigClass
{
    [JsonPropertyName("Global")]
    public ConfigGlobalClass Global { get; set; }

    [JsonPropertyName("Module")]
    public ConfigModuleClass Module { get; set; }
}

public class ConfigGlobalClass
{
    [JsonPropertyName("ModName")]
    public string ModName { get; set; }
}

public class ConfigModuleClass
{
    [JsonPropertyName("CoreModule")]
    public CoreModuleClass CoreModule { get; set; }

    [JsonPropertyName("TraderModule")]
    public TraderModuleClass TraderModule { get; set; }

    [JsonPropertyName("ItemModule")]
    public ItemModuleClass ItemModule { get; set; }

    [JsonPropertyName("BattleModule")]
    public BattleModuleClass BattleModule { get; set; }
}

public class CoreModuleClass
{
    [JsonPropertyName("RITC")]
    public RITCClass RITC { get; set; }

    [JsonPropertyName("MilkCore")]
    public MilkCoreClass MilkCore { get; set; }

    [JsonPropertyName("VulcanMod")]
    public VulcanModClass VulcanMod { get; set; }

    [JsonPropertyName("ScriptTrainer")]
    public ScriptTrainerClass ScriptTrainer { get; set; }

    [JsonPropertyName("SystemGift")]
    public SystemGiftClass SystemGift { get; set; }

    [JsonPropertyName("Console")]
    public ConsoleClass Console { get; set; }
}

public class RITCClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }
}

public class MilkCoreClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }
}

public class VulcanModClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("Config")]
    public VulcanModConfigClass Config { get; set; }
}

public class VulcanModConfigClass
{
    [JsonPropertyName("Global")]
    public VulcanGlobalClass Global { get; set; }

    [JsonPropertyName("KeyEdit")]
    public KeyEditClass KeyEdit { get; set; }

    [JsonPropertyName("DogTagGenerate")]
    public DogTagGenerateClass DogTagGenerate { get; set; }

    [JsonPropertyName("BotEdit")]
    public BotEditClass BotEdit { get; set; }

    [JsonPropertyName("HideoutEdit")]
    public HideoutEditClass HideoutEdit { get; set; }

    [JsonPropertyName("Prestige")]
    public PrestigeClass Prestige { get; set; }

    [JsonPropertyName("LoadText")]
    public LoadTextClass LoadText { get; set; }

    [JsonPropertyName("Misc")]
    public VulcanMiscClass Misc { get; set; }
}

public class VulcanGlobalClass
{
    [JsonPropertyName("BagData")]
    public BagDataClass BagData { get; set; }

    [JsonPropertyName("Container")]
    public ContainerClass Container { get; set; }
}

public class BagDataClass
{
    [JsonPropertyName("RagfairTag")]
    public List<string> RagfairTag { get; set; }

    [JsonPropertyName("Item")]
    public List<string> Item { get; set; }
}

public class ContainerClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("Twitch_Continer")]
    public int[] TwitchContiner { get; set; }
}

public class KeyEditClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("MachineKeyCount")]
    public MachineKeyCountClass MachineKeyCount { get; set; }

    [JsonPropertyName("MachineKeyList")]
    public MachineKeyListClass MachineKeyList { get; set; }
}

public class MachineKeyCountClass
{
    [JsonPropertyName("Normal")]
    public int Normal { get; set; }

    [JsonPropertyName("Rare")]
    public int Rare { get; set; }

    [JsonPropertyName("Sectant")]
    public int Sectant { get; set; }

    [JsonPropertyName("Special")]
    public int Special { get; set; }

    [JsonPropertyName("Custom1")]
    public int Custom1 { get; set; }

    [JsonPropertyName("Custom2")]
    public int Custom2 { get; set; }

    [JsonPropertyName("Custom3")]
    public int Custom3 { get; set; }
}

public class MachineKeyListClass
{
    [JsonPropertyName("Rare")]
    public List<string> Rare { get; set; }

    [JsonPropertyName("Sectant")]
    public List<string> Sectant { get; set; }

    [JsonPropertyName("Special")]
    public List<string> Special { get; set; }

    [JsonPropertyName("Custom1")]
    public List<string> Custom1 { get; set; }

    [JsonPropertyName("Custom2")]
    public List<string> Custom2 { get; set; }

    [JsonPropertyName("Custom3")]
    public List<string> Custom3 { get; set; }

    [JsonPropertyName("BlackList")]
    public List<string> BlackList { get; set; }
}

public class DogTagGenerateClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("Config")]
    public DogTagConfigClass Config { get; set; }
}

public class DogTagConfigClass
{
    [JsonPropertyName("AIApplyList")]
    public List<string> AIApplyList { get; set; }

    [JsonPropertyName("BossList")]
    public List<string> BossList { get; set; }
}

public class BotEditClass
{
    [JsonPropertyName("ReshalaEdit")]
    public bool ReshalaEdit { get; set; }

    [JsonPropertyName("ReshalaChance")]
    public int ReshalaChance { get; set; }

    [JsonPropertyName("EnableMCHead")]
    public bool EnableMCHead { get; set; }

    [JsonPropertyName("MCHeadData")]
    public List<MCHeadDataClass> MCHeadData { get; set; }

    [JsonPropertyName("EnableExtraLoot")]
    public bool EnableExtraLoot { get; set; }

    [JsonPropertyName("LootData")]
    public List<LootDataClass> LootData { get; set; }

    [JsonPropertyName("AlterBoss")]
    public AlterBossClass AlterBoss { get; set; }

    [JsonPropertyName("AddKabanInShoreline")]
    public bool AddKabanInShoreline { get; set; }
}

public class MCHeadDataClass
{
    [JsonPropertyName("Bot")]
    public List<string> Bot { get; set; }

    [JsonPropertyName("Data")]
    public List<List<string>> Data { get; set; }

    [JsonPropertyName("ForceGenerate")]
    public bool ForceGenerate { get; set; }
}

public class LootDataClass
{
    [JsonPropertyName("Bot")]
    public List<string> Bot { get; set; }

    [JsonPropertyName("Inventory")]
    public List<string> Inventory { get; set; }

    [JsonPropertyName("Item")]
    public List<List<string>> Item { get; set; }
}

public class AlterBossClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("Chance")]
    public AlterBossChanceClass Chance { get; set; }
}

public class AlterBossChanceClass
{
    [JsonPropertyName("Goons")]
    public int Goons { get; set; }

    [JsonPropertyName("Sanitar")]
    public int Sanitar { get; set; }

    [JsonPropertyName("Gluhar")]
    public int Gluhar { get; set; }

    [JsonPropertyName("Kolontay")]
    public int Kolontay { get; set; }
}

public class HideoutEditClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("EnableRecipeEdit")]
    public bool EnableRecipeEdit { get; set; }

    [JsonPropertyName("EnableModRecipe")]
    public bool EnableModRecipe { get; set; }

    [JsonPropertyName("RevertHideout")]
    public bool RevertHideout { get; set; }
}

public class PrestigeClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("PrestigeTransferSetting")]
    public List<int> PrestigeTransferSetting { get; set; }

    [JsonPropertyName("RemoveTransferLimit")]
    public bool RemoveTransferLimit { get; set; }

    [JsonPropertyName("PrestigeSkillPersent")]
    public double PrestigeSkillPersent { get; set; }

    [JsonPropertyName("PrestigeMasteringPersent")]
    public double PrestigeMasteringPersent { get; set; }
}

public class LoadTextClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("EnableTextColor")]
    public bool EnableTextColor { get; set; }

    [JsonPropertyName("TextColor")]
    public string TextColor { get; set; }
}

public class VulcanMiscClass
{
    [JsonPropertyName("BTRSettings")]
    public BTRSettingsClass BTRSettings { get; set; }

    [JsonPropertyName("TransitSettings")]
    public TransitSettingsClass TransitSettings { get; set; }

    [JsonPropertyName("CultistCircleSettings")]
    public CultistCircleSettingsClass CultistCircleSettings { get; set; }
}

public class BTRSettingsClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("DeliverSpeace")]
    public int[] DeliverSpeace { get; set; }

    [JsonPropertyName("FreeDeliver")]
    public bool FreeDeliver { get; set; }
}

public class TransitSettingsClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("DeliverSpeace")]
    public int[] DeliverSpeace { get; set; }

    [JsonPropertyName("FreeDeliver")]
    public bool FreeDeliver { get; set; }
}

public class CultistCircleSettingsClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("CircleSpace")]
    public int[] CircleSpace { get; set; }

    [JsonPropertyName("RewardPriceMutipler")]
    public double[] RewardPriceMutipler { get; set; }

    [JsonPropertyName("MaxInputCount")]
    public int MaxInputCount { get; set; }

    [JsonPropertyName("MaxRewardCount")]
    public int MaxRewardCount { get; set; }

    [JsonPropertyName("RemoveInputItemLimit")]
    public bool RemoveInputItemLimit { get; set; }
}

public class ScriptTrainerClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("Config")]
    public ScriptTrainerConfigClass Config { get; set; }
}

public class ScriptTrainerConfigClass
{
    [JsonPropertyName("Global")]
    public ScriptTrainerGlobalClass Global { get; set; }

    [JsonPropertyName("Ragfair")]
    public RagfairClass Ragfair { get; set; }

    [JsonPropertyName("Skill")]
    public SkillClass Skill { get; set; }

    [JsonPropertyName("AISpawn")]
    public AISpawnClass AISpawn { get; set; }
}

public class ScriptTrainerGlobalClass
{
    [JsonPropertyName("RemoveFencePunish")]
    public bool RemoveFencePunish { get; set; }

    [JsonPropertyName("RemoveScavCD")]
    public bool RemoveScavCD { get; set; }

    [JsonPropertyName("RemoveQuestCD")]
    public bool RemoveQuestCD { get; set; }

    [JsonPropertyName("EnchantMinSkillLevel")]
    public int EnchantMinSkillLevel { get; set; }

    [JsonPropertyName("EnableFreeHealing")]
    public bool EnableFreeHealing { get; set; }

    [JsonPropertyName("EnableFeatherFall")]
    public bool EnableFeatherFall { get; set; }

    [JsonPropertyName("EnableAllExitPoint")]
    public bool EnableAllExitPoint { get; set; }

    [JsonPropertyName("SetExitPointAlwaysAvaiable")]
    public bool SetExitPointAlwaysAvaiable { get; set; }

    [JsonPropertyName("LootRate")]
    public double LootRate { get; set; }

    [JsonPropertyName("EnableKeepInventory")]
    public bool EnableKeepInventory { get; set; }

    [JsonPropertyName("ForceUnlockAssort")]
    public bool ForceUnlockAssort { get; set; }

    [JsonPropertyName("RemoveTraderStandingRequire")]
    public bool RemoveTraderStandingRequire { get; set; }

    [JsonPropertyName("RemoveTraderMoneyRequire")]
    public bool RemoveTraderMoneyRequire { get; set; }

    [JsonPropertyName("EnableAmmoInsurance")]
    public bool EnableAmmoInsurance { get; set; }

    [JsonPropertyName("EnableEasyExercise")]
    public bool EnableEasyExercise { get; set; }

    [JsonPropertyName("RemoveAmmoWeight")]
    public bool RemoveAmmoWeight { get; set; }

    [JsonPropertyName("AmmoStackMutiple")]
    public double AmmoStackMutiple { get; set; }

    [JsonPropertyName("RubsStackMutiple")]
    public double RubsStackMutiple { get; set; }

    [JsonPropertyName("DollarAndEuroStackMutiple")]
    public double DollarAndEuroStackMutiple { get; set; }

    [JsonPropertyName("GPCoinsStackMutiple")]
    public double GPCoinsStackMutiple { get; set; }
}

public class RagfairClass
{
    [JsonPropertyName("EnableOfferCountEdit")]
    public bool EnableOfferCountEdit { get; set; }

    [JsonPropertyName("OfferCount")]
    public int OfferCount { get; set; }

    [JsonPropertyName("OfferPriceRate")]
    public float OfferPriceRate { get; set; }

    [JsonPropertyName("RagfairLevel")]
    public int RagfairLevel { get; set; }
}

public class SkillClass
{
    [JsonPropertyName("EnableSkillSpeedEdit")]
    public bool EnableSkillSpeedEdit { get; set; }

    [JsonPropertyName("SkillSpeed")]
    public double SkillSpeed { get; set; }

    [JsonPropertyName("RemoveSkillFatigue")]
    public bool RemoveSkillFatigue { get; set; }
}

public class AISpawnClass
{
    [JsonPropertyName("Boss")]
    public BossSpawnClass Boss { get; set; }

    [JsonPropertyName("PMC")]
    public PMCSpawnClass PMC { get; set; }

    [JsonPropertyName("Sectant")]
    public SectantSpawnClass Sectant { get; set; }

    [JsonPropertyName("EnableBlackList")]
    public bool EnableBlackList { get; set; }

    [JsonPropertyName("BlackList")]
    public List<string> BlackList { get; set; }

    [JsonPropertyName("EnablePeacefulMode")]
    public bool EnablePeacefulMode { get; set; }

    [JsonPropertyName("EnableShareMode")]
    public bool EnableShareMode { get; set; }

    [JsonPropertyName("EnableNoobMode")]
    public bool EnableNoobMode { get; set; }
}

public class BossSpawnClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("Chance")]
    public int Chance { get; set; }

    [JsonPropertyName("BossList")]
    public List<string> BossList { get; set; }
}

public class PMCSpawnClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("BearChance")]
    public int BearChance { get; set; }

    [JsonPropertyName("UsecChance")]
    public int UsecChance { get; set; }
}

public class SectantSpawnClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("Chance")]
    public int Chance { get; set; }
}

public class SystemGiftClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }
}

public class ConsoleClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }
}

public class TraderModuleClass
{
    [JsonPropertyName("InfinityStorage")]
    public InfinityStorageClass InfinityStorage { get; set; }

    [JsonPropertyName("GunSmith")]
    public GunSmithClass GunSmith { get; set; }

    [JsonPropertyName("BeautyTrader")]
    public BeautyTraderClass BeautyTrader { get; set; }

    [JsonPropertyName("Misc")]
    public TraderMiscClass Misc { get; set; }
}

public class InfinityStorageClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("Config")]
    public InfinityStorageConfigClass Config { get; set; }
}

public class InfinityStorageConfigClass
{
    [JsonPropertyName("EnableOverridePrice")]
    public bool EnableOverridePrice { get; set; }
    [JsonPropertyName("ShowTraderInTraderPage")]
    public bool ShowTraderInTraderPage { get; set; }

    [JsonPropertyName("MoneySet")]
    [JsonConverter(typeof(MongoIdConverter))]
    public MongoId MoneySet { get; set; }

    [JsonPropertyName("MoneyCount")]
    public int MoneyCount { get; set; }
}

public class GunSmithClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("Config")]
    public GunSmithConfigClass Config { get; set; }
}

public class GunSmithConfigClass
{
    [JsonPropertyName("EnableOverridePrice")]
    public bool EnableOverridePrice { get; set; }

    [JsonPropertyName("MoneySet")]
    [JsonConverter(typeof(MongoIdConverter))]
    public MongoId MoneySet { get; set; }

    [JsonPropertyName("MoneyCount")]
    public int MoneyCount { get; set; }

    [JsonPropertyName("PriceReduceRate")]
    public double PriceReduceRate { get; set; }

    [JsonPropertyName("Trader")]
    [JsonConverter(typeof(MongoIdConverter))]
    public MongoId Trader { get; set; }
}

public class BeautyTraderClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("Config")]
    public BeautyTraderConfigClass Config { get; set; }
}

public class BeautyTraderConfigClass
{
    [JsonPropertyName("TraderData")]
    public Dictionary<string, TraderInfoClass> TraderData { get; set; }
}

public class TraderInfoClass
{
    [JsonPropertyName("TraderID")]
    [JsonConverter(typeof(MongoIdConverter))]
    public MongoId TraderID { get; set; }

    [JsonPropertyName("OverrideTraderImage")]
    public bool OverrideTraderImage { get; set; }

    [JsonPropertyName("TraderImageName")]
    public string TraderImageName { get; set; }

    [JsonPropertyName("OverrideTraderName")]
    public bool OverrideTraderName { get; set; }

    [JsonPropertyName("TraderNameReplace")]
    public List<string> TraderNameReplace { get; set; }
}

public class TraderMiscClass
{
    [JsonPropertyName("ShowLightkeeperOnTraderPage")]
    public bool ShowLightkeeperOnTraderPage { get; set; }

    [JsonPropertyName("ShowBTRDriverrOnTraderPage")]
    public bool ShowBTRDriverrOnTraderPage { get; set; }
}

public class ItemModuleClass
{
    [JsonPropertyName("Music")]
    public MusicClass Music { get; set; }

    [JsonPropertyName("GunFight")]
    public GunFightClass GunFight { get; set; }

    [JsonPropertyName("ItemPack")]
    public ItemPackClass ItemPack { get; set; }

    [JsonPropertyName("MEStorage")]
    public MEStorageClass MEStorage { get; set; }

    [JsonPropertyName("CompressEverything")]
    public CompressEverythingClass CompressEverything { get; set; }

    
}

public class MusicClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("Config")]
    public MusicConfigClass Config { get; set; }
}

public class MusicConfigClass
{
    [JsonPropertyName("EnableSellOnTrader")]
    public bool EnableSellOnTrader { get; set; }

    [JsonPropertyName("TraderID")]
    [JsonConverter(typeof(MongoIdConverter))]
    public MongoId TraderID { get; set; }
}

public class GunFightClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("Config")]
    public GunFightConfigClass Config { get; set; }
}

public class GunFightConfigClass
{
    [JsonPropertyName("EnableSellOnTrader")]
    public bool EnableSellOnTrader { get; set; }

    [JsonPropertyName("TraderID")]
    [JsonConverter(typeof(MongoIdConverter))]
    public MongoId TraderID { get; set; }

    [JsonPropertyName("DeleteInvisibleReciol")]
    public bool DeleteInvisibleReciol { get; set; }

    [JsonPropertyName("CompletelyDeleteRecoil")]
    public bool CompletelyDeleteRecoil { get; set; }
}

public class ItemPackClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("Config")]
    public ItemPackConfigClass Config { get; set; }
}

public class ItemPackConfigClass
{
    [JsonPropertyName("EnableSellOnTrader")]
    public bool EnableSellOnTrader { get; set; }

    [JsonPropertyName("TraderID")]
    [JsonConverter(typeof(MongoIdConverter))]
    public MongoId TraderID { get; set; }
}

public class MEStorageClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("Config")]
    public MEStorageConfigClass Config { get; set; }
}
public class MEStorageConfigClass
{
    [JsonPropertyName("EnableSellOnTrader")]
    public bool EnableSellOnTrader { get; set; }

    [JsonPropertyName("TraderID")]
    [JsonConverter(typeof(MongoIdConverter))]
    public MongoId TraderID { get; set; }
}

public class CompressEverythingClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }
}

public class BattleModuleClass
{
    [JsonPropertyName("ArrowMarker")]
    public ArrowMarkerClass ArrowMarker { get; set; }
}

public class ArrowMarkerClass
{
    [JsonPropertyName("Active")]
    public bool Active { get; set; }

    [JsonPropertyName("Config")]
    public ArrowMarkerConfigClass Config { get; set; }
}

public class ArrowMarkerConfigClass
{
    [JsonPropertyName("EnableSellOnTrader")]
    public bool EnableSellOnTrader { get; set; }

    [JsonPropertyName("TraderID")]
    [JsonConverter(typeof(MongoIdConverter))]
    public MongoId TraderID { get; set; }

    [JsonPropertyName("MarkerData")]
    public List<MarkerDataClass> MarkerData { get; set; }

    [JsonPropertyName("EnableESPMode")]
    public bool EnableESPMode { get; set; }

    [JsonPropertyName("EnableLootableMode")]
    public bool EnableLootableMode { get; set; }

    [JsonPropertyName("EnableSpecialMarker")]
    public bool EnableSpecialMarker { get; set; }
}

public class MarkerDataClass
{
    [JsonPropertyName("type")]
    public string Type { get; set; }

    [JsonPropertyName("bot")]
    public List<string> Bot { get; set; }

    [JsonPropertyName("mark")]
    [JsonConverter(typeof(MongoIdConverter))]
    public MongoId Mark { get; set; }

    [JsonPropertyName("special")]
    [JsonConverter(typeof(MongoIdConverter))]
    public MongoId Special { get; set; }
}
