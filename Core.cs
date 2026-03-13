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
using SPTarkov.Server.Core.Controllers;

namespace VulcanInfinity;

/// <summary>
/// This is the replacement for the former package.json data. This is required for all mods.
///
/// This is where we define all the metadata associated with this mod.
/// You don't have to do anything with it, other than fill it out.
/// All properties must be overriden, properties you don't use may be left null.
/// It is read by the mod loader when this mod is loaded.
/// </summary>
public record VulcanInfinity : AbstractModMetadata
{
    /// <summary>
    /// Any string can be used for a modId, but it should ideally be unique and not easily duplicated
    /// a 'bad' ID would be: "mymod", "mod1", "questmod"
    /// It is recommended (but not mandatory) to use the reverse domain name notation,
    /// see: https://docs.oracle.com/javase/tutorial/java/package/namingpkgs.html
    /// </summary>
    public override string ModGuid { get; init; } = "com.hiddenhiragi.vulcaninfinity";

    /// <summary>
    /// The name of your mod
    /// </summary>
    public override string Name { get; init; } = "火神重工-无限";

    /// <summary>
    /// Who created the mod (you!)
    /// </summary>
    public override string Author { get; init; } = "HiddenHiragi";

    /// <summary>
    /// A list of people who helped you create the mod
    /// </summary>
    public override List<string>? Contributors { get; init; }

    /// <summary>
    ///  The version of the mod, follows SEMVER rules (https://semver.org/)
    /// </summary>
    public override SemanticVersioning.Version Version { get; init; } = new("1.0.1");

    /// <summary>
    /// What version of SPT is your mod made for, follows SEMVER rules (https://semver.org/)
    /// </summary>
    public override SemanticVersioning.Range SptVersion { get; init; } = new("~4.0.0");

    /// <summary>
    /// ModIds that you know cause problems with your mod
    /// </summary>
    public override List<string>? Incompatibilities { get; init; }

    /// <summary>
    /// ModIds your mod REQUIRES to function
    /// </summary>
    public override Dictionary<string, SemanticVersioning.Range>? ModDependencies { get; init; } = new()
{
    { "com.hiddenhiragi.vulcancore", new SemanticVersioning.Range(">=1.0.1") }
};
    /// <summary>
    /// Where to find your mod online
    /// </summary>
    public override string? Url { get; init; } = "https://github.com/sp-tarkov/server-mod-examples";

    /// <summary>
    /// Does your mod load bundles? (e.g. new weapon/armor mods)
    /// </summary>
    public override bool? IsBundleMod { get; init; } = true;

    /// <summary>
    /// What Licence does your mod use
    /// </summary>
    public override string? License { get; init; } = "MIT";
}

