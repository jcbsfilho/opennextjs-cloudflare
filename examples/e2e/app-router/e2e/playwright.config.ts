import { configurePlaywright } from "../../../common/config-e2e";

export default configurePlaywright("app-router", { isCI: !!process.env.CI });
