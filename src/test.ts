import type { DependencyContainer } from "tsyringe";

import type { ILogger } from "@spt/models/spt/utils/ILogger";

export const TestLog = (container: DependencyContainer) => {
    const logger = container.resolve<ILogger>("PrimaryLogger");

   function testlog(str){
    console.log(`testlog: ${str}`)
   }
    testlog("zhe shi yi ge ce shi")
};
