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

namespace VulcanInfinity
{
    public class GoonsTrackerPatch
    {
        public static ConfigClass modConfig = ConfigManager.GetConfig();
        public class AdjustGoonMapSpawnsPatch : AbstractPatch
        {
            public static string GoonsLoation = "";
            protected override MethodBase GetTargetMethod()
            {
                return typeof(LocationLifecycleService).GetMethod("AdjustGoonMapSpawns", BindingFlags.NonPublic | BindingFlags.Public | BindingFlags.Instance);
            }
            [PatchPrefix]
            public static bool Prefix(LocationLifecycleService __instance, HashSet<string>? locationBlacklist = null)
            {
                var logger = ServiceLocator.ServiceProvider.GetService<ISptLogger<LocationLifecycleService>>();
                var databaseService = ServiceLocator.ServiceProvider.GetService<DatabaseService>();
                var configServer = ServiceLocator.ServiceProvider.GetService<ConfigServer>();
                var botConfig = configServer.GetConfig<BotConfig>();
                HashSet<string> locationBlacklist2 = locationBlacklist;
                if (locationBlacklist2 == null)
                {
                    locationBlacklist2 = new HashSet<string> { "hideout", "develop" };
                }

                Dictionary<string, Location> allLocations = databaseService.GetLocations().GetDictionary();
                foreach (var (item, location2) in allLocations)
                {
                    if (locationBlacklist2.Contains(item) || location2?.Base?.BossLocationSpawn == null)
                    {
                        continue;
                    }

                    foreach (BossLocationSpawn item2 in location2.Base.BossLocationSpawn.Where((BossLocationSpawn x) => x.BossName == "bossKnight"))
                    {
                        item2.BossChance = 0.0;
                    }
                }

                DateTime utcNow = DateTime.UtcNow;
                Random random = new Random(utcNow.Year * 1009 + utcNow.Hour);
                Location value;
                List<string> list = botConfig.GoonSpawnSystem.LocationPool.Where((string locationId) => !locationBlacklist2.Contains(locationId) && allLocations.TryGetValue(locationId, out value) && value?.Base?.BossLocationSpawn != null).ToList();
                if (list.Count == 0)
                {
                    logger.Error("Unable to adjust goon spawn chance, no valid locations found");
                    return false;
                }

                string key = list[random.Next(0, list.Count)];
                switch (key)
                {
                    case "woods":
                        GoonWebServer.CurrentMap = "森林";
                        break;
                    case "bigmap":
                        GoonWebServer.CurrentMap = "海关";
                        break;
                    case "shoreline":
                        GoonWebServer.CurrentMap = "海岸线";
                        break;
                    case "lighthouse":
                        GoonWebServer.CurrentMap = "灯塔";
                        break;
                    case "factory4_day":
                        GoonWebServer.CurrentMap = "工厂";
                        break;
                    case "factory4_night":
                        GoonWebServer.CurrentMap = "工厂(夜间)";
                        break;
                    case "interchange":
                        GoonWebServer.CurrentMap = "立交桥";
                        break;
                    case "laboratory":
                        GoonWebServer.CurrentMap = "实验室";
                        break;
                    case "labyrinth":
                        GoonWebServer.CurrentMap = "迷宫";
                        break;
                    case "rezervbase":
                        GoonWebServer.CurrentMap = "储备站";
                        break;
                    case "sandbox":
                        GoonWebServer.CurrentMap = "中心区(新手)";
                        break;
                    case "sandbox_high":
                        GoonWebServer.CurrentMap = "中心区";
                        break;
                    case "tarkovstreets":
                        GoonWebServer.CurrentMap = "塔科夫街区";
                        break;
                    default:
                        GoonWebServer.CurrentMap = key;
                            break;

                }
                foreach (BossLocationSpawn item3 in allLocations[key].Base.BossLocationSpawn.Where((BossLocationSpawn x) => x.BossName == "bossKnight"))
                {
                    item3.BossChance = botConfig.GoonSpawnSystem.SpawnChance;
                }


                return false; // 跳过原始方法，直接使用修改后的逻辑
            }
        }
    }
    public static class GoonWebServer
    {
        private static HttpListener _listener;
        public static string CurrentMap = "未知地点";

