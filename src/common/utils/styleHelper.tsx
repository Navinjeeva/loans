import DeviceInfo from './DeviceInfo';
import {isTablet} from 'react-native-device-info';
import {moderateScale} from 'react-native-size-matters';

const {height, width} = DeviceInfo.screenSize;

export function moderateScaling(val: number) {
  return isTablet && isTablet() ? val : moderateScale(val, 0.2);
}

export function verticalScaling(val: number) {
  return moderateScaling(val);
  // return DeviceInfo.verticalScale(val);
  // TODO: return verticalScale(val);
}

export function getScreenActualWidth() {
  return height > width ? width : height;
}

export function getScreenActualHeight() {
  return height > width ? height : width;
}

export function calculateImageHeight(
  actualWidth = getScreenActualWidth(),
  actualHeight = getScreenActualHeight(),
) {
  // actualWidth = width found in figma
  // actualheight = height found in figma
  // TODO: this function calculates dynamic height responsive for any device for any platform based on ratio
  const aspectRatio = actualHeight / actualWidth;
  return actualWidth * aspectRatio;
}
