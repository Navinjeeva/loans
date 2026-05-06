// @ts-nocheck
import { Dimensions, PixelRatio, Platform } from "react-native";
import ExtraDimensions from "react-native-extra-dimensions-android";
import DeviceInfo from "react-native-device-info";
import { isIphoneX } from "react-native-iphone-x-helper";
import { DeviceSizeConst, getDeviceSize } from "./deviceSize";

const deviceWidth = Dimensions.get("screen").width;
const deviceHeight = Dimensions.get("screen").height;

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const width = screenHeight > screenWidth ? screenWidth : screenHeight;
const height = screenHeight < screenWidth ? screenWidth : screenHeight;

export default class DeviceUiInfo {
  static platform = Platform.OS;
  static isIphone = Platform.OS === "ios";
  static isAndroid = Platform.OS === "android";
  static screenSize = { width, height };
  static deviceSize = { deviceWidth, deviceHeight };
  static deviceScreenSize = { screenWidth, screenHeight };
  static screenSizeWithPixelRatio = {
    width: width * PixelRatio.get(),
    height: height * PixelRatio.get(),
  };
  // static guidelineBaseWidth = 350;
  // static guidelineBaseHeight = 680;
  static guidelineBaseWidth = 320;
  static guidelineBaseHeight = 568;
  static isIphoneX = isIphoneX();
  static isTablet: any =
    DeviceInfo && DeviceInfo.isTablet ? DeviceInfo.isTablet() : false;
  static appVersion = DeviceInfo.getVersion();
  static softBarHeight = ExtraDimensions.get("SOFT_MENU_BAR_HEIGHT");
  static statusBarHeight = ExtraDimensions.get("STATUS_BAR_HEIGHT");
  static isIphone5 = !!(
    Platform.OS === "ios" &&
    height === 568 &&
    width === 320
  );
  static storeVersion = null;

  static init() {}

  static getPlatform() {
    return this.platform;
  }
  static getScreenSize() {
    return this.screenSize;
  }
  static getScreenSizeWithPixelRatio() {
    return this.screenSizeWithPixelRatio;
  }
  static isIphoneX() {
    return this.isIphoneX;
  }
  static scale(size) {
    return (this.screenSize.width / this.guidelineBaseWidth) * size;
  }
  static verticalScale(size) {
    return (this.screenSize.height / this.guidelineBaseHeight) * size;
  }
  static deviceScaleType() {
    return getDeviceSize(screenWidth, screenHeight, Platform.OS);
  }
  static scaleType = this.deviceScaleType();
  static moderateScale(size, factor = 0.4) {
    if (
      this.scaleType === DeviceSizeConst.SMALL ||
      this.scaleType === DeviceSizeConst.XSMALL
    ) {
      return size + (this.scale(size) - size) * 0.2;
    } else {
      return size;
    }
  }
  static isSmallDevice() {
    if (
      this.scaleType === DeviceSizeConst.SMALL ||
      this.scaleType === DeviceSizeConst.XSMALL
    ) {
      return true;
    } else {
      return false;
    }
  }
}
