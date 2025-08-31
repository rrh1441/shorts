import { Config } from "@remotion/cli/config";
import { webpackOverride } from "./remotion-webpack-override";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig((current) => webpackOverride(current));
