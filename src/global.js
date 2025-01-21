"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VulcanGlobal = void 0;
class VulcanGlobal {
    static container;
    static preSptModLoader = VulcanGlobal.container.resolve("PreSptModLoader");
    static modPath = this.preSptModLoader.getModPath("火神重工-无限");
}
exports.VulcanGlobal = VulcanGlobal;
//# sourceMappingURL=global.js.map