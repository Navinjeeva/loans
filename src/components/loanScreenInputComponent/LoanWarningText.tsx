import { View, Text, Image } from "react-native";
import React from "react";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { alertIcon } from "@src/components/images";

const LoanWarningText = ({
  text,
  style = {},
}: {
  text: string;
  style?: any;
}) => {
  return (
    <View
      style={[
        {
          borderWidth: 1,
          borderColor: "#08A6FF",
          paddingHorizontal: wp(2),
          paddingVertical: hp(1.5),
          backgroundColor: "#E9F5FA90",
          borderStyle: "dashed",
          borderRadius: wp(2),
        },
        style,
      ]}
    >
      <Text
        style={{ textAlign: "center", color: "#606060", fontSize: hp(1.5) }}
      >
        {text}
      </Text>
      <Image
        source={alertIcon}
        style={{
          position: "absolute",
          bottom: -23,
          right: 5,
          height: hp(4),
          width: wp(8),
        }}
      />
    </View>
  );
};

export default LoanWarningText;
