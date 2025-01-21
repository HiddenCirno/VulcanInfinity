import { DependencyContainer } from "tsyringe";
import { PreSptModLoader } from "@spt/loaders/PreSptModLoader";

class VulcanGlobal {
    public static container: DependencyContainer;
    public static preSptModLoader = VulcanGlobal.container.resolve<PreSptModLoader>("PreSptModLoader")
    public static modPath: String = this.preSptModLoader.getModPath("火神重工-无限")
    
}

export {VulcanGlobal}; // 确保这是一个模块而不是全局脚本