// We want to load after PreSptModLoader is complete, so we set our type priority to that, plus 1.
[Injectable(TypePriority = OnLoadOrder.PostDBModLoader + 1)]
public class Core(
    ISptLogger<VulcanCore.VulcanCore> logger,
    DatabaseService databaseService,
    CustomItemService customItemService,
    ModHelper modHelper,
    JsonUtil jsonutil,
    ICloner cloner,
    ConfigServer configServer,
    ImageRouter imageRouter
    ) // We inject a logger for use inside our class, it must have the class inside the diamond <> brackets
    : IOnLoad // Implement the IOnLoad interface so that this mod can do something on server load
{
    public string modname = "<color=#AA0000>火</color><color=#FFAA00>神</color><color=#FFFF55>重</color><color=#00AA00>工</color><color=#5555FF> : </color><color=#00AAAA>无</color><color=#AA00AA>限</color>";
    public string modPath = modHelper.GetAbsolutePathToModFolder(Assembly.GetExecutingAssembly());
    public Task OnLoad()
    {
        VulcanLog.Log("不破其旧，无以立新！", logger);
        Thread.Sleep(500);
        VulcanLog.Log("我知晓所有的道路，它们都通往同一个地方。", logger);
        Thread.Sleep(500);
        VulcanLog.Warn("开始执行加载流程……", logger);
        var modConfig = ConfigManager.GetConfig();
        var coreconfigs = configServer.GetConfig<CoreConfig>();
        coreconfigs.Fixes.RemoveInvalidTradersFromProfile = true;
        coreconfigs.Fixes.RemoveModItemsFromProfile = true;
        //coreconfigs.Fixes.FixProfileBreakingInventoryItemIssues = true;
        if (modConfig.Module.CoreModule.VulcanMod.Active)
        {
            VulcanLog.Warn("加载核心模块: 火神重工", logger);
            VulcanMod.Init(logger, databaseService, customItemService, modHelper, jsonutil, cloner, configServer, imageRouter);
            VulcanLog.Access("所有的过去，现在，未来，都将在此合一。", logger);
        }
        if (modConfig.Module.CoreModule.MilkCore.Active)
        {
            VulcanLog.Warn("加载核心模块: 牛奶盒", logger);
            Thread.Sleep(500);
            VulcanLog.Access("每天一苹果，医生远离我。", logger);
        }
        if (modConfig.Module.CoreModule.ScriptTrainer.Active)
        {
            VulcanLog.Warn("加载核心模块: 通用辅助", logger);
            Thread.Sleep(500);
            VulcanLog.Access("战场辅助程序已上线。", logger);
        }
        if (modConfig.Module.TraderModule.InfinityStorage.Active)
        {
            VulcanLog.Warn("加载商人模块: 无限秘库", logger);
            InfinityStorage.Init(logger, databaseService, customItemService, modHelper, jsonutil, cloner, configServer, imageRouter);
            VulcanLog.Access("认证通过，已取得访问权限。", logger);
        }
        if (modConfig.Module.TraderModule.BeautyTrader.Active)
        {
            VulcanLog.Warn("加载商人模块: 商人美化", logger);
            BeautyTrader.Init(logger, databaseService, customItemService, modHelper, jsonutil, cloner, configServer, imageRouter);
            VulcanLog.Access("偶尔换个风格其实也挺好的不是吗", logger);
        }
        if (modConfig.Module.TraderModule.GunSmith.Active)
        {
            VulcanLog.Warn("加载商人模块: 懒人枪匠", logger);
            GunSmith.Init(logger, databaseService, customItemService, modHelper, jsonutil, cloner, configServer, imageRouter);
            VulcanLog.Access("新订单确认，已加入优先生产序列", logger);
        }
        TraderMisc.Init(logger, databaseService, customItemService, modHelper, jsonutil, cloner, configServer, imageRouter);
        if (modConfig.Module.ItemModule.Music.Active)
        {
            VulcanLog.Warn("加载物品模块: 音乐收藏馆", logger);
            Music.Init(logger, databaseService, customItemService, modHelper, jsonutil, cloner, configServer, imageRouter);
            VulcanLog.Access("一阵强劲的音乐响起，你感到充满了决心。", logger);
        }
        if (modConfig.Module.ItemModule.ItemPack.Active)
        {
            VulcanLog.Warn("加载物品模块: 超级物品包", logger);
            ItemPack.Init(logger, databaseService, customItemService, modHelper, jsonutil, cloner, configServer, imageRouter);
            VulcanLog.Access("叮！", logger);
        }
        if (modConfig.Module.ItemModule.GunFight.Active)
        {
            VulcanLog.Warn("加载物品模块: 枪械武术", logger);
            GunFight.Init(logger, databaseService, customItemService, modHelper, jsonutil, cloner, configServer, imageRouter);
            VulcanLog.Access("百般武艺，此乃美式居合法。", logger);
        }
        if (modConfig.Module.ItemModule.MEStorage.Active)
        {
            VulcanLog.Warn("加载物品模块: ME存储", logger);
            AE2.Init(logger, databaseService, customItemService, modHelper, jsonutil, cloner, configServer, imageRouter);
            VulcanLog.Access("应用能源2是MC历史上最伟大的Mod之一。", logger);
        }
        if (modConfig.Module.ItemModule.CompressEverything.Active)
        {
            VulcanLog.Warn("加载物品模块: 万物压缩", logger);
            Thread.Sleep(500);
            VulcanLog.Access("汝掌心中者，寰宇之力也。", logger);
        }
        if (modConfig.Module.BattleModule.ArrowMarker.Active)
        {
            VulcanLog.Warn("加载作战模块: 箭头标记", logger);
            ArrowMarker.Init(logger, databaseService, customItemService, modHelper, jsonutil, cloner, configServer, imageRouter);
            VulcanLog.Access("侦测到未知生命信号，已标记在你的抬头显示上。", logger);
        }
        new BotGeneratorPatch.GenerateBotPatch().Enable();
        GoonWebServer.Start();
        new GoonsTrackerPatch.AdjustGoonMapSpawnsPatch().Enable();
        new RagfairLoadPatch().Enable();
        // We can access the logger and call its methods to log to the server window and the server log file
        //logger.Success("This is a success message");
        //logger.Warning("This is a warning message");
        //logger.Error("This is an error message");
        //logger.Info("This is an info message");
        //logger.Critical("This is a critical message");

        // Logging with colors requires you to 'pass' the text color and background color
        //logger.LogWithColor("This is a message with custom colors", LogTextColor.Red, LogBackgroundColor.Black);
        //logger.Debug("This is a debug message that gets written to the log file, not the console");


        // Inform the server our mod has finished doing work
        return Task.CompletedTask;
    }
    [Injectable]
    public class TestRouter : StaticRouter
    {
        private static HttpResponseUtil _httpResponseUtil;
        private static DatabaseService _databaseService;
        private static RagfairController _ragfairController;
        private static RagfairServer _ragfairServer;
        private static JsonUtil _jsonUtil;
        private static RagfairOfferService _ragfairOfferService;
        private static ItemHelper _itemHelper;
        private static ISptLogger<VulcanCore.VulcanCore> _logger;
        private static ICloner _cloner;
        private static ConfigServer _configServer;
        private static VulcanCore.VulcanCore _vulcanCore;
        public static bool firstlogin = false;
        public static ConfigClass modConfig = ConfigManager.GetConfig();

        public TestRouter(
            JsonUtil jsonUtil,
            HttpResponseUtil httpResponseUtil,
            DatabaseService databaseService,
            RagfairController ragfairController,
            RagfairServer ragfairServer,
            RagfairOfferService ragfairOfferService,
            ItemHelper itemHelper,
            ISptLogger<VulcanCore.VulcanCore> logger,
            ICloner cloner,
            ConfigServer configServer,
            VulcanCore.VulcanCore vulcanCore)
            : base(jsonUtil, GetCustomRoutes())
        {
            _httpResponseUtil = httpResponseUtil;
            _databaseService = databaseService;
            _ragfairController = ragfairController;
            _ragfairOfferService = ragfairOfferService;
            _ragfairServer = ragfairServer;
            _itemHelper = itemHelper;
            _logger = logger;
            _cloner = cloner;
            _configServer = configServer;
            _jsonUtil = jsonUtil;
            _vulcanCore = vulcanCore;
        }

        private static List<RouteAction> GetCustomRoutes()
        {
            return new List<RouteAction>
        {
            new RouteAction(
                "/VulcanCoreClient/ClientStartCall",
                async (url, info, sessionId, output) =>
                    await HandleClientStart(
                        url,
                        sessionId,
                        _jsonUtil,
                        _databaseService,
                        _ragfairController,
                        _ragfairOfferService,
                        _itemHelper,
                        _logger,
                        _cloner,
                        _vulcanCore
                    )
            )
        };
        }
        private static ValueTask<string> HandleClientStart(
            string url,
            MongoId sessionId,
            JsonUtil jsonUtil,
            DatabaseService databaseService,
            RagfairController ragfairController,
            RagfairOfferService ragfairOfferService,
            ItemHelper itemHelper,
            ISptLogger<VulcanCore.VulcanCore> logger,
            ICloner cloner,
            VulcanCore.VulcanCore vulcanCore
            )
        {

            var modHelper = ServiceLocator.ServiceProvider.GetService<ModHelper>();
            if (modConfig.Module.CoreModule.VulcanMod.Config.LoadText.Active)
            {
                VulcanMod.InitTips(modConfig.Module.CoreModule.VulcanMod.Config, databaseService, modHelper);
            }
            VulcanLog.Debug("tips加载日志", logger);
            // 使用 HttpResponseUtil 返回标准格式 JSON
            //string jsonResponse = _httpResponseUtil.GetBody(priceMap);
            //绕过SPT提供的方法直接传递原始数据
            return new ValueTask<string>("Response successful.");
        }
    }
}

