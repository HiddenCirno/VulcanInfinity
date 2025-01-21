"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestLog = void 0;
const TestLog = (container) => {
    const logger = container.resolve("PrimaryLogger");
    function testlog(str) {
        console.log(`testlog: ${str}`);
    }
    testlog("zhe shi yi ge ce shi");
};
exports.TestLog = TestLog;
//# sourceMappingURL=test.js.map