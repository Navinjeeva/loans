import { useNavigation } from "@react-navigation/native";
import { backIcon } from "../../assets";
import { useTheme } from "@src/common/ThemeContext";
import { Image, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface HeaderProps {
  title: string;
  subTitle?: string;
  onHelpPress?: () => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const Header = ({
  title,
  subTitle,
  onHelpPress,
  showBackButton = true,
  onBackPress,
}: HeaderProps) => {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.header}>
      {showBackButton && (
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Image source={backIcon} style={styles.backIcon} tintColor={"#000"} />
        </TouchableOpacity>
      )}
      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {title}
        </Text>
      </View>
      {onHelpPress && (
        <TouchableOpacity style={styles.helpButton} onPress={onHelpPress}>
          <Text style={[styles.helpIcon, { color: colors.primary }]}>?</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Header;

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      //paddingTop: hp(5),
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingHorizontal: wp(4),
      paddingTop: (Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0) + hp(0),
      paddingBottom: hp(1),
    },
    backButton: {
      alignItems: "center",
      justifyContent: "center",
      //marginRight: wp(4),
      //marginTop: hp(0.5),
    },
    backIcon: {
      width: wp(8),
      height: wp(8),

      fontWeight: "bold",
      tintColor: colors.primary,
      //paddingBottom: hp(0.5),
      //backgroundColor: 'red',
    },
    headerContent: {
      flex: 1,
      alignItems: "center",
    },
    headerTitle: {
      fontSize: hp(2.4),
      fontWeight: "bold",
      textAlign: "center",
    },
    headerSubtitle: {
      fontSize: hp(1.6),
      lineHeight: hp(2.2),
    },
    helpButton: {
      width: wp(8),
      height: wp(8),
      borderRadius: wp(4),
      backgroundColor: colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
      //marginTop: hp(0.5),
    },
    helpIcon: {
      fontSize: hp(2.5),
      fontWeight: "bold",
    },
  });