        public static void Start()
        {
            _listener = new HttpListener();
            _listener.Prefixes.Add("http://127.0.0.1:9123/");
            _listener.Start();

            Task.Run(async () =>
            {
                while (true)
                {
                    var ctx = await _listener.GetContextAsync();
                    var path = ctx.Request.Url.AbsolutePath;

                    if (path == "/goons")
                    {
                        // 返回 JSON
                        var json = JsonSerializer.Serialize(new
                        {
                            currentMap = CurrentMap,
                            nextRefreshUTC = DateTime.UtcNow.Date.AddHours(DateTime.UtcNow.Hour + 1)
                        });

                        var buffer = Encoding.UTF8.GetBytes(json);
                        ctx.Response.ContentType = "application/json";
                        ctx.Response.OutputStream.Write(buffer, 0, buffer.Length);
                    }
                    else if (path == "/bg")
                    {
                        // 读取图片文件
                        var filePath = System.IO.Path.Combine(ConfigManager.modPath, "trackerbackground.png"); // 如果你放在 web 文件夹
                        if (File.Exists(filePath))
                        {
                            var bytes = File.ReadAllBytes(filePath);
                            ctx.Response.ContentType = "image/png"; // 或者 image/png，取决于图片类型
                            ctx.Response.OutputStream.Write(bytes, 0, bytes.Length);
                        }
                        else
                        {
                            ctx.Response.StatusCode = 404;
                            var msg = Encoding.UTF8.GetBytes("File not found");
                            ctx.Response.OutputStream.Write(msg, 0, msg.Length);
                        }
                    }
                    else
                    {
                        // 返回网页 HTML
                        var html = @"
<!DOCTYPE html>
<html>
<head>
<meta charset=""utf-8"">
<title>GoonsTracker</title>
<style>
html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #94784d;
    overflow: hidden;
}

/* 背景层：全屏高强度模糊，填充边缘 */
body::before {
    content: """";
    position: absolute;
    top:0; left:0; right:0; bottom:0;
    background-color: #000; /* 黑色填充，避免模糊扩展产生白色 */
    background: url(""/bg"") center center no-repeat;
    background-size: 125% 125%;
    filter: blur(25px);
    z-index: -2;
}

/* 主背景：居中完整显示，低模糊 */
body::after {
    content: """";
    position: fixed;
    top:0; left:0; right:0; bottom:0;
    background: url(""/bg"") center center no-repeat;
    background-size: contain;
    filter: blur(2px);
    z-index: -1;
}

/* 页面内容窗口 */
.container {
    position: absolute;      /* 使用绝对定位 + transform 居中 */
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    
    z-index: 1;
    background: rgba(0,0,0,0.8); /* 背景加深 */
    padding: 40px 60px;
    border: 3px solid #94784d;   /* 描边 */
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

/* 标题样式 */
h1 {
    font-size: 32px;
    margin-bottom: 20px;
    font-weight: 600;
    color: #94784d;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}

/* 地图名字 */
#map {
    font-size: 52px;
    font-weight: bold;
    margin-top: 15px;
    color: #00ff00;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}
</style>
</head>
<body>

<div class=""container"">
    <h1>Goons小队当前位于</h1>
    <div id=""map"">加载中...</div>
</div>

<script>
async function refresh() {
    const res = await fetch('/goons');
    const data = await res.json();
    document.getElementById('map').innerText = data.currentMap;
}
setInterval(refresh, 5000);
refresh();
</script>

</body>
</html>";


                        var buffer = Encoding.UTF8.GetBytes(html);
                        ctx.Response.ContentType = "text/html";
                        ctx.Response.OutputStream.Write(buffer, 0, buffer.Length);
                    }
                    ctx.Response.OutputStream.Close();
                }
            });
        }
    }
}