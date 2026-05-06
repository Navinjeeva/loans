/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
import React from "react";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { createIconSetFromIcoMoon } from "react-native-vector-icons";
import PropTypes from "prop-types";

import DigiAppIconConfig from "@src/components/config/selection.json";

const DigiAppIcon = createIconSetFromIcoMoon(
  DigiAppIconConfig,
  "icomoon",
  "icomoon.ttf"
);

const CustomIcon = (props: any) => {
  if (props.type === "FontAwesome") {
    return <FontAwesome5 {...props} />;
  } else if (props.type === "MaterialIcons") {
    return <MaterialIcons {...props} />;
  } else if (props.name === "home") {
    return <MaterialIcons {...props} />;
  } else if (props.type === "digiApp") {
    return <DigiAppIcon {...props} />;
  } else {
    return <Ionicons {...props} />;
  }
};

CustomIcon.propTypes = {
  type: PropTypes.string,
};

export default CustomIcon;
